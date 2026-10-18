import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { CartProvider } from "@/context/CartContext";
import { MealsProvider } from "@/context/MealsContext";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Get profile for display name
    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

    const displayName =
        profile?.full_name ??
        user.user_metadata?.full_name ??
        user.email?.split("@")[0] ??
        "Guest";

    return (
        <MealsProvider>
            <CartProvider userId={user.id}>
                <DashboardShell>
                    <DashboardNav displayName={displayName} userId={user.id} />
                    <main style={{ paddingBottom: "5rem" }}>{children}</main>
                </DashboardShell>
            </CartProvider>
        </MealsProvider>
    );
}
