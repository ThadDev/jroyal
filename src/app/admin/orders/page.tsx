import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import type { Order } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mb-1 md:mb-2">Orders</h1>
                    <p className="text-sm text-white/50">Manage customer orders and deliveries.</p>
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
                            orders.map((order: Order) => (
                                <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-6 text-white/70 font-mono text-xs">
                                        {order.id.slice(0, 8)}...
                                    </td>
                                    <td className="py-4 px-6 text-white/70">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="text-white font-medium">{order.customer_name}</div>
                                        <div className="text-xs text-white/40">{order.customer_phone}</div>
                                    </td>
                                    <td className="py-4 px-6 text-gold-400 font-semibold">
                                        ₦{order.total_amount.toLocaleString("en-NG")}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                                            order.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                            order.status === "processing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                            order.status === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                            "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                        }`}>
                                            {order.status === "completed" ? <CheckCircle2 size={12} /> :
                                             order.status === "processing" ? <Package size={12} /> :
                                             order.status === "cancelled" ? <XCircle size={12} /> :
                                             <Clock size={12} />}
                                            {order.status}
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
                            ))
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
                    orders.map((order: Order) => (
                        <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Order ID: {order.id.slice(0, 8)}</p>
                                    <h3 className="text-white font-medium">{order.customer_name}</h3>
                                    <p className="text-xs text-white/40">{order.customer_phone}</p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                                    order.status === "completed" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                    order.status === "processing" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                    order.status === "cancelled" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                    "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                                }`}>
                                    {order.status === "completed" ? <CheckCircle2 size={10} /> :
                                     order.status === "processing" ? <Package size={10} /> :
                                     order.status === "cancelled" ? <XCircle size={10} /> :
                                     <Clock size={10} />}
                                    {order.status}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-0.5">Date</p>
                                    <p className="text-white text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
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
                                <Eye size={16} /> View Full Details
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
