import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    ArrowRight,
    UtensilsCrossed,
    ChefHat,
    PackageCheck,
    Truck,
    MapPin,
} from "lucide-react";
import type { Order, CartItem, SelectedAddOn, OrderStatus, ORDER_STATUS_LABELS } from "@/types";
import { ORDER_STATUS_LABELS as LABELS } from "@/types";
import ResumePaymentButton from "@/components/dashboard/ResumePaymentButton";

export const dynamic = "force-dynamic";

function getStatusConfig(status: OrderStatus, isUnpaid: boolean) {
    if (isUnpaid) return { icon: Clock, color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pending Payment" };
    switch (status) {
        case "out_for_delivery": return { icon: Truck, color: "bg-blue-400/10 text-blue-300 border-blue-400/20", label: LABELS.out_for_delivery };
        case "ready":        return { icon: PackageCheck, color: "bg-teal-500/10 text-teal-400 border-teal-500/20", label: LABELS.ready };
        case "processing":   return { icon: ChefHat, color: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: LABELS.processing };
        case "cancelled":    return { icon: XCircle, color: "bg-red-500/10 text-red-400 border-red-500/20", label: LABELS.cancelled };
        default:             return { icon: Clock, color: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: LABELS.pending };
    }
}

const TRACKABLE_STATUSES: OrderStatus[] = ["processing", "ready", "out_for_delivery"];

export default async function UserOrdersPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", paddingBottom: "100px" }}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="mb-8 mt-6">
                    <h1 className="font-serif text-3xl text-gold-400 font-bold mb-2">My Orders</h1>
                    <p className="text-sm text-white/50">Track and view your current and past orders.</p>
                </div>

                {(!orders || orders.length === 0) ? (
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
                        <UtensilsCrossed size={48} className="text-white/10 mb-4" />
                        <h2 className="text-xl font-serif text-white/50 mb-2">No orders yet</h2>
                        <p className="text-sm text-white/30 mb-6">Looks like you haven't ordered anything delicious yet!</p>
                        <Link href="/dashboard" className="px-6 py-3 bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 hover:border-gold-500/30 transition-all rounded-full font-semibold text-sm inline-flex items-center gap-2">
                            Browse Menu <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order: Order) => {
                            const isUnpaid = order.payment_status === "unpaid" || order.payment_status === "failed";
                            const isTrackable = TRACKABLE_STATUSES.includes(order.status);
                            const isActive = isTrackable;
                            const { icon: StatusIcon, color, label } = getStatusConfig(order.status, isUnpaid);

                            return (
                                <div
                                    key={order.id}
                                    className={`bg-white/5 border rounded-2xl overflow-hidden transition-all group ${
                                        isActive ? "border-gold-500/20 hover:border-gold-500/40" : "border-white/10 hover:border-white/15"
                                    }`}
                                >
                                    {/* Order Header */}
                                    <div className="bg-white/[0.02] border-b border-white/5 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-sm text-white font-mono opacity-80">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${color}`}>
                                                    <StatusIcon size={11} />
                                                    {label}
                                                </span>
                                                {/* Live pulse for active orders */}
                                                {isActive && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                                                        <span className="text-[10px] text-gold-400/70">Live</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-white/40">
                                                {new Date(order.created_at).toLocaleString("en-NG", {
                                                    day: "numeric", month: "short", year: "numeric",
                                                    hour: "numeric", minute: "2-digit",
                                                })}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col sm:items-end">
                                                <span className="text-xs text-white/40 mb-0.5">Total</span>
                                                <span className="text-base font-bold text-gold-400">
                                                    ₦{order.total_amount.toLocaleString("en-NG")}
                                                </span>
                                            </div>

                                            {/* Action buttons */}
                                            {isUnpaid ? (
                                                <ResumePaymentButton orderId={order.id} />
                                            ) : isTrackable ? (
                                                <Link
                                                    href={`/dashboard/orders/${order.id}/track`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/20 rounded-lg font-semibold text-xs transition-all"
                                                >
                                                    <MapPin size={12} /> Track
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={`/dashboard/orders/${order.id}/track`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 rounded-lg font-semibold text-xs transition-all"
                                                >
                                                    View <ArrowRight size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4 md:p-5">
                                        <div className="space-y-3">
                                            {order.items?.slice(0, 3).map((item: CartItem, index: number) => (
                                                <div key={item.cartItemId || index} className={`flex items-start justify-between gap-4 ${index < Math.min(order.items.length, 3) - 1 ? "border-b border-white/5 pb-3" : ""}`}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-white/30 font-semibold">{item.quantity}×</span>
                                                            <h4 className="text-sm font-medium text-white/80 truncate">{item.mealTitle}</h4>
                                                        </div>
                                                        {item.selectedAddOns?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mt-1 pl-5">
                                                                {item.selectedAddOns.map((addon: SelectedAddOn) => (
                                                                    <span key={addon.addOnId} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-white/30">
                                                                        {addon.quantity > 1 ? `${addon.quantity}× ` : ''}{addon.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-semibold text-white/60 flex-shrink-0">
                                                        ₦{item.totalPrice.toLocaleString("en-NG")}
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <p className="text-xs text-white/30 pt-1">
                                                    +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
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
