"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Truck,
    Plus,
    Edit2,
    Trash2,
    Phone,
    User,
    CheckCircle2,
    XCircle,
    Loader2,
    Search,
    ShieldAlert,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import type { Driver, VehicleType, DriverStatus } from "@/types";

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
    { value: "motorcycle", label: "Motorcycle" },
    { value: "car", label: "Car" },
    { value: "bicycle", label: "Bicycle" },
    { value: "on_foot", label: "On Foot" },
    { value: "van", label: "Van" },
];

export default function DriversManagementClient() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    // Form state
    const [form, setForm] = useState({
        name: "",
        phone: "",
        vehicle_type: "motorcycle" as VehicleType,
        vehicle_plate: "",
        avatar_url: "",
        status: "active" as DriverStatus,
        notes: "",
    });

    const fetchDrivers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/drivers");
            if (res.ok) {
                const data = await res.json();
                setDrivers(data);
            } else {
                showToast("Failed to load drivers", "error");
            }
        } catch {
            showToast("Network error fetching drivers", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const handleOpenCreate = () => {
        setEditingDriver(null);
        setForm({
            name: "",
            phone: "",
            vehicle_type: "motorcycle",
            vehicle_plate: "",
            avatar_url: "",
            status: "active",
            notes: "",
        });
        setShowModal(true);
    };

    const handleOpenEdit = (driver: Driver) => {
        setEditingDriver(driver);
        setForm({
            name: driver.name,
            phone: driver.phone,
            vehicle_type: driver.vehicle_type ?? "motorcycle",
            vehicle_plate: driver.vehicle_plate ?? "",
            avatar_url: driver.avatar_url ?? "",
            status: driver.status ?? "active",
            notes: driver.notes ?? "",
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.phone.trim()) {
            showToast("Name and phone number are required", "error");
            return;
        }

        setSaving(true);
        try {
            const url = editingDriver
                ? `/api/admin/drivers/${editingDriver.id}`
                : "/api/admin/drivers";
            const method = editingDriver ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                showToast(
                    editingDriver ? "Driver updated" : "Driver added successfully",
                    "success"
                );
                setShowModal(false);
                fetchDrivers();
            } else {
                const errData = await res.json();
                showToast(errData.error ?? "Operation failed", "error");
            }
        } catch {
            showToast("Network error saving driver", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (driver: Driver) => {
        const newStatus: DriverStatus = driver.status === "active" ? "inactive" : "active";
        try {
            const res = await fetch(`/api/admin/drivers/${driver.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                showToast(`Driver status set to ${newStatus}`, "info");
                fetchDrivers();
            } else {
                showToast("Failed to update status", "error");
            }
        } catch {
            showToast("Network error updating status", "error");
        }
    };

    const handleDelete = async (driver: Driver) => {
        if (!confirm(`Are you sure you want to delete ${driver.name}?`)) return;

        try {
            const res = await fetch(`/api/admin/drivers/${driver.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("Driver deleted", "info");
                fetchDrivers();
            } else {
                showToast("Failed to delete driver", "error");
            }
        } catch {
            showToast("Network error deleting driver", "error");
        }
    };

    const filteredDrivers = drivers.filter(
        (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.phone.includes(searchTerm) ||
            (d.vehicle_plate && d.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="font-serif text-2xl md:text-3xl text-white font-bold flex items-center gap-3">
                        <Truck className="text-gold-400" size={28} />
                        Driver & Delivery Management
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        Manage active delivery personnel and assign riders to restaurant orders.
                    </p>
                </div>

                <button
                    onClick={handleOpenCreate}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gold-500 text-obsidian font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-gold-400 transition-all cursor-pointer"
                >
                    <Plus size={16} /> Add New Driver
                </button>
            </div>

            {/* Controls Bar */}
            <div className="bg-charcoal border border-white/5 p-4 rounded-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search drivers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-obsidian border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-gold-500/50"
                    />
                </div>
                <div className="text-xs text-white/40 flex items-center gap-3">
                    <span>Total: <strong className="text-white">{drivers.length}</strong></span>
                    <span>Active: <strong className="text-green-400">{drivers.filter(d => d.status === "active").length}</strong></span>
                </div>
            </div>

            {/* Drivers Grid */}
            {loading ? (
                <div className="p-12 text-center text-white/40 flex items-center justify-center gap-3">
                    <Loader2 size={20} className="animate-spin text-gold-400" />
                    Loading drivers...
                </div>
            ) : filteredDrivers.length === 0 ? (
                <div className="bg-charcoal border border-white/5 rounded-xl p-12 text-center">
                    <Truck size={40} className="text-white/10 mx-auto mb-3" />
                    <p className="text-white/50 text-base font-serif mb-1">No drivers found</p>
                    <p className="text-white/30 text-xs mb-4">Add your delivery personnel to assign them to customer orders.</p>
                    <button
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/10 text-gold-400 border border-gold-500/20 rounded-lg text-xs font-semibold hover:bg-gold-500/20"
                    >
                        <Plus size={14} /> Add Driver Now
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDrivers.map((driver) => {
                        const isActive = driver.status === "active";
                        return (
                            <div
                                key={driver.id}
                                className="bg-charcoal border border-white/5 rounded-xl p-5 hover:border-gold-500/20 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {driver.avatar_url ? (
                                                    <img src={driver.avatar_url} alt={driver.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={22} className="text-white/40" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold text-sm">{driver.name}</h3>
                                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border mt-1 ${
                                                    isActive
                                                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                }`}>
                                                    {isActive ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                    {driver.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs text-white/60 mb-4 border-t border-white/5 pt-3">
                                        <div className="flex items-center gap-2">
                                            <Phone size={13} className="text-white/30" />
                                            <span>{driver.phone}</span>
                                        </div>
                                        {driver.vehicle_type && (
                                            <div className="flex items-center gap-2">
                                                <Truck size={13} className="text-white/30" />
                                                <span className="capitalize">{driver.vehicle_type}</span>
                                                {driver.vehicle_plate && <span className="text-white/40 font-mono">({driver.vehicle_plate})</span>}
                                            </div>
                                        )}
                                        {driver.notes && (
                                            <p className="text-[11px] text-white/30 italic line-clamp-2 mt-2">
                                                "{driver.notes}"
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-2">
                                    <button
                                        onClick={() => handleToggleStatus(driver)}
                                        className={`text-xs font-semibold transition-colors ${
                                            isActive ? "text-amber-400 hover:text-amber-300" : "text-green-400 hover:text-green-300"
                                        }`}
                                    >
                                        {isActive ? "Deactivate" : "Activate"}
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEdit(driver)}
                                            className="p-1.5 rounded bg-white/5 text-white/50 hover:text-gold-400 hover:bg-white/10 transition-colors"
                                            title="Edit Driver"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(driver)}
                                            className="p-1.5 rounded bg-white/5 text-white/50 hover:text-red-400 hover:bg-white/10 transition-colors"
                                            title="Delete Driver"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal for Add / Edit Driver */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-charcoal border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
                        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <h2 className="font-serif text-lg font-bold text-white">
                                {editingDriver ? "Edit Driver" : "Add New Driver"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-white/40 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">
                                    Driver Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Emeka Okafor"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">
                                    Phone Number *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. +234 801 234 5678"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gold-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-white/60 mb-1 font-semibold">
                                        Vehicle Type
                                    </label>
                                    <select
                                        value={form.vehicle_type}
                                        onChange={(e) => setForm({ ...form, vehicle_type: e.target.value as VehicleType })}
                                        className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                    >
                                        {VEHICLE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value} className="bg-obsidian text-white">
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-white/60 mb-1 font-semibold">
                                        Plate Number / ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ENU-123-AB"
                                        value={form.vehicle_plate}
                                        onChange={(e) => setForm({ ...form, vehicle_plate: e.target.value })}
                                        className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">
                                    Avatar Image URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={form.avatar_url}
                                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">
                                    Status
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50"
                                >
                                    <option value="active" className="bg-obsidian text-white">Active (Available)</option>
                                    <option value="inactive" className="bg-obsidian text-white">Inactive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-white/60 mb-1 font-semibold">
                                    Notes / Dispatch info
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Special instructions or rider notes..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    className="w-full bg-obsidian border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-gold-500/50 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60 text-xs font-semibold hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-5 py-2 bg-gold-500 text-obsidian rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gold-400 disabled:opacity-50 inline-flex items-center gap-2"
                                >
                                    {saving && <Loader2 size={12} className="animate-spin" />}
                                    {editingDriver ? "Save Changes" : "Create Driver"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
