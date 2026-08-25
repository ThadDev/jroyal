// ============================================================
// PATCH /api/admin/orders/[id]/status
// Admin-only. Updates order status, optionally assigns a driver,
// triggers appropriate customer notification.
// Idempotent: won't re-send notifications for same status.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";
import type { OrderStatus } from "@/types";

async function assertAdmin() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    return profile?.role === "admin" ? user : null;
}

const NOTIFICATION_TRIGGERS: Partial<Record<OrderStatus, {
    title: (orderId: string) => string;
    body: (orderId: string, extra?: Record<string, any>) => string;
}>> = {
    processing: {
        title: (id) => "Order Received & Preparing 👨‍🍳",
        body: (id) =>
            `Your order #${id.slice(0, 8).toUpperCase()} has been received and is being prepared in our kitchen.`,
    },
    ready: {
        title: (id) => "Order Ready for Pickup 🍱",
        body: (id) =>
            `Your order #${id.slice(0, 8).toUpperCase()} is ready and awaiting pickup/dispatch.`,
    },
    out_for_delivery: {
        title: (id) => "Your Order is On the Way 🚚",
        body: (id, extra) => {
            const driverInfo = extra?.driver_name
                ? ` ${extra.driver_name} is delivering your order.`
                : "";
            return `Your order #${id.slice(0, 8).toUpperCase()} has been picked up and is heading to you.${driverInfo}`;
        },
    },
    cancelled: {
        title: (id) => "Order Cancelled",
        body: (id) =>
            `Your order #${id.slice(0, 8).toUpperCase()} has been cancelled. Contact us if you need help.`,
    },
};

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await assertAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: orderId } = await params;
    let body: { status: OrderStatus; driver_id?: string | null };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { status: newStatus, driver_id } = body;

    if (!newStatus) return NextResponse.json({ error: "status is required" }, { status: 400 });

    const adminSupabase = createAdminClient();

    // Fetch current order to check previous status & get user_id
    const { data: order, error: fetchError } = await adminSupabase
        .from("orders")
        .select("id, status, user_id, driver_id, customer_name, total_amount")
        .eq("id", orderId)
        .single();

    if (fetchError || !order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Skip notification if status didn't actually change
    const statusChanged = order.status !== newStatus;

    // Build update payload
    const updatePayload: Record<string, any> = { status: newStatus };

    // Assign driver if provided (only when moving to out_for_delivery)
    if (driver_id !== undefined) {
        updatePayload.driver_id = driver_id;
    }

    // Persist the update
    const { data: updated, error: updateError } = await adminSupabase
        .from("orders")
        .update(updatePayload)
        .eq("id", orderId)
        .select()
        .single();

    if (updateError) {
        console.error("[admin/orders/status] Update error:", updateError);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }

    // Emit Socket.IO for admin live panel
    try {
        const io = (global as any).io;
        if (io) {
            io.to("admin-room").emit("order_status_changed", {
                order_id: orderId,
                status: newStatus,
                customer_name: order.customer_name,
            });
        }
    } catch {}

    // Only trigger customer notification if status changed and customer is registered
    if (statusChanged && order.user_id) {
        const trigger = NOTIFICATION_TRIGGERS[newStatus];
        if (trigger) {
            // Fetch driver name if assigning to out_for_delivery
            let driverExtra: Record<string, any> = {};
            const driverIdToUse = driver_id ?? order.driver_id;
            if (newStatus === "out_for_delivery" && driverIdToUse) {
                const { data: driver } = await adminSupabase
                    .from("drivers")
                    .select("name, phone")
                    .eq("id", driverIdToUse)
                    .single();
                if (driver) {
                    driverExtra = { driver_name: driver.name, driver_phone: driver.phone };
                }
            }

            try {
                await sendNotification({
                    userId: order.user_id,
                    title: trigger.title(orderId),
                    body: trigger.body(orderId, driverExtra),
                    type: "order_status",
                    metadata: {
                        order_id: orderId,
                        order_status: newStatus,
                        url: `/dashboard/orders/${orderId}/track`,
                        ...driverExtra,
                    },
                    url: `/dashboard/orders/${orderId}/track`,
                });
            } catch (notifyErr) {
                console.error("[admin/orders/status] Notification error:", notifyErr);
            }
        }
    }

    return NextResponse.json({ success: true, order: updated });
}
