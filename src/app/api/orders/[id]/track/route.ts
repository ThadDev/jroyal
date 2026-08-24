// ============================================================
// GET /api/orders/[id]/track
// Customer-facing: returns their own order with driver info.
// Only exposes safe driver fields (no sensitive admin notes).
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: orderId } = await params;
        const adminSupabase = createAdminClient();

        // Fetch order + driver info
        const { data: order, error: orderError } = await adminSupabase
            .from("orders")
            .select(`
                id,
                user_id,
                status,
                payment_status,
                payment_verified,
                total_amount,
                items,
                delivery_address,
                customer_name,
                customer_phone,
                driver_id,
                created_at,
                updated_at
            `)
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Security: only the order owner can access
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Fetch driver info separately (safe fields only)
        let driver = null;
        if (order.driver_id) {
            const { data: driverData } = await adminSupabase
                .from("drivers")
                .select("id, name, phone, avatar_url, vehicle_type, vehicle_plate")
                .eq("id", order.driver_id)
                .single();
            driver = driverData;
        }

        return NextResponse.json({ order: { ...order, driver } });
    } catch (err) {
        console.error("[orders/track] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
