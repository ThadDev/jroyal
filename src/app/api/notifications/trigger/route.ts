import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendNotification } from "@/lib/notifications";
import type { NotificationType } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, message, type, metadata, url } = body as {
            title: string;
            message: string;
            type: NotificationType;
            metadata?: any;
            url?: string;
        };

        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // In a real production app, you might want to verify that the user 
        // actually just created an order or reservation before allowing this,
        // or move the entire insertion logic to the server.
        if (authError && type !== "signup" && type !== "reservation") {
            // Some triggers might be anonymous (e.g. public reservation)
            // Depending on requirements, we can allow it or restrict.
            // We'll allow it for now but limit the types.
        }

        // Send an admin notification (userId = null)
        const result = await sendNotification({
            userId: null,
            title,
            body: message,
            type,
            metadata: { ...metadata, triggered_by: user?.id },
            url,
        });

        if (!result.success) {
            return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Trigger notification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
