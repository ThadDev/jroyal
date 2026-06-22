import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email";
import { sendNotification } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { full_name, email, password } = parsed.data;
    const supabase = createAdminClient();

    // Create the user
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true, // auto-confirm email
    });

    if (createError) {
      if (createError.message.includes("already") || createError.message.includes("exists")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Update profile with full_name (trigger handles creation)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name,
        role: "customer",
      });
    }

    // Send welcome email (non-blocking)
    sendWelcomeEmail(full_name, email).catch(console.error);

    // Emit socket event for new signup
    try {
        await sendNotification({
            userId: null,
            title: "New User Registration",
            body: `${full_name} has just created an account.`,
            type: "signup",
            url: `/admin/users`,
        });

      const g = globalThis as typeof globalThis & { io?: { to: (room: string) => { emit: (event: string, data: unknown) => void } } };
      g.io?.to("admin-room").emit("new_signup", { email, name: full_name });
    } catch {}

    // Now sign them in by creating a session
    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
