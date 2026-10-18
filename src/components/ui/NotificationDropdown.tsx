"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, BellRing, Check, Trash2, X, Circle, VolumeX } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, isRinging, stopSound, markAsRead, markAllAsRead } = useNotifications();
    const { theme } = useTheme();
    const L = theme === "light";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (id: string, is_read: boolean) => {
        stopSound();
        if (!is_read) markAsRead(id);
        setIsOpen(false);
    };

    // ── Theme tokens ──────────────────────────────────────────────
    const bellColor = isRinging ? "#F6A81C" : (L ? "#AB2330" : "rgba(255,255,255,0.70)");
    const panelBg = L ? "rgba(255,246,230,0.98)" : "#080812";
    const panelBorder = L ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)";
    const headerBg = L ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";
    const headerDivider = L ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.10)";
    const headingColor = L ? "#1A1A1A" : "#F5F0E8";
    const markAllColor = L ? "#AB2330" : "#F6A81C";
    const rowHoverBg = L ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
    const rowUnreadBg = L ? "rgba(171,35,48,0.04)" : "rgba(246,168,28,0.02)";
    const dotColor = L ? "#AB2330" : "#F6A81C";
    const checkColor = L ? "rgba(26,26,26,0.20)" : "rgba(255,255,255,0.20)";
    const titleActive = L ? "#1A1A1A" : "#FFFFFF";
    const titleRead = L ? "rgba(26,26,26,0.60)" : "rgba(255,255,255,0.70)";
    const bodyColor = L ? "rgba(26,26,26,0.50)" : "rgba(255,255,255,0.50)";
    const timeColor = L ? "rgba(26,26,26,0.30)" : "rgba(255,255,255,0.30)";
    const footerBg = L ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";
    const footerText = L ? "rgba(26,26,26,0.40)" : "rgba(255,255,255,0.40)";
    const footerLink = L ? "#AB2330" : "#F6A81C";
    const itemDivider = L ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    const emptyIcon = L ? "rgba(26,26,26,0.12)" : "rgba(255,255,255,0.10)";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => { if (isRinging) stopSound(); setIsOpen(!isOpen); }}
                style={{ position: "relative", padding: "8px", background: "none", border: "none", cursor: "pointer", color: bellColor, transition: "color 0.2s" }}
                className={isRinging ? "animate-bounce" : ""}
                aria-label="Notifications"
            >
                {isRinging
                    ? <BellRing size={20} className="animate-pulse" style={{ color: "#F6A81C" }} />
                    : <Bell size={20} />
                }
                {unreadCount > 0 && (
                    <span style={{ position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: 700, color: "#fff", background: "#EF4444", border: L ? "1px solid rgba(255,246,230,0.8)" : "1px solid #080812", borderRadius: "50%" }}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{ position: "fixed", right: "16px", top: "64px", width: "min(calc(100vw - 32px), 384px)", background: panelBg, border: panelBorder, borderRadius: "12px", boxShadow: L ? "0 8px 40px rgba(0,0,0,0.12)" : "0 8px 40px rgba(0,0,0,0.5)", zIndex: 50, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "82vh" }}
                        className="sm:absolute sm:right-0 sm:top-auto sm:mt-2"
                    >
                        {/* Header */}
                        <div style={{ padding: "1rem", borderBottom: `1px solid ${headerDivider}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: headerBg, flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 700, color: headingColor, margin: 0 }}>Notifications</h3>
                                {isRinging && (
                                    <button onClick={stopSound} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", padding: "2px 8px", borderRadius: "99px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.30)", fontWeight: 600, cursor: "pointer", animation: "pulse 2s infinite" }}>
                                        <VolumeX size={12} /> Silence
                                    </button>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", color: markAllColor, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: "2.5rem 1rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                                    <Bell size={35} style={{ color: emptyIcon }} />
                                    <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: bodyColor, margin: 0 }}>No notifications yet.</p>
                                </div>
                            ) : (
                                <div>
                                    {notifications.map((notification, i) => (
                                        <div
                                            key={notification.id}
                                            style={{ padding: "1rem", borderBottom: i < notifications.length - 1 ? `1px solid ${itemDivider}` : "none", background: !notification.is_read ? rowUnreadBg : "transparent", cursor: "pointer" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = rowHoverBg)}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = !notification.is_read ? rowUnreadBg : "transparent")}
                                        >
                                            <div style={{ display: "flex", gap: "12px" }}>
                                                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                                                    {!notification.is_read
                                                        ? <Circle size={10} style={{ fill: dotColor, color: dotColor }} />
                                                        : <Check size={14} style={{ color: checkColor }} />
                                                    }
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleNotificationClick(notification.id, notification.is_read)}>
                                                    {notification.metadata?.url ? (
                                                        <Link href={notification.metadata.url} onClick={() => handleNotificationClick(notification.id, notification.is_read)} style={{ display: "block", textDecoration: "none" }}>
                                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, color: !notification.is_read ? titleActive : titleRead, margin: "0 0 2px" }}>{notification.title}</p>
                                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: bodyColor, margin: "0 0 6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{notification.body}</p>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, color: !notification.is_read ? titleActive : titleRead, margin: "0 0 2px" }}>{notification.title}</p>
                                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: bodyColor, margin: "0 0 6px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{notification.body}</p>
                                                        </>
                                                    )}
                                                    <span style={{ fontFamily: "monospace", fontSize: "10px", color: timeColor, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${headerDivider}`, background: footerBg, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                            <span style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: footerText }}>Jroyal System Alerts</span>
                            <Link href="/admin/test-notifications" onClick={() => setIsOpen(false)} style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: footerLink, fontWeight: 600, textDecoration: "none" }}>
                                Test Suite →
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
