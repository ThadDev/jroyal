import { messagingAdmin } from "./firebase/admin";
import { createClient } from "@supabase/supabase-js";
import type { NotificationType } from "@/types";

// We use a service role client here to bypass RLS for server-side insertions.
// Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SendNotificationParams {
    userId?: string | null; // If null, broadcasts to all admins
    title: string;
    body: string;
    type: NotificationType;
    metadata?: Record<string, any>;
    url?: string; // Route to navigate when clicked
}

export async function sendNotification({
    userId = null,
    title,
    body,
    type,
    metadata = {},
    url = "/admin",
}: SendNotificationParams) {
    try {
        // 1. Save to Supabase DB (Realtime handles UI update)
        const { data: notification, error: dbError } = await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: userId,
                title,
                body,
                type,
                is_read: false,
                metadata: { ...metadata, url },
            })
            .select()
            .single();

        if (dbError) {
            console.error("Failed to insert notification into DB:", dbError);
            return { success: false, error: dbError };
        }

        // 2. Fetch push tokens for target user(s)
        let query = supabaseAdmin.from("push_tokens").select("token");
        
        if (userId) {
            query = query.eq("user_id", userId);
        } else {
            // If userId is null, we assume this is an admin notification.
            // Ideally, we'd fetch users with role='admin' and get their tokens.
            // For simplicity, we can fetch tokens for users who are admins.
            const { data: admins } = await supabaseAdmin
                .from("profiles")
                .select("id")
                .eq("role", "admin");
                
            if (admins && admins.length > 0) {
                const adminIds = admins.map(a => a.id);
                query = query.in("user_id", adminIds);
            } else {
                // No admins found to push to
                return { success: true, notification };
            }
        }

        const { data: tokensData, error: tokenError } = await query;

        if (tokenError || !tokensData || tokensData.length === 0) {
            // No tokens to send push to, but DB insert was successful
            return { success: true, notification };
        }

        const tokens = tokensData.map(t => t.token);

        // 3. Send FCM Push Notification
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                url,
                type,
                ...metadata,
            },
            android: {
                priority: "high" as const,
                notification: {
                    sound: "default",
                    priority: "high" as const,
                    channelId: "high_priority",
                },
            },
            webpush: {
                headers: {
                    Urgency: "high",
                },
                notification: {
                    requireInteraction: true,
                    icon: "/favicon.ico",
                    badge: "/favicon.ico",
                },
            },
            tokens, // Multicast message
        };

        const response = await messagingAdmin.sendEachForMulticast(message);
        
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(tokens[idx]);
                    console.error("FCM Send Error:", resp.error);
                    // Handle unregistered tokens (user revoked permission)
                    if (resp.error?.code === "messaging/invalid-registration-token" ||
                        resp.error?.code === "messaging/registration-token-not-registered") {
                        // We should delete this token from the DB
                        supabaseAdmin.from("push_tokens").delete().eq("token", tokens[idx]).then();
                    }
                }
            });
        }

        return { success: true, notification, pushResponse: response };
    } catch (error) {
        console.error("Error in sendNotification service:", error);
        return { success: false, error };
    }
}
