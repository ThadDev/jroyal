"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import type { OrderStatus } from "@/types";
import { Loader2 } from "lucide-react";

export default function OrderStatusSelect({ orderId, customerId, currentStatus }: { orderId: string, customerId: string | null, currentStatus: OrderStatus }) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const supabase = createClient();
    const router = useRouter();
    const { showToast } = useToast();

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as OrderStatus;
        setStatus(newStatus);
        setIsUpdating(true);

        try {
            const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", orderId);

            if (error) throw error;
            showToast("Order status updated", "success");
            
            // Notify customer if they are a registered user
            if (customerId) {
                try {
                    await fetch("/api/notifications/trigger-user", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userId: customerId,
                            title: "Order Status Updated",
                            message: `Your order is now ${newStatus}.`,
                            type: newStatus === "cancelled" ? "cancellation" : "order",
                            url: `/dashboard/orders`,
                        }),
                    });
                } catch (notifyErr) {
                    console.error("Failed to trigger customer notification:", notifyErr);
                }
            }

            router.refresh();
        } catch (error: any) {
            console.error("Error updating status:", error);
            showToast("Failed to update status", "error");
            setStatus(currentStatus); // Revert
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative inline-block">
            <select
                value={status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className={`appearance-none outline-none text-xs font-semibold uppercase tracking-wider py-1.5 pl-3 pr-8 rounded-full border cursor-pointer ${
                    status === "completed" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    status === "processing" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    "bg-gold-500/10 text-gold-400 border-gold-500/20"
                }`}
            >
                <option value="pending" className="bg-obsidian text-white">Pending</option>
                <option value="processing" className="bg-obsidian text-white">Processing</option>
                <option value="completed" className="bg-obsidian text-white">Completed</option>
                <option value="cancelled" className="bg-obsidian text-white">Cancelled</option>
            </select>
            
            {isUpdating && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Loader2 size={12} className="animate-spin text-white/50" />
                </div>
            )}
        </div>
    );
}
