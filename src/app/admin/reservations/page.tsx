"use client";
import { useState, useEffect, useCallback } from "react";
import { Download, Filter, CalendarDays } from "lucide-react";
import { SERVICE_LABELS, STATUS_COLORS, formatDate, formatTime } from "@/lib/utils";
import type { Reservation } from "@/types";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "cancelled"];

export default function AdminReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDate, setFilterDate] = useState("");
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchReservations = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filterStatus !== "all") params.set("status", filterStatus);
        if (filterDate) params.set("date", filterDate);
        const res = await fetch(`/api/admin/reservations?${params}`);
        const data = await res.json();
        setReservations(Array.isArray(data) ? data : []);
        setLoading(false);
    }, [filterStatus, filterDate]);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        await fetch("/api/admin/reservations", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status }),
        });
        setUpdating(null);
        fetchReservations();
    };

    const exportCSV = () => {
        const params = new URLSearchParams();
        if (filterStatus !== "all") params.set("status", filterStatus);
        if (filterDate) params.set("date", filterDate);
        window.open(`/api/admin/export?${params}`, "_blank");
    };

    return (
        <div className="p-4 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-2xl md:text-3xl text-white font-bold">Reservations</h1>
                    <p className="text-white/40 text-sm mt-1">
                        {loading ? "Loading..." : `${reservations.length} reservation${reservations.length !== 1 ? "s" : ""} found`}
                    </p>
                </div>
                <button onClick={exportCSV} className="btn-outline text-xs gap-2 w-full sm:w-auto flex justify-center py-3 sm:py-2" id="export-csv">
                    <Download size={14} />
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-charcoal border border-white/5 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-white/40" />
                        <span className="text-white/40 text-[10px] uppercase tracking-wider">Status</span>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-dark py-2.5 text-sm w-full"
                        id="filter-status"
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-white/40" />
                        <span className="text-white/40 text-[10px] uppercase tracking-wider">Date</span>
                    </div>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="input-dark py-2 text-sm w-full"
                        id="filter-date"
                    />
                </div>
                <div className="sm:col-span-2 lg:col-span-1 flex items-center h-full pt-4">
                    {(filterStatus !== "all" || filterDate) && (
                        <button
                            onClick={() => { setFilterStatus("all"); setFilterDate(""); }}
                            className="text-gold-400 hover:text-gold-300 text-xs transition-colors underline underline-offset-4"
                        >
                            Clear All Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-charcoal border border-white/5 overflow-x-auto">
                <table className="w-full admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Contact</th>
                            <th>Service</th>
                            <th>Date & Time</th>
                            <th>Guests</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-white/30">Loading reservations…</td>
                            </tr>
                        ) : reservations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-white/30">No reservations found.</td>
                            </tr>
                        ) : (
                            reservations.map((r) => (
                                <tr key={r.id}>
                                    <td>
                                        <p className="font-medium text-white/90">{r.name}</p>
                                        <p className="text-white/30 text-xs mt-0.5">{formatDate(r.created_at)}</p>
                                    </td>
                                    <td>
                                        <p className="text-white/70">{r.email}</p>
                                        <p className="text-white/40 text-xs">{r.phone}</p>
                                    </td>
                                    <td>{SERVICE_LABELS[r.service] ?? r.service}</td>
                                    <td>
                                        <p>{formatDate(r.date)}</p>
                                        <p className="text-white/40 text-xs">{formatTime(r.time)}</p>
                                    </td>
                                    <td>{r.guests}</td>
                                    <td>
                                        <span className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase border ${STATUS_COLORS[r.status] ?? ""}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            {r.status !== "confirmed" && (
                                                <button
                                                    onClick={() => updateStatus(r.id, "confirmed")}
                                                    disabled={updating === r.id}
                                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {r.status !== "cancelled" && (
                                                <button
                                                    onClick={() => updateStatus(r.id, "cancelled")}
                                                    disabled={updating === r.id}
                                                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {loading ? (
                    <div className="text-center py-12 text-white/30 bg-white/5 border border-white/10 rounded-xl">Loading...</div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-12 text-white/30 bg-white/5 border border-white/10 rounded-xl">No reservations found.</div>
                ) : (
                    reservations.map((r) => (
                        <div key={r.id} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-white font-serif font-bold text-lg">{r.name}</h3>
                                    <p className="text-xs text-white/40">{SERVICE_LABELS[r.service] ?? r.service}</p>
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-bold tracking-widest uppercase border ${STATUS_COLORS[r.status] ?? ""}`}>
                                    {r.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                                <div>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Date & Time</p>
                                    <p className="text-white text-sm">{formatDate(r.date)}</p>
                                    <p className="text-white/40 text-xs">{formatTime(r.time)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Guests</p>
                                    <p className="text-white text-sm font-bold">{r.guests} People</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Phone</p>
                                    <p className="text-white text-sm">{r.phone}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Email</p>
                                    <p className="text-white text-xs truncate">{r.email}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {r.status !== "confirmed" && (
                                    <button
                                        onClick={() => updateStatus(r.id, "confirmed")}
                                        disabled={updating === r.id}
                                        className="flex-1 py-3 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Confirm
                                    </button>
                                )}
                                {r.status !== "cancelled" && (
                                    <button
                                        onClick={() => updateStatus(r.id, "cancelled")}
                                        disabled={updating === r.id}
                                        className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
