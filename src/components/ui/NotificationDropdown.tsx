"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, X, Circle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = (id: string, is_read: boolean, url?: string) => {
        if (!is_read) {
            markAsRead(id);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white/70 hover:text-gold-400 transition-colors focus:outline-none"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-obsidian bg-red-500 border border-obsidian rounded-full">
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
                        className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-auto mt-2 w-[calc(100vw-32px)] sm:w-96 bg-obsidian border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h3 className="font-serif text-lg font-bold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-gold-500 hover:text-gold-400 font-medium transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <Bell size={32} className="text-white/10 mb-3" />
                                    <p className="text-sm text-white/40">No notifications yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 transition-colors hover:bg-white/[0.03] ${
                                                !notification.is_read ? "bg-gold-500/[0.02]" : ""
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Status Indicator */}
                                                <div className="mt-1 flex-shrink-0">
                                                    {!notification.is_read ? (
                                                        <Circle size={10} className="fill-gold-500 text-gold-500" />
                                                    ) : (
                                                        <Check size={14} className="text-white/20" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    {notification.metadata?.url ? (
                                                        <Link 
                                                            href={notification.metadata.url}
                                                            onClick={() => handleNotificationClick(notification.id, notification.is_read)}
                                                            className="block"
                                                        >
                                                            <p className={`text-sm font-semibold mb-0.5 ${!notification.is_read ? "text-white" : "text-white/70"}`}>
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-white/50 mb-2 line-clamp-2 leading-relaxed">
                                                                {notification.body}
                                                            </p>
                                                        </Link>
                                                    ) : (
                                                        <div onClick={() => handleNotificationClick(notification.id, notification.is_read)} className="cursor-pointer">
                                                            <p className={`text-sm font-semibold mb-0.5 ${!notification.is_read ? "text-white" : "text-white/70"}`}>
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-xs text-white/50 mb-2 line-clamp-2 leading-relaxed">
                                                                {notification.body}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
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
                        <div className="p-3 border-t border-white/10 bg-white/[0.02] text-center">
                            <p className="text-[10px] text-white/30">Notifications from Jroyal Grills System</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
