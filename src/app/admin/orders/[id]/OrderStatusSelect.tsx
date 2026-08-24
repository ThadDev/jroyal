"use client";
// ============================================================
// OrderStatusSelect.tsx
// Admin order status selector + driver assignment control.
// Calls /api/admin/orders/[id]/status
// ============================================================
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import type { OrderStatus, Driver } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";
import { Loader2, Truck } from "lucide-react";

interface OrderStatusSelectProps {
    orderId: string;
    customerId: string | null;
    currentStatus: OrderStatus;
    currentDriverId?: string | null;
}

const ALL_STATUSES: OrderStatus[] = [
    "pending",
    "processing",
    "preparing",
    "ready",
    "out_for_delivery",
    "completed",
    "cancelled",
];

const STATUS_CLASSES: Record<OrderStatus, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    preparing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    ready: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    out_for_delivery: "bg-blue-400/10 text-blue-300 border-blue-400/20",
    completed: "bg-green-500/10 text-green-400 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function OrderStatusSelect({
    orderId,
    currentStatus,
    currentDriverId = null,
}: OrderStatusSelectProps) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [driverId, setDriverId] = useState<string | null>(currentDriverId);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showDriverPicker, setShowDriverPicker] = useState(currentStatus === "out_for_delivery");
    const router = useRouter();
    const { showToast } = useToast();

    // Fetch drivers list on mount
    useEffect(() => {
        fetch("/api/admin/drivers")
            .then((r) => r.ok ? r.json() : [])
            .then((data) => setDrivers(data))
            .catch(() => {});
    }, []);

    const updateOrder = async (newStatus: OrderStatus, newDriverId?: string | null) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    driver_id: newDriverId !== undefined ? newDriverId : driverId,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error ?? "Failed to update order");
            }

            showToast(`Order status updated to ${ORDER_STATUS_LABELS[newStatus]}`, "success");
            router.refresh();
        } catch (error: any) {
            console.error("Error updating status:", error);
            showToast(error.message ?? "Failed to update status", "error");
            setStatus(currentStatus); // Revert
        } finally {
            setIsUpdating(false);
        }
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderStatus;
        setStatus(newStatus);

        if (newStatus === "out_for_delivery") {
            setShowDriverPicker(true);
        } else {
            setShowDriverPicker(false);
        }

        await updateOrder(newStatus, driverId);
    };

    const handleDriverChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDriverId = e.target.value || null;
        setDriverId(selectedDriverId);
        await updateOrder(status, selectedDriverId);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="relative inline-flex items-center gap-2">
                <select
                    value={status}
                    onChange={handleStatusChange}
                    disabled={isUpdating}
                    className={`appearance-none outline-none text-xs font-semibold uppercase tracking-wider py-1.5 pl-3 pr-8 rounded-full border cursor-pointer transition-all ${
                        STATUS_CLASSES[status] ?? STATUS_CLASSES.pending
                    }`}
                >
                    {ALL_STATUSES.map((st) => (
                        <option key={st} value={st} className="bg-obsidian text-white">
                            {ORDER_STATUS_LABELS[st]}
                        </option>
                    ))}
                </select>

                {isUpdating && (
                    <Loader2 size={13} className="animate-spin text-white/50" />
                )}
            </div>

            {/* Driver assignment dropdown — shown when out_for_delivery or when driver assigned */}
            {(showDriverPicker || status === "out_for_delivery" || driverId) && (
                <div className="flex items-center gap-2 mt-1">
                    <Truck size={13} className="text-gold-400 flex-shrink-0" />
                    <select
                        value={driverId ?? ""}
                        onChange={handleDriverChange}
                        disabled={isUpdating}
                        className="bg-obsidian border border-white/10 text-white/80 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-gold-500/50"
                    >
                        <option value="" className="bg-obsidian text-white/50">
                            -- Assign Driver --
                        </option>
                        {drivers.map((d) => (
                            <option key={d.id} value={d.id} className="bg-obsidian text-white">
                                {d.name} {d.phone ? `(${d.phone})` : ""} {d.status === "inactive" ? "[Inactive]" : ""}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
}
