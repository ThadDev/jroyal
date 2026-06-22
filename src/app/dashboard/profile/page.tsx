import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, User, Calendar, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";


export const metadata: Metadata = { title: "My Profile – Jroyal Grills" };

const glass = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  const fullName = profile?.full_name ?? user?.user_metadata?.full_name ?? "Guest";
  const email = user?.email ?? "";
  const role = profile?.role ?? "customer";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 5rem" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: "#F5F0E8", margin: "0 0 0.25rem" }}>My Profile</h1>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: "0 0 2rem" }}>Manage your account details</p>

        {/* Avatar + Name card */}
        <div style={{ ...glass, padding: "2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #C9A84C 0%, #9A7D2E 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 0 4px rgba(201,168,76,0.15)" }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", fontWeight: 700, color: "#0A0A0A" }}>{fullName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#F5F0E8", margin: "0 0 4px", fontWeight: 600 }}>{fullName}</h2>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", background: role === "admin" ? "rgba(201,168,76,0.15)" : "rgba(100,200,100,0.1)", border: `1px solid ${role === "admin" ? "rgba(201,168,76,0.3)" : "rgba(100,200,100,0.2)"}`, borderRadius: "99px" }}>
              <ShieldCheck size={10} style={{ color: role === "admin" ? "#C9A84C" : "#86efac" }} />
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 600, color: role === "admin" ? "#C9A84C" : "#86efac", textTransform: "capitalize" }}>{role}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ ...glass, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { icon: User, label: "Full Name", value: fullName },
            { icon: Mail, label: "Email", value: email },
            { icon: Calendar, label: "Member Since", value: createdAt },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={15} style={{ color: "#C9A84C" }} />
              </div>
              <div>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.35)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: "#F5F0E8", margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Link href="/reservations" style={{ ...glass, padding: "1rem", textDecoration: "none", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: "#C9A84C", margin: "0 0 2px" }}>Make a Reservation</p>
            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Book your table</p>
          </Link>
          <Link href="/dashboard/cart" style={{ ...glass, padding: "1rem", textDecoration: "none", textAlign: "center" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: "#C9A84C", margin: "0 0 2px" }}>View Cart</p>
            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Your food basket</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
