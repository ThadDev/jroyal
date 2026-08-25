import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";

// GET /api/admin/reservations?status=pending&date=2025-12-01
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const supabase = createAdminClient();
    let query = supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: false })
        .order("time", { ascending: true });

    if (status && status !== "all") {
        query = query.eq("status", status);
    }
    if (date) {
        query = query.eq("date", date);
    }

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// PATCH /api/admin/reservations — update status
export async function PATCH(request: NextRequest) {
    const body = await request.json();
    const { id, status } = body as { id: string; status: string };

    if (!id || !["pending", "confirmed", "cancelled"].includes(status)) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Fetch the reservation so we can notify the customer
    const { data: reservation, error: fetchErr } = await supabase
        .from("reservations")
        .select("id, user_id, name, date, time, guests, service")
        .eq("id", id)
        .single();

    if (fetchErr || !reservation) {
        return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    const { error } = await supabase
        .from("reservations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Notify the customer via Realtime + push if they have an account
    if (reservation.user_id && status !== "pending") {
        const isConfirmed = status === "confirmed";
        try {
            await sendNotification({
                userId: reservation.user_id,
                title: isConfirmed ? "Reservation Confirmed! 🎉" : "Reservation Cancelled",
                body: isConfirmed
                    ? `Great news, ${reservation.name}! Your table for ${reservation.guests} on ${reservation.date} at ${reservation.time} has been confirmed.`
                    : `We're sorry, ${reservation.name}. Your reservation on ${reservation.date} at ${reservation.time} has been cancelled. Please contact us.`,
                type: "reservation",
                metadata: { reservation_id: reservation.id, new_status: status },
                url: `/reservations`,
            });
        } catch (notifErr) {
            console.warn("[Reservations] Failed to send status notification:", notifErr);
        }
    }

    return NextResponse.json({ success: true });
}
