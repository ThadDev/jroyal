"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import {
    Clock, CheckCircle2, XCircle, Package, ArrowRight,
    UtensilsCrossed, ChefHat, PackageCheck, Truck, MapPin,
} from "lucide-react";
import type { Order, CartItem, SelectedAddOn, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS as LABELS } from "@/types";
import ResumePaymentButton from "@/components/dashboard/ResumePaymentButton";

const TRACKABLE_STATUSES: OrderStatus[] = ["processing", "ready", "out_for_delivery"];

function getStatusConfig(status: OrderStatus, isUnpaid: boolean) {
    if (isUnpaid) return { icon: Clock, colorDark: "bg-amber-500/10 text-amber-400 border-amber-500/20", colorLight: "bg-amber-50 text-amber-700 border-amber-300", label: "Pending Payment" };
    switch (status) {
        case "out_for_delivery": return { icon: Truck, colorDark: "bg-blue-400/10 text-blue-300 border-blue-400/20", colorLight: "bg-blue-50 text-blue-700 border-blue-300", label: LABELS.out_for_delivery };
        case "ready": return { icon: PackageCheck, colorDark: "bg-teal-500/10 text-teal-400 border-teal-500/20", colorLight: "bg-teal-50 text-teal-700 border-teal-300", label: LABELS.ready };
        case "processing": return { icon: ChefHat, colorDark: "bg-purple-500/10 text-purple-400 border-purple-500/20", colorLight: "bg-purple-50 text-purple-700 border-purple-300", label: LABELS.processing };
        case "cancelled": return { icon: XCircle, colorDark: "bg-red-500/10 text-red-400 border-red-500/20", colorLight: "bg-red-50 text-red-700 border-red-300", label: LABELS.cancelled };
        default: return { icon: Clock, colorDark: "bg-amber-500/10 text-amber-400 border-amber-500/20", colorLight: "bg-amber-50 text-amber-700 border-amber-300", label: LABELS.pending };
    }
}

export default function OrdersClient() {
    const { theme } = useTheme();
    const L = theme === "light";

    const [orders, setOrders] = useState<Order[] | null>(null);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = "/auth/login"; return; }
            const { data } = await supabase
                .from("orders").select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            setOrders(data ?? []);
        };
        load();
    }, []);

    // ── Theme tokens ──────────────────────────────────────────────
    const primary = L ? "#1A1A1A" : "#F5F0E8";
    const muted = (a: number) => L ? `rgba(26,26,26,${a})` : `rgba(255,255,255,${a})`;
    const accent = L ? "#AB2330" : "#F6A81C";
    const cardBg = L ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.04)";
    const cardBorder = (active: boolean) => active
        ? (L ? "1.5px solid rgba(171,35,48,0.30)" : "1px solid rgba(246,168,28,0.20)")
        : (L ? "1px solid rgba(0,0,0,0.09)" : "1px solid rgba(255,255,255,0.10)");
    const headerBg = L ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.02)";
    const headerBorder = L ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
    const itemDivider = L ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
    const addonBg = L ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";

    if (orders === null) {
        return (
            <div style={{ paddingTop: "88px", minHeight: "100vh", padding: "88px 1.5rem 6rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: muted(0.35) }}>Loading orders…</p>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: "88px", minHeight: "100vh", paddingBottom: "6rem" }}>
            <div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 1.5rem" }}>
                {/* Page heading */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                    <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", color: L ? "#AB2330" : "#F6A81C", fontWeight: 700, margin: "0 0 6px" }}>My Orders</h1>
                    <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: muted(0.45), margin: 0 }}>Track and view your current and past orders.</p>
                </div>

                {orders.length === 0 ? (
                    <div style={{ background: cardBg, border: cardBorder(false), borderRadius: "16px", padding: "4rem 2rem", textAlign: "center", backdropFilter: "blur(16px)" }}>
                        <UtensilsCrossed size={48} style={{ color: muted(0.12), margin: "0 auto 1rem" }} />
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: muted(0.40), margin: "0 0 0.5rem" }}>No orders yet</h2>
                        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: muted(0.28), margin: "0 0 1.5rem" }}>Looks like you haven't ordered anything delicious yet!</p>
                        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.625rem 1.5rem", background: L ? "rgba(171,35,48,0.08)" : "rgba(246,168,28,0.10)", border: L ? "1px solid rgba(171,35,48,0.20)" : "1px solid rgba(246,168,28,0.20)", borderRadius: "99px", color: accent, textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600 }}>
                            Browse Menu <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {orders.map((order: Order) => {
                            const isUnpaid = order.payment_status === "unpaid" || order.payment_status === "failed";
                            const isTrackable = TRACKABLE_STATUSES.includes(order.status);
                            const { icon: StatusIcon, colorDark, colorLight, label } = getStatusConfig(order.status, isUnpaid);
                            const badgeClass = L ? colorLight : colorDark;

                            return (
                                <div key={order.id} style={{ background: cardBg, border: cardBorder(isTrackable), borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(16px)", transition: "border-color 0.2s" }}>
                                    {/* Order Header */}
                                    <div style={{ background: headerBg, borderBottom: `1px solid ${headerBorder}`, padding: "1rem 1.25rem", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "13px", color: primary, fontWeight: 600, opacity: 0.8 }}>
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${badgeClass}`}>
                                                    <StatusIcon size={11} />
                                                    {label}
                                                </span>
                                                {isTrackable && (
                                                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: accent, animation: "pulse 2s infinite" }} />
                                                        <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", color: accent, opacity: 0.75 }}>Live</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: muted(0.38) }}>
                                                {new Date(order.created_at).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}
                                            </span>
                                        </div>

                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                                                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", color: muted(0.38), marginBottom: "2px" }}>Total</span>
                                                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: accent }}>
                                                    ₦{order.total_amount.toLocaleString("en-NG")}
                                                </span>
                                            </div>
                                            {isUnpaid ? (
                                                <ResumePaymentButton orderId={order.id} />
                                            ) : isTrackable ? (
                                                <Link href={`/dashboard/orders/${order.id}/track`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.375rem 0.875rem", background: L ? "rgba(171,35,48,0.08)" : "rgba(246,168,28,0.10)", border: L ? "1px solid rgba(171,35,48,0.20)" : "1px solid rgba(246,168,28,0.20)", borderRadius: "8px", color: accent, textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 600 }}>
                                                    <MapPin size={12} /> Track
                                                </Link>
                                            ) : (
                                                <Link href={`/dashboard/orders/${order.id}/track`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "0.375rem 0.875rem", background: L ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", border: L ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.10)", borderRadius: "8px", color: muted(0.50), textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 600 }}>
                                                    View <ArrowRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Items list */}
                                    <div style={{ padding: "1rem 1.25rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                            {order.items?.slice(0, 3).map((item: CartItem, index: number) => (
                                                <div key={item.cartItemId || index} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", paddingBottom: index < Math.min(order.items.length, 3) - 1 ? "0.75rem" : 0, borderBottom: index < Math.min(order.items.length, 3) - 1 ? `1px solid ${itemDivider}` : "none" }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                            <span style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: muted(0.35), fontWeight: 600 }}>{item.quantity}×</span>
                                                            <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: 500, color: primary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.mealTitle}</h4>
                                                        </div>
                                                        {item.selectedAddOns?.length > 0 && (
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px", paddingLeft: "20px" }}>
                                                                {item.selectedAddOns.map((addon: SelectedAddOn) => (
                                                                    <span key={addon.addOnId} style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", padding: "1px 6px", background: addonBg, borderRadius: "4px", color: muted(0.35) }}>
                                                                        {addon.quantity > 1 ? `${addon.quantity}× ` : ""}{addon.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, color: muted(0.55), flexShrink: 0 }}>
                                                        ₦{item.totalPrice.toLocaleString("en-NG")}
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: muted(0.30), margin: 0 }}>
                                                    +{order.items.length - 3} more item{order.items.length - 3 > 1 ? "s" : ""}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
