// ============================================================
// GET /api/payments/verify/[reference]
// Frontend polls this after the Paystack popup callback fires.
// Returns the current payment status of the order — does NOT
// blindly trust the frontend claim. Checks DB and optionally
// re-verifies with Paystack if the payment is not yet confirmed.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyPaystackTransaction } from "@/lib/paystack/verify";
import { sendNotification } from "@/lib/notifications";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    try {
        // 1. Authenticate user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { reference } = await params;

        if (!reference || typeof reference !== "string") {
            return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
        }

        // 2. Find the order by reference — ensure it belongs to this user
        const adminSupabase = createAdminClient();
        const { data: order, error: orderError } = await adminSupabase
            .from("orders")
            .select(
                "id, status, payment_status, payment_verified, total_amount, payment_reference, user_id, customer_name"
            )
            .eq("payment_reference", reference)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Security: ensure the order belongs to the authenticated user
        if (order.user_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. If already verified — return immediately (idempotent)
        if (order.payment_verified && order.payment_status === "paid") {
            return NextResponse.json({
                payment_status: "paid",
                order_status: order.status,
                order_id: order.id,
                verified: true,
            });
        }

        // 4. If not yet verified — check with Paystack now
        //    (handles the case where the webhook hasn't arrived yet)
        const { verified, data: txn, message } = await verifyPaystackTransaction(reference);

        if (!verified || !txn) {
            return NextResponse.json({
                payment_status: order.payment_status,
                order_status: order.status,
                order_id: order.id,
                verified: false,
                detail: message,
            });
        }

        // 5. Validate amount matches expected order total (anti-fraud)
        const expectedKobo = order.total_amount * 100;
        if (txn.amount !== expectedKobo) {
            console.warn(
                `[payments/verify] Amount mismatch for ref ${reference}:`,
                `expected ${expectedKobo}, got ${txn.amount}`
            );
            return NextResponse.json({
                payment_status: "failed",
                order_status: order.status,
                order_id: order.id,
                verified: false,
                detail: "Amount mismatch detected",
            });
        }

        // 6. Payment looks good from Paystack — update the order
        const { error: updateError } = await adminSupabase
            .from("orders")
            .update({
                payment_status: "paid",
                payment_verified: true,
                paystack_txn_id: String(txn.id),
                status: "processing",
            })
            .eq("id", order.id)
            .eq("payment_verified", false); // Only update if not already verified

        if (updateError) {
            console.error("[payments/verify] Update error:", updateError);
        }

        // 7. Send notification to admin dashboard
        try {
            await sendNotification({
                userId: null, // Broadcast to all admins
                title: "New Order Paid ✓",
                body: `${order.customer_name || "A customer"} paid ₦${order.total_amount.toLocaleString("en-NG")} — Order ready to prepare.`,
                type: "payment",
                metadata: {
                    order_id: order.id,
                    reference,
                    amount: order.total_amount,
                    customer_name: order.customer_name,
                },
                url: `/admin/orders`,
            });
        } catch (notifyErr) {
            console.error("[payments/verify] Notification trigger warning:", notifyErr);
        }

        return NextResponse.json({
            payment_status: "paid",
            order_status: "processing",
            order_id: order.id,
            verified: true,
        });
    } catch (error) {
        console.error("[payments/verify] Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
