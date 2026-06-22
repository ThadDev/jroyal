import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Package, MapPin, Phone, Mail, User } from "lucide-react";
import type { Order, CartItem, SelectedAddOn } from "@/types";
import OrderStatusSelect from "./OrderStatusSelect";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !order) {
        return (
            <div className="p-8 text-center">
                <p className="text-white/50">Order not found.</p>
                <Link href="/admin/orders" className="text-gold-400 mt-4 inline-block">Back to Orders</Link>
            </div>
        );
    }

    const o = order as Order;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 text-sm"
            >
                <ArrowLeft size={16} /> Back to Orders
            </Link>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-serif text-white font-bold mb-2">Order Details</h1>
                    <p className="text-sm text-white/50 font-mono">ID: {o.id}</p>
                    <p className="text-sm text-white/50">Placed on: {new Date(o.created_at).toLocaleString()}</p>
                </div>
                
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                    <div>
                        <p className="text-xs text-white/40 mb-1">Status</p>
                        <OrderStatusSelect orderId={o.id} customerId={o.user_id} currentStatus={o.status} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-4 border-b border-white/10 pb-2">Items</h2>
                        <div className="space-y-4">
                            {o.items?.map((item: CartItem, i: number) => (
                                <div key={item.cartItemId} className={`flex items-start gap-4 ${i < o.items.length - 1 ? 'border-b border-white/5 pb-4' : ''}`}>
                                    {item.image && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0 relative">
                                            <Image src={item.image} alt={item.mealTitle} fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-sm mb-1">{item.mealTitle}</h3>
                                        {item.selectedAddOns?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {item.selectedAddOns.map((addon: SelectedAddOn) => (
                                                    <span key={addon.addOnId} className="text-[10px] px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-400 border border-gold-500/20">
                                                        {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-white/50">Qty: {item.quantity}</span>
                                            <span className="text-sm font-semibold text-gold-400">₦{item.totalPrice.toLocaleString("en-NG")}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-4 border-b border-white/10 pb-2">Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Subtotal</span>
                                <span className="text-white">₦{o.total_amount.toLocaleString("en-NG")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-white/50">Delivery</span>
                                <span className="text-white">₦0</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
                                <span className="text-white font-bold">Total</span>
                                <span className="text-gold-400 font-bold text-lg">₦{o.total_amount.toLocaleString("en-NG")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-4 border-b border-white/10 pb-2">Customer Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User size={16} className="text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-xs text-white/40 mb-0.5">Name</p>
                                    <p className="text-sm text-white">{o.customer_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail size={16} className="text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-xs text-white/40 mb-0.5">Email</p>
                                    <p className="text-sm text-white break-all">{o.customer_email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone size={16} className="text-white/40 mt-0.5" />
                                <div>
                                    <p className="text-xs text-white/40 mb-0.5">Phone</p>
                                    <p className="text-sm text-white">{o.customer_phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                        <h2 className="text-lg font-serif text-white mb-4 border-b border-white/10 pb-2">Delivery Details</h2>
                        <div className="flex items-start gap-3">
                            <MapPin size={16} className="text-white/40 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-white/40 mb-0.5">Address</p>
                                <p className="text-sm text-white leading-relaxed">{o.delivery_address}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
