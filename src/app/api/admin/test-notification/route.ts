// ============================================================
// POST /api/admin/test-notification
// Admin testing utility to trigger real notifications across DB,
// Socket.IO, Toast, and Push channels.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";
import type { NotificationType } from "@/types";

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

export async function POST(request: NextRequest) {
    const admin = await assertAdmin();
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized — Admin role required" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            target = "admin", // "admin" (userId=null) or "user" (userId specified)
            userId = null,
            title = "Test Notification",
            message = "This is a test notification from the Jroyal Grills admin panel.",
            type = "system" as NotificationType,
            url = "/admin",
            metadata = {},
        } = body;

        const adminSupabase = createAdminClient();

        // Target user: if "self", send to current admin user's ID
        let targetUserId: string | null = null;
        if (target === "self") {
            targetUserId = admin.id;
        } else if (target === "user" && userId) {
            targetUserId = userId;
        }

        // Trigger notification through central service (DB + Socket.IO + FCM)
        const result = await sendNotification({
            userId: targetUserId,
            title,
            body: message,
            type,
            metadata: {
                ...metadata,
                test_triggered_at: new Date().toISOString(),
                triggered_by_admin: admin.email,
            },
            url,
        });

        // Also emit admin Socket.IO event if relevant
        try {
            const io = (global as any).io;
            if (io) {
                if (type === "order" || metadata?.order_id) {
                    io.to("admin-room").emit("new_order", {
                        name: metadata?.customer_name ?? "Test Customer",
                        amount: metadata?.total_amount ?? 15000,
                        id: metadata?.order_id ?? "TEST-ORDER-123",
                    });
                } else if (type === "reservation") {
                    io.to("admin-room").emit("new_reservation", {
                        name: metadata?.guest_name ?? "Test Guest",
                        service: metadata?.service ?? "Restaurant Dining",
                    });
                } else if (type === "signup") {
                    io.to("admin-room").emit("new_signup", {
                        email: metadata?.user_email ?? "testuser@example.com",
                    });
                }
            }
        } catch {}

        if (!result.success) {
            return NextResponse.json({ error: "Failed to dispatch notification", details: result.error }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            notification: result.notification,
            pushResponse: result.pushResponse ?? null,
            message: `Notification dispatched successfully to ${targetUserId ? `User (${targetUserId})` : "Admins (Broadcast)"}`,
        });
    } catch (err: any) {
        console.error("[api/admin/test-notification] Error:", err);
        return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
    }
}
