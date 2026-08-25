"use client";
// ============================================================
// OrderTrackingClient.tsx
// Premium customer-facing order tracking experience.
// Flow: Payment Confirmed → Order Received & Being Prepared
//       → Ready for Pickup → On the Way
// ============================================================
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    CheckCircle2,
    Clock,
    ChefHat,
    Truck,
    ArrowLeft,
    Phone,
    RefreshCw,
    AlertCircle,
    XCircle,
    MapPin,
    CreditCard,
    User,
    ShoppingBag,
    PackageCheck,
} from "lucide-react";
import type { OrderStatus, Driver, CartItem } from "@/types";

// ── Types ─────────────────────────────────────────────────────
interface TrackingOrder {
    id: string;
    status: OrderStatus;
    payment_status: string;
    payment_verified: boolean;
    total_amount: number;
    items: CartItem[];
    delivery_address: string;
    customer_name: string;
    customer_phone: string;
    driver_id: string | null;
    driver: Driver | null;
    created_at: string;
    updated_at: string;
}

// ── Timeline steps (in order of progression) ──────────────────
// We synthesize a "Payment Confirmed" step from payment_status,
// then map backend statuses to the remaining steps.
interface TimelineStep {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const STEPS: TimelineStep[] = [
    {
        id: "payment",
        label: "Payment Confirmed",
        description: "Your payment was received and the order placed.",
        icon: CreditCard,
    },
    {
        id: "processing",
        label: "Order Received",
        description: "Our kitchen has received your order and is preparing it.",
        icon: ChefHat,
    },
    {
        id: "ready",
        label: "Ready for Pickup",
        description: "Your meal is packed and waiting for your rider.",
        icon: PackageCheck,
    },
    {
        id: "out_for_delivery",
        label: "On the Way",
        description: "Your order is heading to you right now.",
        icon: Truck,
    },
];

// Maps an order status to the index of the ACTIVE step in STEPS.
// "payment" step (index 0) is always active once payment is paid.
function getActiveIndex(status: OrderStatus, paymentStatus: string): number {
    if (paymentStatus !== "paid") return -1; // not even started
    switch (status) {
        case "pending":     return 0; // paid but order not yet accepted
        case "processing":  return 1;
        case "ready":       return 2;
        case "out_for_delivery": return 3;
        case "cancelled":   return -2; // special
        default:            return 1;
    }
}

const VEHICLE_LABELS: Record<string, string> = {
    motorcycle: "Motorcycle",
    car: "Car",
    bicycle: "Bicycle",
    on_foot: "On Foot",
    van: "Van",
};

function formatNaira(amount: number) {
    return `₦${amount.toLocaleString("en-NG")}`;
}

function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(iso).toLocaleDateString("en-NG");
}

// ── Skeleton ───────────────────────────────────────────────────
function TrackingSkeleton() {
    return (
        <div className="max-w-lg mx-auto px-4 py-8 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-24 mb-6" />
            <div className="h-8 bg-white/10 rounded w-64 mb-2" />
            <div className="h-4 bg-white/10 rounded w-40 mb-8" />
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4">
                <div className="space-y-7">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                                <div className="h-4 bg-white/10 rounded w-32" />
                                <div className="h-3 bg-white/5 rounded w-48" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────
export default function OrderTrackingClient({ orderId }: { orderId: string }) {
    const [order, setOrder] = useState<TrackingOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const fetchOrder = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/track`);
            if (!res.ok) {
                if (res.status === 403 || res.status === 401) {
                    router.push("/auth/login");
                    return;
                }
                const data = await res.json();
                setError(data.error ?? "Failed to load order.");
                return;
            }
            const { order: data } = await res.json();
            setOrder(data);
            setError(null);
        } catch {
            setError("Network error. Please check your connection.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId, router]);

    useEffect(() => { fetchOrder(); }, [fetchOrder]);

    // Supabase Realtime — live order updates
    useEffect(() => {
        const channel = supabase
            .channel(`order-track-${orderId}`)
            .on(
                "postgres_changes",
                { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
                (payload) => {
                    const updated = payload.new as Partial<TrackingOrder>;
                    setOrder((prev) => {
                        if (!prev) return prev;
                        return { ...prev, ...updated };
                    });
                    // Re-fetch if driver was assigned (need joined driver object)
                    if (updated.driver_id !== undefined) fetchOrder();
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [orderId, supabase, fetchOrder]);

    if (loading) return (
        <div style={{ paddingTop: "80px", minHeight: "100vh" }}>
            <TrackingSkeleton />
        </div>
    );

    if (error) return (
        <div style={{ paddingTop: "80px", minHeight: "100vh" }}>
            <div className="max-w-lg mx-auto px-4 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={28} className="text-red-400" />
                </div>
                <h2 className="font-serif text-2xl text-white mb-2">Something went wrong</h2>
                <p className="text-white/50 text-sm mb-6">{error}</p>
                <button
                    onClick={() => fetchOrder()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full font-semibold text-sm hover:bg-gold-500/20 transition-all"
                >
                    <RefreshCw size={15} /> Try Again
                </button>
            </div>
        </div>
    );

    if (!order) return null;

    const isCancelled = order.status === "cancelled";
    const isPendingPayment = order.payment_status !== "paid";
    const isOnWay = order.status === "out_for_delivery";
    const activeIndex = getActiveIndex(order.status, order.payment_status);

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", paddingBottom: "6rem" }}>
            <div className="max-w-lg mx-auto px-4 py-6">

                {/* Back */}
                <Link
                    href="/dashboard/orders"
                    className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6"
                >
                    <ArrowLeft size={15} /> My Orders
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-2xl md:text-3xl text-white font-bold mb-1">
                                Track Your Order
                            </h1>
                            <p className="text-xs text-white/40 font-mono">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                        <button
                            onClick={() => fetchOrder(true)}
                            disabled={refreshing}
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-gold-400 hover:border-gold-500/30 transition-all disabled:opacity-50"
                            aria-label="Refresh order status"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* ── CANCELLED STATE ── */}
                {isCancelled && (
                    <div className="bg-red-500/[0.06] border border-red-500/20 rounded-2xl p-6 mb-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <XCircle size={28} className="text-red-400" />
                        </div>
                        <h2 className="font-serif text-xl text-white mb-2">Order Cancelled</h2>
                        <p className="text-white/50 text-sm mb-4">
                            This order has been cancelled. Please contact us if you need assistance.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full text-white/60 text-sm hover:bg-white/10 transition-all"
                        >
                            Browse Menu
                        </Link>
                    </div>
                )}

                {/* ── PENDING PAYMENT ── */}
                {isPendingPayment && !isCancelled && (
                    <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-6 mb-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <CreditCard size={28} className="text-amber-400" />
                        </div>
                        <h2 className="font-serif text-xl text-white mb-2">Payment Pending</h2>
                        <p className="text-white/50 text-sm mb-4">
                            Your order was created but payment hasn't been completed yet.
                        </p>
                        <Link
                            href="/dashboard/orders"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-full text-sm font-semibold hover:bg-gold-500/20 transition-all"
                        >
                            Complete Payment
                        </Link>
                    </div>
                )}

                {/* ── TRACKING TIMELINE ── */}
                {!isCancelled && !isPendingPayment && (
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-4">
                        <div className="space-y-0">
                            {STEPS.map((step, index) => {
                                const isDone = activeIndex > index;
                                const isCurrent = activeIndex === index;
                                const isUpcoming = activeIndex < index;
                                const isLast = index === STEPS.length - 1;
                                const Icon = step.icon;

                                return (
                                    <div key={step.id} className="flex gap-4">
                                        {/* Left: icon + connector */}
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`
                                                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                                    transition-all duration-500
                                                    ${isDone
                                                        ? "bg-green-500/20 border-2 border-green-500"
                                                        : isCurrent
                                                        ? "bg-green-500/10 border-2 border-green-400"
                                                        : "bg-white/5 border border-white/10"
                                                    }
                                                `}
                                            >
                                                {/* Glowing dot for current step, check for done, icon for upcoming */}
                                                {isDone ? (
                                                    <CheckCircle2 size={18} className="text-green-400" />
                                                ) : isCurrent ? (
                                                    <span className="relative flex items-center justify-center w-full h-full">
                                                        <span
                                                            className="absolute w-3 h-3 rounded-full bg-green-500"
                                                            style={{
                                                                boxShadow: "0 0 0 0 rgba(34,197,94,0.7)",
                                                                animation: "ping-green 1.5s cubic-bezier(0,0,0.2,1) infinite",
                                                            }}
                                                        />
                                                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 relative z-10" />
                                                    </span>
                                                ) : (
                                                    <Icon size={17} className="text-white/20" />
                                                )}
                                            </div>
                                            {/* Connector line */}
                                            {!isLast && (
                                                <div
                                                    className={`w-0.5 my-1 flex-1 transition-all duration-700 ${
                                                        isDone
                                                            ? "bg-green-500/50"
                                                            : isCurrent
                                                            ? "bg-green-500/20"
                                                            : "bg-white/8"
                                                    }`}
                                                    style={{ minHeight: "28px" }}
                                                />
                                            )}
                                        </div>

                                        {/* Right: text */}
                                        <div className={`flex-1 ${isLast ? "pb-0" : "pb-6"} pt-1.5`}>
                                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                <p
                                                    className={`text-sm font-semibold transition-colors ${
                                                        isDone
                                                            ? "text-green-400"
                                                            : isCurrent
                                                            ? "text-white"
                                                            : "text-white/25"
                                                    }`}
                                                >
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/25 rounded-full">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                                        <span className="text-[10px] text-green-400 font-medium uppercase tracking-wider">
                                                            Now
                                                        </span>
                                                    </span>
                                                )}
                                                {isDone && (
                                                    <span className="text-[10px] text-green-400/50 font-medium uppercase tracking-wider">
                                                        ✓ Done
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className={`text-xs leading-relaxed transition-colors ${
                                                    isDone
                                                        ? "text-white/40"
                                                        : isCurrent
                                                        ? "text-white/50"
                                                        : "text-white/15"
                                                }`}
                                            >
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── DRIVER INFO (when on the way) ── */}
                {isOnWay && (
                    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mb-4">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-4">
                            Your Delivery
                        </p>
                        {order.driver ? (
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-500/20 to-gold-700/20 border border-gold-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {order.driver.avatar_url ? (
                                        <img
                                            src={order.driver.avatar_url}
                                            alt={order.driver.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User size={20} className="text-gold-400" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold text-sm">{order.driver.name}</p>
                                    {order.driver.vehicle_type && (
                                        <p className="text-white/40 text-xs mt-0.5">
                                            {VEHICLE_LABELS[order.driver.vehicle_type] ?? order.driver.vehicle_type}
                                            {order.driver.vehicle_plate && ` · ${order.driver.vehicle_plate}`}
                                        </p>
                                    )}
                                </div>
                                <a
                                    href={`tel:${order.driver.phone}`}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-xs font-semibold hover:bg-green-500/20 transition-all flex-shrink-0"
                                >
                                    <Phone size={13} /> Call
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Truck size={18} className="text-white/30" />
                                </div>
                                <div>
                                    <p className="text-white/60 text-sm">Rider assigned</p>
                                    <p className="text-white/30 text-xs">Contact information unavailable</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── DELIVERY ADDRESS ── */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 mb-4">
                    <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-gold-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">
                                Delivery Address
                            </p>
                            <p className="text-white/80 text-sm leading-relaxed">
                                {order.delivery_address}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── ORDER SUMMARY ── */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden mb-4">
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                        <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                            Order Summary
                        </p>
                    </div>
                    <div className="divide-y divide-white/[0.04]">
                        {order.items?.map((item, i) => (
                            <div key={item.cartItemId ?? i} className="px-5 py-3 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white/80 font-medium">
                                        <span className="text-white/40 text-xs mr-1.5">{item.quantity}×</span>
                                        {item.mealTitle}
                                    </p>
                                    {item.selectedAddOns?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {item.selectedAddOns.map((addon) => (
                                                <span
                                                    key={addon.addOnId}
                                                    className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-white/30"
                                                >
                                                    {addon.quantity > 1 ? `${addon.quantity}× ` : ""}
                                                    {addon.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gold-400 flex-shrink-0">
                                    {formatNaira(item.totalPrice)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-4 border-t border-white/[0.06] flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Total</span>
                        <span className="text-lg font-bold text-gold-400">
                            {formatNaira(order.total_amount)}
                        </span>
                    </div>
                </div>

                {/* ── META INFO ── */}
                <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Order Date</p>
                            <p className="text-sm text-white/60">
                                {new Date(order.created_at).toLocaleDateString("en-NG", {
                                    day: "numeric", month: "short", year: "numeric",
                                })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Payment</p>
                            <span
                                className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    order.payment_status === "paid"
                                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                            >
                                {order.payment_status === "paid" ? (
                                    <CheckCircle2 size={10} />
                                ) : (
                                    <Clock size={10} />
                                )}
                                {order.payment_status === "paid" ? "Paid" : "Pending"}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Last Updated</p>
                            <p className="text-sm text-white/60">{timeAgo(order.updated_at)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Customer</p>
                            <p className="text-sm text-white/60 truncate">{order.customer_name}</p>
                        </div>
                    </div>
                </div>

                {/* CTA: order again (always visible below) */}
                <div className="mt-6 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-white/50 text-sm hover:bg-white/10 hover:text-white/70 transition-all"
                    >
                        <ShoppingBag size={15} /> Browse Menu
                    </Link>
                </div>

            </div>

            {/* Inline keyframe for glowing dot */}
            <style>{`
                @keyframes ping-green {
                    75%, 100% {
                        transform: scale(2.2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}
