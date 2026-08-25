import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    MapPin,
    Phone,
    Mail,
    User,
    Truck,
    ShieldCheck,
    Calendar,
    CreditCard,
    ChevronRight,
    FileText,
} from "lucide-react";
import type { Order, CartItem, SelectedAddOn, Driver } from "@/types";
import OrderStatusSelect from "./OrderStatusSelect";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
                <Package size={48} className="text-white/20 mb-4" />
                <h2 className="text-xl font-serif text-white mb-2">Order Not Found</h2>
                <p className="text-sm text-white/50 mb-6">The order #{id.slice(0, 8)} does not exist or has been removed.</p>
                <Link href="/admin/orders" className="px-5 py-2.5 bg-gold-500 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-all inline-flex items-center gap-2">
                    <ArrowLeft size={14} /> Return to Orders List
                </Link>
            </div>
        );
    }

    const o = order as Order;

    let assignedDriver: Driver | null = null;
    if (o.driver_id) {
        const { data: driverData } = await supabase
            .from("drivers")
            .select("*")
            .eq("id", o.driver_id)
            .single();
        assignedDriver = driverData as Driver | null;
    }

    const isPaid = o.payment_status === "paid";
    const formattedDate = new Date(o.created_at).toLocaleString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Breadcrumb & Navigation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-white/40 mb-1">
                        <Link href="/admin/orders" className="hover:text-gold-400 transition-colors">Orders</Link>
                        <ChevronRight size={12} />
                        <span className="text-white/70 font-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <h1 className="font-serif text-2xl md:text-3xl text-white font-bold flex items-center gap-3">
                        Order #{o.id.slice(0, 8).toUpperCase()}
                        <span className={`text-xs px-3 py-1 rounded-full font-sans font-bold uppercase tracking-wider border ${
                            isPaid
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                            {isPaid ? "Paid" : "Payment Pending"}
                        </span>
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/orders"
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2"
                    >
                        <ArrowLeft size={14} /> Back to Orders
                    </Link>
                    {o.customer_phone && (
                        <a
                            href={`tel:${o.customer_phone}`}
                            className="px-4 py-2 bg-gold-500/10 text-gold-400 border border-gold-500/20 hover:bg-gold-500/20 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2"
                        >
                            <Phone size={14} /> Call Customer
                        </a>
                    )}
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Order Total */}
                <div className="bg-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-gold-400/20">
                        <CreditCard size={28} />
                    </div>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-gold-400 font-serif">₦{o.total_amount.toLocaleString("en-NG")}</p>
                    <p className="text-[11px] text-white/30 mt-1 font-mono">{o.items?.length || 0} meal item(s)</p>
                </div>

                {/* Metric 2: Payment Status */}
                <div className="bg-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-white/20">
                        {isPaid ? <ShieldCheck size={28} className="text-green-400/30" /> : <Clock size={28} className="text-amber-400/30" />}
                    </div>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Payment Status</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isPaid
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                            {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {o.payment_status || "unpaid"}
                        </span>
                        {o.payment_verified && (
                            <span className="text-[10px] text-green-400/80 font-semibold">Verified</span>
                        )}
                    </div>
                    {o.payment_reference ? (
                        <p className="text-[10px] text-white/30 font-mono mt-2 truncate">Ref: {o.payment_reference}</p>
                    ) : (
                        <p className="text-[10px] text-white/20 mt-2 italic">No reference generated</p>
                    )}
                </div>

                {/* Metric 3: Order Fulfilment */}
                <div className="bg-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-white/20">
                        <Truck size={28} className="text-teal-400/30" />
                    </div>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Fulfilment Control</p>
                    <OrderStatusSelect
                        orderId={o.id}
                        customerId={o.user_id}
                        currentStatus={o.status}
                        currentDriverId={o.driver_id}
                    />
                </div>

                {/* Metric 4: Placement Date */}
                <div className="bg-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-4 right-4 text-white/20">
                        <Calendar size={28} />
                    </div>
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-sm font-semibold text-white mt-1">{formattedDate}</p>
                    <p className="text-[10px] text-white/30 font-mono mt-1">Full ID: {o.id}</p>
                </div>
            </div>

            {/* Main Content Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Section: Order Items & Summary (2 Columns) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Card */}
                    <div className="bg-charcoal border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h2 className="font-serif text-lg text-white font-bold flex items-center gap-2">
                                <Package size={18} className="text-gold-400" /> Order Items ({o.items?.length || 0})
                            </h2>
                            <span className="text-xs font-mono text-white/40">Subtotal: ₦{o.total_amount.toLocaleString("en-NG")}</span>
                        </div>

                        <div className="p-6 divide-y divide-white/5">
                            {o.items?.map((item: CartItem, i: number) => (
                                <div key={item.cartItemId || i} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-obsidian border border-white/10 overflow-hidden flex-shrink-0 relative">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.mealTitle} fill className="object-cover" unoptimized />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                                <Package size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-white font-semibold text-sm">{item.mealTitle}</h3>
                                                <p className="text-xs text-white/40 mt-0.5">Quantity: <strong className="text-white">{item.quantity}</strong></p>
                                            </div>
                                            <span className="text-sm font-bold text-gold-400">
                                                ₦{item.totalPrice.toLocaleString("en-NG")}
                                            </span>
                                        </div>

                                        {/* Selected Add-Ons */}
                                        {item.selectedAddOns?.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {item.selectedAddOns.map((addon: SelectedAddOn) => (
                                                    <span key={addon.addOnId} className="text-[11px] px-2.5 py-0.5 rounded-md bg-white/5 text-white/70 border border-white/10 flex items-center gap-1">
                                                        <span className="text-gold-400 font-bold">{addon.quantity > 1 ? `${addon.quantity}x` : '+'}</span>
                                                        {addon.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financial Summary Card */}
                    <div className="bg-charcoal border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h2 className="font-serif text-lg text-white font-bold border-b border-white/5 pb-3 flex items-center gap-2">
                            <FileText size={18} className="text-gold-400" /> Payment & Billing Breakdown
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between text-white/60">
                                <span>Items Subtotal</span>
                                <span className="font-mono text-white">₦{o.total_amount.toLocaleString("en-NG")}</span>
                            </div>
                            <div className="flex items-center justify-between text-white/60">
                                <span>Delivery Fee</span>
                                <span className="font-mono text-green-400 font-semibold">FREE</span>
                            </div>
                            <div className="flex items-center justify-between text-white/60">
                                <span>Taxes & Service Fees</span>
                                <span className="font-mono text-white">₦0</span>
                            </div>
                            
                            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                <span className="text-base font-bold text-white">Total Amount Paid</span>
                                <span className="text-xl font-bold text-gold-400 font-serif">₦{o.total_amount.toLocaleString("en-NG")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Customer & Delivery & Driver Details (1 Column) */}
                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-charcoal border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h2 className="font-serif text-lg text-white font-bold border-b border-white/5 pb-3 flex items-center gap-2">
                            <User size={18} className="text-gold-400" /> Customer Information
                        </h2>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white/40">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">Customer Name</p>
                                    <p className="text-sm font-semibold text-white mt-0.5">{o.customer_name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white/40">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">Phone Number</p>
                                    <a href={`tel:${o.customer_phone}`} className="text-sm text-gold-400 font-semibold hover:underline mt-0.5 inline-block">
                                        {o.customer_phone}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-white/5 text-white/40">
                                    <Mail size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white/40 uppercase tracking-wider font-semibold text-[10px]">Email Address</p>
                                    <p className="text-xs text-white/80 break-all mt-0.5">{o.customer_email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Card */}
                    <div className="bg-charcoal border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h2 className="font-serif text-lg text-white font-bold border-b border-white/5 pb-3 flex items-center gap-2">
                            <MapPin size={18} className="text-gold-400" /> Delivery Address
                        </h2>

                        <div className="p-3 bg-obsidian border border-white/10 rounded-xl flex items-start gap-3">
                            <MapPin size={18} className="text-gold-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-white leading-relaxed">{o.delivery_address}</p>
                        </div>
                    </div>

                    {/* Driver Assignment Card */}
                    <div className="bg-charcoal border border-white/5 rounded-2xl p-6 shadow-xl space-y-4">
                        <h2 className="font-serif text-lg text-white font-bold border-b border-white/5 pb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Truck size={18} className="text-gold-400" /> Assigned Dispatcher
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold uppercase tracking-wider border ${
                                assignedDriver ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"
                            }`}>
                                {assignedDriver ? "Assigned" : "Unassigned"}
                            </span>
                        </h2>

                        {assignedDriver ? (
                            <div className="bg-obsidian border border-white/10 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {assignedDriver.avatar_url ? (
                                                <img src={assignedDriver.avatar_url} alt={assignedDriver.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={18} className="text-white/40" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{assignedDriver.name}</h4>
                                            <p className="text-xs text-white/40">{assignedDriver.phone}</p>
                                        </div>
                                    </div>
                                    <a
                                        href={`tel:${assignedDriver.phone}`}
                                        className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs font-bold hover:bg-green-500/20 transition-all"
                                    >
                                        Call Rider
                                    </a>
                                </div>

                                {(assignedDriver.vehicle_type || assignedDriver.vehicle_plate) && (
                                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                                        <span className="capitalize">{assignedDriver.vehicle_type || "Vehicle"}</span>
                                        {assignedDriver.vehicle_plate && <span className="font-mono text-white/70">{assignedDriver.vehicle_plate}</span>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-obsidian border border-white/10 rounded-xl text-center">
                                <Truck size={24} className="text-white/20 mx-auto mb-2" />
                                <p className="text-xs text-white/50">No rider assigned yet.</p>
                                <p className="text-[10px] text-white/30 mt-1">Use the Fulfilment control above or status dropdown to assign a driver.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
