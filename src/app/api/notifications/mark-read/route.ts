import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "placeholder-service-role-key"
);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id, all, deleteAll } = body;

    if (deleteAll) {
      // Clear all notifications completely
      const { error } = await supabaseAdmin.from("notifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, message: "All notifications deleted" });
    }

    if (all) {
      // Mark all notifications as read
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (id) {
      // Mark single notification as read
      const { error } = await supabaseAdmin
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Error" }, { status: 500 });
  }
}
