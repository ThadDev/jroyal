import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

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
    const { error } = await supabase
        .from("reservations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
