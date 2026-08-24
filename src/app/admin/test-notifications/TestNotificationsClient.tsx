"use client";

import { useState, useEffect } from "react";
import {
    Bell,
    Send,
    ShoppingCart,
    Calendar,
    UserPlus,
    Truck,
    ChefHat,
    CheckCircle2,
    Loader2,
    Zap,
    Shield,
    Radio,
    Volume2,
    RefreshCw,
    MessageSquare,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/types";

interface Preset {
    id: string;
    label: string;
    icon: any;
    target: "admin" | "self";
    title: string;
    message: string;
    type: NotificationType;
    url: string;
    color: string;
}

const PRESETS: Preset[] = [
    {
        id: "new_order",
        label: "New Order Placed (Admin Alert)",
        icon: ShoppingCart,
        target: "admin",
        title: "🛒 New Order #JRG-8842",
        message: "Chinedu placed an order for Nsukka Mixed Grill Platter (₦18,500).",
        type: "order",
        url: "/admin/orders",
        color: "border-gold-500/30 text-gold-400 bg-gold-500/10",
    },
    {
        id: "new_reservation",
        label: "New Table Reservation (Admin Alert)",
        icon: Calendar,
        target: "admin",
        title: "📅 New Reservation Request",
        message: "Nneka booked a Private Dining table for 4 guests on 28th Aug at 7:30 PM.",
        type: "reservation",
        url: "/admin/reservations",
        color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
    },
    {
        id: "new_signup",
        label: "New User Registration (Admin Alert)",
        icon: UserPlus,
        target: "admin",
        title: "👤 New User Signup",
        message: "emeka.okonkwo@gmail.com registered a new customer account.",
        type: "signup",
        url: "/admin/users",
        color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    },
    {
        id: "preparing",
        label: "Kitchen Preparing (User Alert)",
        icon: ChefHat,
        target: "self",
        title: "👨‍🍳 Kitchen is Preparing Your Order",
        message: "Your order #JRG-8842 is now cooking on our grill!",
        type: "order_status",
        url: "/dashboard/orders",
        color: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    },
    {
        id: "out_for_delivery",
        label: "Out for Delivery (User Alert)",
        icon: Truck,
        target: "self",
        title: "🚚 Your Order is On the Way",
        message: "Emeka Okafor (+234 801 234 5678) has picked up your order.",
        type: "order_status",
        url: "/dashboard/orders",
        color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
    },
    {
        id: "completed",
        label: "Order Delivered (User Alert)",
        icon: CheckCircle2,
        target: "self",
        title: "🎉 Order Delivered!",
        message: "Your order #JRG-8842 has been delivered. Enjoy your meal!",
        type: "order_status",
        url: "/dashboard/orders",
        color: "border-green-500/30 text-green-400 bg-green-500/10",
    },
];

export default function TestNotificationsClient() {
    const { showToast } = useToast();
    const { notifications, unreadCount } = useNotifications();
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<any>(null);

    // Custom Form State
    const [customTarget, setCustomTarget] = useState<"admin" | "self">("admin");
    const [customTitle, setCustomTitle] = useState("");
    const [customMessage, setCustomMessage] = useState("");
    const [customType, setCustomType] = useState<NotificationType>("system");
    const [customUrl, setCustomUrl] = useState("/admin");
    const [customSending, setCustomSending] = useState(false);

    const triggerPreset = async (preset: Preset) => {
        setSendingId(preset.id);
        try {
            const res = await fetch("/api/admin/test-notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target: preset.target,
                    title: preset.title,
                    message: preset.message,
                    type: preset.type,
                    url: preset.url,
                    metadata: { preset_id: preset.id },
                }),
            });

            const data = await res.json();
            setLastResponse(data);

            if (res.ok) {
                showToast(`Triggered: ${preset.label}`, "success");
            } else {
                showToast(data.error ?? "Failed to send notification", "error");
            }
        } catch {
            showToast("Network error sending notification", "error");
        } finally {
            setSendingId(null);
        }
    };

    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customTitle.trim() || !customMessage.trim()) {
            showToast("Title and message are required", "error");
            return;
        }

        setCustomSending(true);
        try {
            const res = await fetch("/api/admin/test-notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    target: customTarget,
                    title: customTitle.trim(),
                    message: customMessage.trim(),
                    type: customType,
                    url: customUrl.trim() || "/admin",
                }),
            });

            const data = await res.json();
            setLastResponse(data);

            if (res.ok) {
                showToast("Custom notification sent!", "success");
                setCustomTitle("");
                setCustomMessage("");
            } else {
                showToast(data.error ?? "Failed to send notification", "error");
            }
        } catch {
            showToast("Network error sending custom notification", "error");
        } finally {
            setCustomSending(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400 border border-gold-500/20">
                        <Bell size={24} />
                    </div>
                    <div>
                        <h1 className="font-serif text-2xl md:text-3xl text-white font-bold">
                            Notification Testing Suite
                        </h1>
                        <p className="text-white/40 text-xs md:text-sm">
                            Test all notification triggers across Database, Realtime Socket.IO, Audio, and Push notifications.
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Presets Grid */}
            <div>
                <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Zap size={16} /> 1-Click Quick Notification Triggers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSending = sendingId === preset.id;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => triggerPreset(preset)}
                                disabled={!!sendingId}
                                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer flex flex-col justify-between ${preset.color}`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2 font-semibold text-sm">
                                            <Icon size={18} />
                                            <span>{preset.label}</span>
                                        </div>
                                        {isSending && <Loader2 size={14} className="animate-spin" />}
                                    </div>
                                    <p className="text-xs text-white/80 font-bold mb-1">{preset.title}</p>
                                    <p className="text-[11px] text-white/50 leading-relaxed">{preset.message}</p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                                    <span className="uppercase font-mono">{preset.target === "admin" ? "Admin Broadcast" : "Current User"}</span>
                                    <span className="text-gold-400 font-semibold flex items-center gap-1">
                                        Send Now <Send size={10} />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Custom Notification Form */}
                <div className="bg-charcoal border border-white/5 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <MessageSquare size={16} /> Send Custom Notification
                    </h2>

                    <form onSubmit={handleCustomSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs text-white/60 mb-1 font-semibold">Target Recipient</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setCustomTarget("admin")}
                                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                        customTarget === "admin"
                                            ? "bg-gold-500/20 text-gold-400 border-gold-500/40"
                                            : "bg-obsidian border-white/10 text-white/40 hover:text-white"
                                    }`}
                                >
                                    Admin Broadcast
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCustomTarget("self")}
                                    className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                                        customTarget === "self"
                                            ? "bg-gold-500/20 text-gold-400 border-gold-500/40"
                                            : "bg-obsidian border-white/10 text-white/40 hover:text-white"
                                    }`}
                                >
                                    My Account (Self)
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-white/60 mb-1 font-semibold">Notification Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Special Grill Offer! 🔥"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-white/60 mb-1 font-semibold">Notification Message *</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="e.g. Get 10% off all Ribs and Suya today at Jroyal Grills!"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">Type</label>
                                <select
                                    value={customType}
                                    onChange={(e) => setCustomType(e.target.value as NotificationType)}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                >
                                    <option value="system" className="bg-obsidian text-white">System Alert</option>
                                    <option value="order" className="bg-obsidian text-white">Order</option>
                                    <option value="order_status" className="bg-obsidian text-white">Order Status Update</option>
                                    <option value="reservation" className="bg-obsidian text-white">Reservation</option>
                                    <option value="signup" className="bg-obsidian text-white">User Signup</option>
                                    <option value="cancellation" className="bg-obsidian text-white">Cancellation</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">Route Link</label>
                                <input
                                    type="text"
                                    placeholder="/admin or /dashboard"
                                    value={customUrl}
                                    onChange={(e) => setCustomUrl(e.target.value)}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={customSending}
                            className="w-full py-2.5 bg-gold-500 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {customSending ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" /> Dispatching...
                                </>
                            ) : (
                                <>
                                    <Send size={14} /> Dispatch Custom Notification
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Live Received Notifications Stream */}
                <div className="bg-charcoal border border-white/5 rounded-2xl p-6 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-2">
                            <Radio size={16} className="text-green-400 animate-pulse" /> Live Received Feed
                        </h2>
                        <span className="text-xs text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                            Unread: <strong className="text-gold-400">{unreadCount}</strong>
                        </span>
                    </div>

                    <div className="flex-1 bg-obsidian border border-white/10 rounded-xl p-4 overflow-y-auto space-y-3 max-h-[380px]">
                        {notifications.length === 0 ? (
                            <div className="h-48 flex flex-col items-center justify-center text-center text-white/30">
                                <Bell size={32} className="mb-2 opacity-30" />
                                <p className="text-xs">No notifications in feed yet.</p>
                                <p className="text-[10px] text-white/20 mt-1">Click any preset button above to test!</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((n) => (
                                <div
                                    key={n.id}
                                    className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3 hover:border-gold-500/20 transition-all"
                                >
                                    <div className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                                        <p className="text-[11px] text-white/50 leading-relaxed">{n.body}</p>
                                        <div className="flex items-center justify-between gap-2 mt-2 text-[9px] text-white/30 font-mono">
                                            <span>Type: {n.type}</span>
                                            <span>{new Date(n.created_at).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Server Response Inspector */}
                    {lastResponse && (
                        <div className="mt-4 p-3 bg-black/40 border border-white/10 rounded-lg text-[10px] font-mono text-white/60">
                            <p className="text-gold-400 font-bold mb-1">Server Response:</p>
                            <p className="truncate">Status: {lastResponse.success ? "✓ OK 200" : "✗ Error"}</p>
                            <p className="truncate">{lastResponse.message ?? lastResponse.error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
