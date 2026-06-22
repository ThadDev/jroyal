import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, Package, ArrowRight, UtensilsCrossed } from "lucide-react";
import type { Order, CartItem, SelectedAddOn } from "@/types";

export const dynamic = "force-dynamic";

export default async function UserOrdersPage() {
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", paddingBottom: "100px" }}>
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="mb-8 mt-6">
                    <h1 className="font-serif text-3xl text-gold-400 font-bold mb-2">My Orders</h1>
                    <p className="text-sm text-white/50">Track and view your past orders.</p>
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
                    <div className="space-y-6">
                        {orders.map((order: Order) => (
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-gold-500/20 transition-all group">
                                {/* Order Header */}
                                <div className="bg-white/[0.02] border-b border-white/5 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-white font-mono opacity-80">#{order.id.slice(0, 8)}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
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
                                        </div>
                                        <span className="text-xs text-white/40">{new Date(order.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex flex-col md:items-end">
                                        <span className="text-xs text-white/40 mb-0.5">Total Amount</span>
                                        <span className="text-lg font-bold text-gold-400">₦{order.total_amount.toLocaleString("en-NG")}</span>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="p-4 md:p-5">
                                    <div className="space-y-4">
                                        {order.items?.map((item: CartItem, index: number) => (
                                            <div key={item.cartItemId} className={`flex items-start justify-between gap-4 ${index < order.items.length - 1 ? "border-b border-white/5 pb-4" : ""}`}>
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded bg-white/5 flex-shrink-0 flex items-center justify-center">
                                                        <span className="text-white/50 text-xs font-semibold">{item.quantity}x</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white/90 mb-1">{item.mealTitle}</h4>
                                                        {item.selectedAddOns?.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {item.selectedAddOns.map((addon: SelectedAddOn) => (
                                                                    <span key={addon.addOnId} className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded text-white/50">
                                                                        {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-white/70">
                                                    ₦{item.totalPrice.toLocaleString("en-NG")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
