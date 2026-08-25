import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { reservationSchema } from "@/lib/schema";
import { sendReservationConfirmation, sendAdminNotification } from "@/lib/email";
import type { Reservation } from "@/types";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = reservationSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Invalid reservation data", details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Check if the requester is a logged-in user — store their ID on the reservation
        // so we can send them targeted status-change notifications later.
        let customerId: string | null = null;
        try {
            const userClient = await createClient();
            const { data: { user } } = await userClient.auth.getUser();
            customerId = user?.id ?? null;
        } catch {
            // Guest checkout — no user ID available
        }

        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from("reservations")
            .insert([{ ...parsed.data, user_id: customerId }])
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            return NextResponse.json({ error: "Failed to save reservation" }, { status: 500 });
        }

        // Send emails (non-blocking – don't fail the request if email fails)
        const reservation = data as Reservation;
        try {
            await Promise.all([
                sendReservationConfirmation(reservation),
                sendAdminNotification(reservation),
            ]);
        } catch (emailErr) {
            console.error("Email send error:", emailErr);
        }

        // 1. Notify admin dashboard (Realtime + Socket.IO + push)
        try {
            await sendNotification({
                userId: null,  // null = admin broadcast
                title: "New Reservation Received",
                body: `${reservation.name} booked a table for ${reservation.guests} guests on ${reservation.date} at ${reservation.time}.`,
                type: "reservation",
                metadata: { reservation_id: reservation.id, customer_name: reservation.name },
                url: `/admin/reservations`,
            });

            const g = globalThis as typeof globalThis & { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } };
            g.io?.to("admin-room").emit("new_reservation", {
                name: reservation.name,
                email: reservation.email,
                service: reservation.service,
                date: reservation.date,
            });
        } catch {}

        // 2. Send acknowledgement notification to the customer (if logged in)
        if (customerId) {
            try {
                await sendNotification({
                    userId: customerId,
                    title: "Reservation Received ✓",
                    body: `Your table for ${reservation.guests} on ${reservation.date} at ${reservation.time} is pending confirmation. We'll notify you shortly.`,
                    type: "reservation",
                    metadata: { reservation_id: reservation.id },
                    url: `/reservations`,
                });
            } catch {}
        }

        return NextResponse.json({ success: true, id: reservation.id }, { status: 201 });
    } catch (err) {
        console.error("Reservation API error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
