import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";
import type { NotificationType } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, title, message, type, metadata, url } = body as {
            userId: string;
            title: string;
            message: string;
            type: NotificationType;
            metadata?: any;
            url?: string;
        };

        const supabase = await createClient();
        // Here we ideally verify if the authenticated user is an admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const result = await sendNotification({
            userId,
            title,
            body: message,
            type,
            metadata,
            url,
        });

        if (!result.success) {
            return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Trigger user notification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
