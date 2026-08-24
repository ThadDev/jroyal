// ============================================================
// POST /api/payments/initialize
// Creates a pending order then initializes a Paystack transaction.
// The amount is computed server-side from canonical meal/addon data.
// The client total is NEVER trusted.
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { initializePaystackTransaction } from "@/lib/paystack/initialize";
import { MEALS } from "@/lib/data/meals";
import { ADDONS } from "@/lib/data/addons";
import type { CartItem } from "@/types";

// ── Server-side amount calculation ────────────────────────────
/**
 * Re-calculates the total from canonical server-side price data.
 * Never uses the prices embedded in the client's cart items.
 */
function computeServerTotal(items: CartItem[]): number {
    let total = 0;

    for (const item of items) {
        // Look up the canonical meal price (the source of truth)
        const meal = MEALS.find((m) => m.id === item.mealId);
        if (!meal) {
            throw new Error(`Unknown meal ID: ${item.mealId}`);
        }
        if (!meal.available) {
            throw new Error(`Meal '${meal.title}' is no longer available`);
        }

        // Calculate add-on costs using server-side prices
        let addOnCost = 0;
        for (const selectedAddOn of item.selectedAddOns) {
            const addon = ADDONS.find((a) => a.id === selectedAddOn.addOnId);
            if (!addon) {
                throw new Error(`Unknown add-on ID: ${selectedAddOn.addOnId}`);
            }
            if (selectedAddOn.quantity < 1) continue;
            addOnCost += addon.price * selectedAddOn.quantity;
        }

        total += (meal.basePrice + addOnCost) * item.quantity;
    }

    return total;
}

// ── Unique reference generator ────────────────────────────────
function generateReference(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `JR-${ts}-${rand}`;
}

// ── Route handler ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
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

        // 2. Parse and validate request body
        let body: {
            items?: CartItem[];
            customer_name?: string;
            customer_email?: string;
            customer_phone?: string;
            delivery_address?: string;
            order_id?: string;
        };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const { items, customer_name, customer_email, customer_phone, delivery_address, order_id } = body;
        const adminSupabase = createAdminClient();

        let orderIdToUse: string = order_id || "";
        let totalAmountNaira: number;
        let emailToUse: string;
        let nameToUse: string;

        if (order_id) {
            // Resuming or retrying payment for an EXISTING pending order
            const { data: existingOrder, error: fetchError } = await adminSupabase
                .from("orders")
                .select("*")
                .eq("id", order_id)
                .eq("user_id", user.id)
                .single();

            if (fetchError || !existingOrder) {
                return NextResponse.json({ error: "Pending order not found" }, { status: 404 });
            }

            if (existingOrder.payment_status === "paid") {
                return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
            }

            orderIdToUse = existingOrder.id;
            totalAmountNaira = existingOrder.total_amount;
            emailToUse = existingOrder.customer_email;
            nameToUse = existingOrder.customer_name;
        } else {
            // Creating a NEW pending order
            if (!items || !Array.isArray(items) || items.length === 0) {
                return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
            }
            if (!customer_name?.trim()) {
                return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
            }
            if (!customer_email?.trim()) {
                return NextResponse.json({ error: "Customer email is required" }, { status: 400 });
            }
            if (!customer_phone?.trim()) {
                return NextResponse.json({ error: "Customer phone is required" }, { status: 400 });
            }
            if (!delivery_address?.trim()) {
                return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
            }

            // Compute amount SERVER-SIDE (ignore client-provided prices)
            try {
                totalAmountNaira = computeServerTotal(items);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Invalid cart items";
                return NextResponse.json({ error: message }, { status: 400 });
            }

            if (totalAmountNaira <= 0) {
                return NextResponse.json({ error: "Order total must be greater than zero" }, { status: 400 });
            }

            emailToUse = customer_email.trim().toLowerCase();
            nameToUse = customer_name.trim();
        }

        // 4. Generate unique payment reference
        const reference = generateReference();

        // 5. Save/Update order in Supabase
        if (order_id) {
            // Update reference for existing pending order
            await adminSupabase
                .from("orders")
                .update({ payment_reference: reference })
                .eq("id", order_id);
        } else {
            // Insert new pending order
            const { data: order, error: insertError } = await adminSupabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    customer_name: nameToUse,
                    customer_email: emailToUse,
                    customer_phone: customer_phone!.trim(),
                    delivery_address: delivery_address!.trim(),
                    items,
                    total_amount: totalAmountNaira,
                    status: "pending",
                    payment_status: "unpaid",
                    payment_reference: reference,
                    payment_verified: false,
                })
                .select("id")
                .single();

            if (insertError || !order) {
                console.error("[payments/initialize] Order insert error:", insertError);
                return NextResponse.json(
                    { error: "Failed to create order. Please try again." },
                    { status: 500 }
                );
            }
            orderIdToUse = order.id;
        }

        // Paystack expects amount in kobo (1 NGN = 100 kobo)
        const amountKobo = totalAmountNaira * 100;

        // 6. Initialize Paystack transaction
        let paystackData: { access_code: string; reference: string };
        try {
            paystackData = await initializePaystackTransaction({
                email: emailToUse,
                amountKobo,
                reference,
                customerName: nameToUse,
                orderId: orderIdToUse,
            });
        } catch (err) {
            // If new order was created, roll back to avoid orphaned records
            if (!order_id) {
                await adminSupabase.from("orders").delete().eq("id", orderIdToUse);
            }

            const message = err instanceof Error ? err.message : "Paystack initialization failed";
            console.error("[payments/initialize] Paystack error:", message);
            return NextResponse.json({ error: message }, { status: 502 });
        }

        // 7. Return payload for frontend Paystack Inline trigger
        return NextResponse.json({
            access_code: paystackData.access_code,
            reference,
            order_id: orderIdToUse,
            amount_naira: totalAmountNaira,
        });
    } catch (error) {
        console.error("[payments/initialize] Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
