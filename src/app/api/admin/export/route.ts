import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { SERVICE_LABELS } from "@/lib/utils";
import type { Reservation } from "@/types";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const supabase = createAdminClient();
    let query = supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: false });

    if (status && status !== "all") query = query.eq("status", status);
    if (date) query = query.eq("date", date);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = data as Reservation[];

    // Build CSV
    const headers = ["ID", "Name", "Email", "Phone", "Date", "Time", "Guests", "Service", "Special Requests", "Status", "Created At"];
    const csvRows = [
        headers.join(","),
        ...rows.map((r) =>
            [
                r.id,
                `"${r.name.replace(/"/g, '""')}"`,
                r.email,
                r.phone,
                r.date,
                r.time,
                r.guests,
                `"${SERVICE_LABELS[r.service] ?? r.service}"`,
                `"${(r.special_requests ?? "").replace(/"/g, '""')}"`,
                r.status,
                r.created_at,
            ].join(",")
        ),
    ].join("\n");

    return new NextResponse(csvRows, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="reservations-${new Date().toISOString().split("T")[0]}.csv"`,
        },
    });
}
