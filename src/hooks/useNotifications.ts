"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { requestForToken, onMessageListener } from "@/lib/firebase/client";
import type { AppNotification } from "@/types";
import { useToast } from "@/context/ToastContext";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const { showToast } = useToast();
    const supabase = createClient();

    const [userState, setUserState] = useState<{ id: string; isAdmin: boolean } | null>(null);

    useEffect(() => {
        setAudio(new Audio(NOTIFICATION_SOUND_URL));
    }, []);

    const playNotificationSound = useCallback(() => {
        if (audio) {
            audio.play().catch((e) => console.log("Audio play failed:", e));
        }
    }, [audio]);

    // 1. Fetch user & role once on mount
    useEffect(() => {
        let isMounted = true;
        const initUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user || !isMounted) {
                    setLoading(false);
                    return;
                }

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", user.id)
                    .single();

                if (isMounted) {
                    setUserState({ id: user.id, isAdmin: profile?.role === "admin" });
                }
            } catch (err) {
                console.error("Error initializing user for notifications:", err);
                if (isMounted) setLoading(false);
            }
        };

        initUser();
        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Fetch notifications once user is loaded
    const fetchNotifications = useCallback(async () => {
        if (!userState) return;

        const query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);

        if (userState.isAdmin) {
            query.or(`user_id.eq.${userState.id},user_id.is.null`);
        } else {
            query.eq("user_id", userState.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching notifications:", error);
        } else if (data) {
            setNotifications(data as AppNotification[]);
            setUnreadCount(data.filter((n) => !n.is_read).length);
        }
        setLoading(false);
    }, [userState]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // 3. Supabase Realtime Subscription
    useEffect(() => {
        if (!userState) return;

        // Use a unique channel name per user to avoid cross-user conflicts.
        // For admins, also subscribe to the broadcast channel (user_id IS NULL rows).
        const channelName = `notifications-user-${userState.id}`;

        // Build filter: admins watch their own rows; regular users watch their own rows.
        // For admin broadcast rows (user_id IS NULL), we fall back to a second channel.
        const userFilter = `user_id=eq.${userState.id}`;

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: userFilter,
                },
                (payload) => {
                    const newNotification = payload.new as AppNotification;
                    setNotifications((prev) => {
                        if (prev.some((n) => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });
                    setUnreadCount((prev) => prev + 1);
                    showToast(newNotification.title, "info");
                    playNotificationSound();
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                    filter: userFilter,
                },
                (payload) => {
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === payload.new.id ? { ...n, ...payload.new } : n))
                    );
                }
            )
            .subscribe((status) => {
                console.log(`[Supabase Realtime] ${channelName} status:`, status);
            });

        // Admins also subscribe to broadcast (user_id IS NULL) notifications
        let adminChannel: ReturnType<typeof supabase.channel> | null = null;
        if (userState.isAdmin) {
            adminChannel = supabase
                .channel("notifications-admin-broadcast")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                        filter: "user_id=is.null",
                    },
                    (payload) => {
                        const newNotification = payload.new as AppNotification;
                        setNotifications((prev) => {
                            if (prev.some((n) => n.id === newNotification.id)) return prev;
                            return [newNotification, ...prev];
                        });
                        setUnreadCount((prev) => prev + 1);
                        showToast(newNotification.title, "info");
                        playNotificationSound();
                    }
                )
                .subscribe((status) => {
                    console.log("[Supabase Realtime] admin-broadcast status:", status);
                });
        }

        return () => {
            supabase.removeChannel(channel);
            if (adminChannel) supabase.removeChannel(adminChannel);
        };
    }, [userState, showToast, playNotificationSound]);

    // 3b. Socket.IO Realtime Connection
    useEffect(() => {
        if (!userState) return;

        let socket: any = null;
        // Dynamically import socket.io-client to ensure clean SSR compatibility
        import("socket.io-client")
            .then(({ io }) => {
                socket = io(process.env.NEXT_PUBLIC_SITE_URL || "/", {
                    path: "/socket.io",
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    transports: ["websocket", "polling"],
                });

                socket.on("connect", () => {
                    console.log("[Socket.IO] Connected:", socket.id);
                    if (userState.isAdmin) {
                        socket.emit("join-admin");
                    }
                    socket.emit("join-user", userState.id);
                });

                socket.on("connect_error", (err: Error) => {
                    console.warn("[Socket.IO] Connection error (custom server may not be running):", err.message);
                });

                socket.on("notification", (newNotification: AppNotification) => {
                    setNotifications((prev) => {
                        if (prev.some((n) => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });
                    setUnreadCount((prev) => prev + 1);
                    showToast(newNotification.title, "info");
                    playNotificationSound();
                });
            })
            .catch((err) => {
                console.warn("[Socket.IO] Client import warning:", err);
            });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [userState, showToast, playNotificationSound]);

    // 4. FCM Push Notification Setup
    useEffect(() => {
        if (!userState) return;

        const setupFCM = async () => {
            try {
                if (Notification.permission === "default") {
                    const permission = await Notification.requestPermission();
                    if (permission !== "granted") return;
                } else if (Notification.permission === "denied") {
                    return;
                }

                const token = await requestForToken().catch((tokenErr) => {
                    console.warn("[FCM] Push token request notice:", tokenErr);
                    return null;
                });
                if (token) {
                    await fetch("/api/notifications/register-token", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token, device: navigator.userAgent }),
                    }).catch(() => {});
                }

                onMessageListener()
                    .then((payload: any) => {
                        console.log("Foreground message received:", payload);
                        playNotificationSound();

                        if (Notification.permission === "granted") {
                            const { title, body } = payload.notification;
                            const notificationOptions = {
                                body: body,
                                icon: "/favicon.ico",
                                badge: "/favicon.ico",
                                tag: "mama-onyinye-foreground",
                                renotify: true,
                                data: payload.data,
                            };

                            navigator.serviceWorker.ready.then((registration) => {
                                registration.showNotification(title, notificationOptions);
                            });
                        }
                    })
                    .catch((err) => console.warn("[FCM] foreground listener failed:", err));
            } catch (err) {
                console.warn("[FCM] setup error:", err);
            }
        };

        setupFCM();
    }, [userState, playNotificationSound]);

    const markAsRead = async (id: string) => {
        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Persist DB update via service-role endpoint
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        }).catch((err) => console.warn("Failed to mark notification read:", err));
    };

    const markAllAsRead = async () => {
        if (!userState) return;

        // Optimistic UI update
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);

        // Persist DB update via service-role endpoint
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ all: true }),
        }).catch((err) => console.warn("Failed to mark all notifications read:", err));
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    };
}
