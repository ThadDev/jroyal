import { createAdminClient } from "@/lib/supabase/server";
import { CalendarDays, CheckCircle, Clock, Users, ArrowRight, ShoppingCart } from "lucide-react";
import { formatDate } from "@/lib/utils";
import NotificationPanel from "@/components/admin/NotificationPanel";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";


export const metadata: Metadata = { title: "Dashboard – Admin" };

async function getStats() {
    try {
        const supabase = createAdminClient();
        const today = new Date().toISOString().split("T")[0];

        const [
            { count: pendingReservations }, 
            { count: pendingOrders }, 
            { count: confirmedToday }, 
            { count: totalUsers },
            { data: recent }
        ] = await Promise.all([
            supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
            supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
            supabase.from("reservations").select("*", { count: "exact", head: true }).eq("date", today).eq("status", "confirmed"),
            supabase.from("profiles").select("*", { count: "exact", head: true }),
            supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(5),
        ]);

        return { 
            pendingReservations: pendingReservations ?? 0, 
            pendingOrders: pendingOrders ?? 0, 
            confirmedToday: confirmedToday ?? 0, 
            totalUsers: totalUsers ?? 0,
            recent: recent ?? [] 
        };
    } catch {
        return { pendingReservations: 0, pendingOrders: 0, confirmedToday: 0, totalUsers: 0, recent: [] };
    }
}

const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
};

export default async function AdminDashboardPage() {
    const { pendingReservations, pendingOrders, confirmedToday, totalUsers, recent } = await getStats();

    const stats = [
        { label: "Pending Reservations", value: pendingReservations, icon: CalendarDays, color: "text-blue-400" },
        { label: "Pending Orders", value: pendingOrders, icon: ShoppingCart, color: "text-yellow-400" },
        { label: "Confirmed Today", value: confirmedToday, icon: CheckCircle, color: "text-green-400" },
        { label: "Total Users", value: totalUsers, icon: Users, color: "text-gold-400" },
    ];

    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="font-serif text-2xl md:text-3xl text-white font-bold">Dashboard</h1>
                <p className="text-white/40 text-sm mt-1">Welcome back to Jroyal Grills admin</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-charcoal border border-white/5 p-5 md:p-6 rounded-xl">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-3">
                            <div>
                                <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-wider leading-tight">{label}</p>
                                <p className={`font-serif text-2xl md:text-4xl font-bold mt-1.5 ${color}`}>{value}</p>
                            </div>
                            <div className={`p-2 bg-white/5 rounded-lg ${color} opacity-80`}>
                                <Icon size={18} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Real-time notifications panel */}
            <div className="mb-8">
                <NotificationPanel />
            </div>

            {/* Recent Reservations */}
            <div className="bg-charcoal border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/[0.02]">
                    <h2 className="font-serif text-base text-white font-bold">Recent Activity</h2>
                    <Link href="/admin/reservations" className="text-gold-500 text-xs hover:text-gold-400 transition-colors flex items-center gap-1 font-bold">
                        VIEW ALL <ArrowRight size={12} />
                    </Link>
                </div>

                {/* Desktop Activity Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Guests</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recent.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-white/30 py-12">
                                        No recent reservations.
                                    </td>
                                </tr>
                            ) : (
                                recent.map((r: Record<string, string | number | boolean | null>) => (
                                    <tr key={String(r.id)} className="hover:bg-white/[0.01] transition-colors">
                                        <td className="font-medium text-white/80">{String(r.name)}</td>
                                        <td className="capitalize text-xs text-white/50">{String(r.service).replace("_", " ")}</td>
                                        <td className="text-sm">{formatDate(String(r.date))}</td>
                                        <td className="text-sm font-bold">{String(r.guests)}</td>
                                        <td>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-full ${statusColors[String(r.status)] ?? ""}`}>
                                                {String(r.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Activity Cards */}
                <div className="md:hidden divide-y divide-white/5">
                    {recent.length === 0 ? (
                        <div className="p-10 text-center text-white/30">No activity yet.</div>
                    ) : (
                        recent.map((r: Record<string, string | number | boolean | null>) => (
                            <div key={String(r.id)} className="p-5 flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-white font-medium text-sm">{String(r.name)}</h4>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{String(r.service).replace("_", " ")}</p>
                                    <p className="text-xs text-white/60 mt-1">{formatDate(String(r.date))}</p>
                                </div>
                                <span className={`flex-shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border rounded-full ${statusColors[String(r.status)] ?? ""}`}>
                                    {String(r.status)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
