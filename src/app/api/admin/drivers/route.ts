// ============================================================
// GET  /api/admin/drivers       — list all drivers
// POST /api/admin/drivers       — create a new driver
// ============================================================
import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

export async function GET() {
    const admin = await assertAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
        .from("drivers")
        .select("*")
        .order("name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
    const admin = await assertAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, phone, vehicle_type, vehicle_plate, status, notes, avatar_url } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Driver name is required" }, { status: 400 });
    if (!phone?.trim()) return NextResponse.json({ error: "Driver phone is required" }, { status: 400 });

    const adminSupabase = createAdminClient();
    const { data, error } = await adminSupabase
        .from("drivers")
        .insert({
            name: name.trim(),
            phone: phone.trim(),
            vehicle_type: vehicle_type || null,
            vehicle_plate: vehicle_plate?.trim() || null,
            status: status || "active",
            notes: notes?.trim() || null,
            avatar_url: avatar_url?.trim() || null,
        })
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
}
