"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { requestForToken, onMessageListener } from "@/lib/firebase/client";
import type { AppNotification } from "@/types";
import { useToast } from "@/context/ToastContext";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUnlockedRef = useRef<boolean>(false);
    const { showToast } = useToast();
    const supabase = createClient();

    const [userState, setUserState] = useState<{ id: string; isAdmin: boolean } | null>(null);

    // Audio setup + Browser Autoplay Unlocker
    useEffect(() => {
        const audio = new Audio(NOTIFICATION_SOUND_URL);
        audio.preload = "auto";
        audioRef.current = audio;

        // Unlock audio on first user touch/click (required by mobile iOS/Android autoplay policy)
        const unlockAudio = () => {
            if (audioUnlockedRef.current || !audioRef.current) return;
            audioRef.current.play().then(() => {
                audioRef.current?.pause();
                if (audioRef.current) audioRef.current.currentTime = 0;
                audioUnlockedRef.current = true;
                console.log("[Audio] System notification sound unlocked successfully");
            }).catch(() => {});

            window.removeEventListener("touchstart", unlockAudio);
            window.removeEventListener("click", unlockAudio);
        };

        window.addEventListener("touchstart", unlockAudio, { once: true });
        window.addEventListener("click", unlockAudio, { once: true });

        return () => {
            window.removeEventListener("touchstart", unlockAudio);
            window.removeEventListener("click", unlockAudio);
        };
    }, []);

    // Reliable dual-tone audio chime (uses Web Audio API fallback if HTML5 Audio is blocked)
    const playNotificationSound = useCallback(() => {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0;
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Fallback to Web Audio API Synth Chime if HTML5 Audio play is blocked by autoplay
                        playWebAudioChime();
                    });
                }
            } else {
                playWebAudioChime();
            }
        } catch {
            playWebAudioChime();
        }
    }, []);

    // Web Audio API Synthesizer Chime (Works 100% reliably without external MP3 dependencies)
    const playWebAudioChime = () => {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            const now = ctx.currentTime;
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gain = ctx.createGain();

            osc1.type = "sine";
            osc2.type = "sine";

            // Dual tone chime: E5 (659.25 Hz) then A5 (880 Hz)
            osc1.frequency.setValueAtTime(659.25, now);
            osc1.frequency.setValueAtTime(880, now + 0.12);

            osc2.frequency.setValueAtTime(1318.5, now);
            osc2.frequency.setValueAtTime(1760, now + 0.12);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(ctx.destination);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.5);
            osc2.stop(now + 0.5);
        } catch {
            /* ignore audio failures */
        }
    };

    // Trigger Mobile System Status Bar Notification
    const triggerSystemMobileNotification = useCallback((title: string, body: string, url = "/admin") => {
        try {
            if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
            if (Notification.permission !== "granted") return;

            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body: body,
                    icon: "/icons/jroyal.png",
                    badge: "/icons/icon-192x192.png",
                    vibrate: [200, 100, 200, 100, 200],
                    tag: `jroyal-notif-${Date.now()}`,
                    renotify: true,
                    data: { url },
                } as NotificationOptions);
            }).catch((err) => console.warn("[System Notification] SW trigger failed:", err));
        } catch (err) {
            console.warn("[System Notification] Error:", err);
        }
    }, []);

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

    // 2. Fetch notifications from DB
    const fetchNotifications = useCallback(async () => {
        if (!userState) return;

        try {
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
        } catch (err) {
            console.error("Failed fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    }, [userState]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // 10-second silent background polling & Tab Visibility Sync
    useEffect(() => {
        if (!userState) return;

        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        };

        window.addEventListener("focus", fetchNotifications);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener("focus", fetchNotifications);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [userState, fetchNotifications]);

    // 3. Supabase Realtime Subscription
    useEffect(() => {
        if (!userState) return;

        const channelName = `notifications-realtime-${userState.id}`;

        const handleNotificationPayload = (newNotification: AppNotification) => {
            const isForMe =
                newNotification.user_id === userState.id ||
                (!newNotification.user_id && userState.isAdmin);

            if (isForMe) {
                setNotifications((prev) => {
                    if (prev.some((n) => n.id === newNotification.id)) return prev;
                    return [newNotification, ...prev];
                });
                setUnreadCount((prev) => prev + 1);
                showToast(newNotification.title, "info");
                playNotificationSound();
                triggerSystemMobileNotification(
                    newNotification.title,
                    newNotification.body,
                    newNotification.metadata?.url || "/admin"
                );
            }
        };

        const channel = supabase
            .channel(channelName)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    handleNotificationPayload(payload.new as AppNotification);
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notifications",
                },
                (payload) => {
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === payload.new.id ? { ...n, ...payload.new } : n))
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userState, showToast, playNotificationSound, triggerSystemMobileNotification]);

    // 3b. Socket.IO Realtime Connection with Auto-Room Re-join
    useEffect(() => {
        if (!userState) return;

        let socket: any = null;
        import("socket.io-client")
            .then(({ io }) => {
                socket = io(process.env.NEXT_PUBLIC_SITE_URL || "/", {
                    path: "/socket.io",
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 1000,
                    transports: ["websocket", "polling"],
                });

                const joinRooms = () => {
                    if (userState.isAdmin) {
                        socket.emit("join-admin");
                    }
                    socket.emit("join-user", userState.id);
                };

                socket.on("connect", joinRooms);
                socket.on("reconnect", joinRooms);

                socket.on("notification", (newNotification: AppNotification) => {
                    setNotifications((prev) => {
                        if (prev.some((n) => n.id === newNotification.id)) return prev;
                        return [newNotification, ...prev];
                    });
                    setUnreadCount((prev) => prev + 1);
                    showToast(newNotification.title, "info");
                    playNotificationSound();
                    triggerSystemMobileNotification(
                        newNotification.title,
                        newNotification.body,
                        newNotification.metadata?.url || "/admin"
                    );
                });
            })
            .catch((err) => {
                console.warn("[Socket.IO] Client import notice:", err);
            });

        return () => {
            if (socket) socket.disconnect();
        };
    }, [userState, showToast, playNotificationSound, triggerSystemMobileNotification]);

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
                        playNotificationSound();

                        const title = payload.notification?.title || payload.data?.title || "Jroyal Alert";
                        const body = payload.notification?.body || payload.data?.body || "";
                        triggerSystemMobileNotification(title, body, payload.data?.url || "/admin");
                    })
                    .catch((err) => console.warn("[FCM] foreground listener failed:", err));
            } catch (err) {
                console.warn("[FCM] setup error:", err);
            }
        };

        setupFCM();
    }, [userState, playNotificationSound, triggerSystemMobileNotification]);

    const markAsRead = async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        }).catch((err) => console.warn("Failed to mark notification read:", err));
    };

    const markAllAsRead = async () => {
        if (!userState) return;

        setNotifications((prev) =>
            prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);

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
