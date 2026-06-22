import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  admin_code: z.string().min(1),
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

    const { full_name, email, password, admin_code } = parsed.data;

    // Validate the admin secret code
    const expectedCode = process.env.ADMIN_SECRET_CODE;
    if (!expectedCode || admin_code !== expectedCode) {
      return NextResponse.json(
        { error: "Invalid admin secret code. Access denied." },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // Create user with admin Supabase client
    const { data, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name, role: "admin" },
      email_confirm: true,
    });

    if (createError) {
      if (createError.message.toLowerCase().includes("already")) {
        return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Ensure profile has admin role
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name,
        role: "admin",
      });
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
