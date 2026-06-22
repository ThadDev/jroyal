import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/DashboardNav";
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
                <div
                    style={{
                        minHeight: "100vh",
                        backgroundColor: "#080810",
                        backgroundImage: `
                            radial-gradient(ellipse at 10% 10%, rgba(201,168,76,0.08) 0%, transparent 40%),
                            radial-gradient(ellipse at 90% 90%, rgba(100,70,200,0.06) 0%, transparent 40%),
                            radial-gradient(ellipse at 50% 50%, rgba(10,10,25,1) 0%, transparent 100%)
                        `,
                        position: "relative",
                        overflowX: "hidden",
                    }}
                >
                    <DashboardNav displayName={displayName} userId={user.id} />
                    <main style={{ paddingBottom: "5rem" }}>{children}</main>
                </div>
            </CartProvider>
        </MealsProvider>
    );
}
