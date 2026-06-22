import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const { token, device } = await request.json();
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const supabaseAdmin = require("@/lib/supabase/server").createAdminClient();

        // Check if token exists globally (bypass RLS)
        const { data: existingToken } = await supabaseAdmin
            .from("push_tokens")
            .select("id, user_id")
            .eq("token", token)
            .maybeSingle();

        if (existingToken) {
            // If it exists but belongs to someone else, update the user_id
            if (existingToken.user_id !== user.id) {
                await supabaseAdmin
                    .from("push_tokens")
                    .update({ user_id: user.id, device: device || "unknown" })
                    .eq("id", existingToken.id);
            }
        } else {
            // Does not exist, insert new
            const { error: insertError } = await supabaseAdmin
                .from("push_tokens")
                .insert({
                    user_id: user.id,
                    token,
                    device: device || "unknown",
                });

            if (insertError) {
                console.error("Error saving push token:", insertError);
                return NextResponse.json({ error: "Failed to save token" }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Token registration error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
