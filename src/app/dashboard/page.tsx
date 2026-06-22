import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import DashboardClient from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "My Dashboard – Jroyal Grills",
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .single();

    const firstName = (
        profile?.full_name ??
        user?.user_metadata?.full_name ??
        "Guest"
    )
        .split(" ")[0];

    return <DashboardClient firstName={firstName} />;
}
