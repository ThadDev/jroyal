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
    const supabase = createClient();
    const { showToast } = useToast();

    useEffect(() => {
        setAudio(new Audio(NOTIFICATION_SOUND_URL));
    }, []);

    const playNotificationSound = useCallback(() => {
        if (audio) {
            audio.play().catch(e => console.log("Audio play failed:", e));
        }
    }, [audio]);

    const fetchNotifications = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch user profile to check role
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === "admin";

        // Fetch notifications for this user (and broadcast if admin)
        const query = supabase
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
            
        if (isAdmin) {
            query.or(`user_id.eq.${user.id},user_id.is.null`);
        } else {
            query.eq("user_id", user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching notifications:", error);
            return;
        }

        setNotifications(data as AppNotification[]);
        setUnreadCount(data.filter((n) => !n.is_read).length);
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Supabase Realtime Subscription
    useEffect(() => {
        let channel: any;

        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch user profile to check role
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            const isAdmin = profile?.role === "admin";

            channel = supabase
                .channel("notifications-live")
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "notifications",
                    },
                    (payload) => {
                        const newNotification = payload.new as AppNotification;
                        
                        // Client-side filtering for security and reliability
                        const isForMe = newNotification.user_id === user.id;
                        const isBroadcastForAdmin = isAdmin && !newNotification.user_id;

                        if (isForMe || isBroadcastForAdmin) {
                            setNotifications((prev) => [newNotification, ...prev]);
                            setUnreadCount((prev) => prev + 1);
                            showToast(newNotification.title, "info");
                            playNotificationSound();
                        }
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
                            prev.map((n) => n.id === payload.new.id ? { ...n, ...payload.new } : n)
                        );
                    }
                )
                .subscribe((status) => {
                    console.log("Supabase Realtime Status:", status);
                });
        };

        setupRealtime();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [supabase, showToast]);

    // FCM Push Notification Setup
    useEffect(() => {
        const setupFCM = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Check if permission is already granted or ask
            if (Notification.permission === "default") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;
            } else if (Notification.permission === "denied") {
                return;
            }

            const token = await requestForToken();
            if (token) {
                // Save token to DB
                await fetch("/api/notifications/register-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token, device: navigator.userAgent }),
                });
            }

            // Listen for foreground messages
            onMessageListener().then((payload: any) => {
                console.log("Foreground message received:", payload);
                
                // 1. Play sound
                playNotificationSound();

                // 2. Show system notification manually for foreground
                if (Notification.permission === "granted") {
                    const { title, body } = payload.notification;
                    const notificationOptions = {
                        body: body,
                        icon: "/favicon.ico",
                        badge: "/favicon.ico",
                        tag: "mama-onyinye-foreground",
                        renotify: true,
                        data: payload.data
                    };
                    
                    // We can also use the service worker registration to show the notification
                    // which is more consistent with system behavior
                    navigator.serviceWorker.ready.then(registration => {
                        registration.showNotification(title, notificationOptions);
                    });
                }
            }).catch((err) => console.error("FCM foreground listener failed:", err));
        };

        setupFCM();
    }, [supabase]);

    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);
            
        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
    };

    const markAllAsRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .in("id", unreadIds);

        if (!error) {
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        }
    };

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
    };
}
