import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, XCircle, Package, Truck, ChefHat, PackageCheck } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";

export const dynamic = "force-dynamic";

function getStatusBadge(status: OrderStatus, paymentStatus: string) {
    if (paymentStatus === "unpaid" || paymentStatus === "failed") {
        return {
            label: "Pending Payment",
            color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            icon: Clock,
        };
    }
    switch (status) {
        case "completed":
            return { label: ORDER_STATUS_LABELS.completed, color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 };
        case "out_for_delivery":
            return { label: ORDER_STATUS_LABELS.out_for_delivery, color: "bg-blue-400/10 text-blue-300 border-blue-400/20", icon: Truck };
        case "ready":
            return { label: ORDER_STATUS_LABELS.ready, color: "bg-teal-500/10 text-teal-400 border-teal-500/20", icon: PackageCheck };
        case "preparing":
            return { label: ORDER_STATUS_LABELS.preparing, color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: ChefHat };
        case "processing":
            return { label: ORDER_STATUS_LABELS.processing, color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Package };
        case "cancelled":
            return { label: ORDER_STATUS_LABELS.cancelled, color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle };
        default:
            return { label: ORDER_STATUS_LABELS.pending, color: "bg-gold-500/10 text-gold-400 border-gold-500/20", icon: Clock };
    }
}

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mb-1 md:mb-2">Orders</h1>
                    <p className="text-sm text-white/50">Manage customer orders, fulfilment, and driver assignments.</p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Order ID</th>
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Customer</th>
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Total</th>
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {(!orders || orders.length === 0) ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-white/40">
                                    No orders found.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order: Order) => {
                                const badge = getStatusBadge(order.status, order.payment_status);
                                const Icon = badge.icon;
                                return (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6 text-white/70 font-mono text-xs">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="py-4 px-6 text-white/70 text-xs">
                                            {new Date(order.created_at).toLocaleString("en-NG", {
                                                day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
                                            })}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-white font-medium text-sm">{order.customer_name}</div>
                                            <div className="text-xs text-white/40">{order.customer_phone}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gold-400 font-semibold text-sm">
                                            ₦{order.total_amount.toLocaleString("en-NG")}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border ${badge.color}`}>
                                                <Icon size={12} />
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-white/70 hover:text-white transition-colors text-xs"
                                            >
                                                <Eye size={14} /> View
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {(!orders || orders.length === 0) ? (
                    <div className="py-12 text-center text-white/40 bg-white/5 border border-white/10 rounded-xl">
                        No orders found.
                    </div>
                ) : (
                    orders.map((order: Order) => {
                        const badge = getStatusBadge(order.status, order.payment_status);
                        const Icon = badge.icon;
                        return (
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1 font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                                        <h3 className="text-white font-medium">{order.customer_name}</h3>
                                        <p className="text-xs text-white/40">{order.customer_phone}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border ${badge.color}`}>
                                        <Icon size={10} />
                                        {badge.label}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div>
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Date</p>
                                        <p className="text-white text-xs">{new Date(order.created_at).toLocaleDateString("en-NG")}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Total</p>
                                        <p className="text-gold-400 font-bold">₦{order.total_amount.toLocaleString("en-NG")}</p>
                                    </div>
                                </div>

                                <Link
                                    href={`/admin/orders/${order.id}`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all text-sm"
                                >
                                    <Eye size={16} /> View Details & Driver Assignment
                                </Link>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
