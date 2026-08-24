// ============================================================
// POST /api/payments/webhook
// Receives Paystack webhook events.
// Must be excluded from Next.js body parsing (raw body needed
// for HMAC verification).
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackWebhookSignature, type PaystackWebhookEvent } from "@/lib/paystack/webhook";
import { verifyPaystackTransaction } from "@/lib/paystack/verify";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

// Tell Next.js NOT to parse the body — we need the raw string for HMAC
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    // 1. Read raw body for HMAC verification
    let rawBody: string;
    try {
        rawBody = await request.text();
    } catch {
        return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
    }

    // 2. Verify Paystack signature (reject anything that fails)
    const signature = request.headers.get("x-paystack-signature") ?? "";
    if (!verifyPaystackWebhookSignature(rawBody, signature)) {
        console.warn("[payments/webhook] Invalid signature — rejecting request");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 3. Parse the event
    let event: PaystackWebhookEvent;
    try {
        event = JSON.parse(rawBody) as PaystackWebhookEvent;
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // 4. We only care about successful charge events
    if (event.event !== "charge.success") {
        // Acknowledge other events without processing them
        return NextResponse.json({ received: true });
    }

    const { reference, amount: amountKobo, id: paystackTxnId } = event.data;

    if (!reference) {
        console.warn("[payments/webhook] charge.success received with no reference");
        return NextResponse.json({ received: true });
    }

    const adminSupabase = createAdminClient();

    // 5. Find the order by reference
    const { data: order, error: orderError } = await adminSupabase
        .from("orders")
        .select(
            "id, user_id, customer_name, customer_email, total_amount, payment_status, payment_verified, status"
        )
        .eq("payment_reference", reference)
        .single();

    if (orderError || !order) {
        // Reference doesn't match any order — could be a test event or invalid ref
        console.warn(`[payments/webhook] No order found for reference: ${reference}`);
        return NextResponse.json({ received: true });
    }

    // 6. IDEMPOTENCY: skip if already processed
    if (order.payment_verified && order.payment_status === "paid") {
        console.log(`[payments/webhook] Already processed for ref: ${reference} — skipping`);
        return NextResponse.json({ received: true });
    }

    // 7. Server-side re-verification with Paystack API
    const { verified, data: txn } = await verifyPaystackTransaction(reference);

    if (!verified || !txn) {
        console.error(`[payments/webhook] Re-verification failed for ref: ${reference}`);
        return NextResponse.json({ received: true }); // Still 200 to Paystack
    }

    // 8. Validate amount (anti-fraud: reject if amounts don't match)
    const expectedKobo = order.total_amount * 100;
    if (txn.amount !== expectedKobo || amountKobo !== expectedKobo) {
        console.error(
            `[payments/webhook] Amount mismatch for ref ${reference}:`,
            `expected ${expectedKobo}, got txn.amount=${txn.amount}, event.amount=${amountKobo}`
        );
        // Mark as failed so the customer can see and potentially retry
        await adminSupabase
            .from("orders")
            .update({ payment_status: "failed" })
            .eq("id", order.id);
        return NextResponse.json({ received: true });
    }

    // 9. All checks passed — mark order as paid
    const { error: updateError } = await adminSupabase
        .from("orders")
        .update({
            payment_status: "paid",
            payment_verified: true,
            paystack_txn_id: String(paystackTxnId),
            status: "processing",
        })
        .eq("id", order.id)
        .eq("payment_verified", false); // Extra safety: only update if not already verified

    if (updateError) {
        console.error("[payments/webhook] Failed to update order:", updateError);
        return NextResponse.json({ received: true });
    }

    // 10. Notify admin via existing infrastructure

    // 10a. Supabase notification (triggers Realtime for the admin dashboard)
    try {
        await sendNotification({
            userId: null, // null = admin broadcast
            title: "New Order Paid ✓",
            body: `${order.customer_name} paid ₦${order.total_amount.toLocaleString("en-NG")} — Order ready to prepare.`,
            type: "payment",
            metadata: {
                order_id: order.id,
                reference,
                amount: order.total_amount,
                customer_name: order.customer_name,
            },
            url: `/admin/orders/${order.id}`,
        });
    } catch (notifyErr) {
        // Non-fatal — order is already marked paid, notification failure doesn't block
        console.error("[payments/webhook] Notification error:", notifyErr);
    }

    // 10b. Socket.IO real-time event to admin room
    try {
        const io = (global as unknown as { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } }).io;
        if (io) {
            io.to("admin-room").emit("new_order", {
                name: order.customer_name,
                email: order.customer_email,
                amount: order.total_amount,
                order_id: order.id,
                reference,
            });
        }
    } catch (socketErr) {
        console.error("[payments/webhook] Socket.IO emit error:", socketErr);
    }

    console.log(`[payments/webhook] Successfully processed payment for ref: ${reference}, order: ${order.id}`);
    return NextResponse.json({ received: true });
}
