"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { ArrowLeft, Mail, User, Calendar, ShieldCheck, Settings } from "lucide-react";
import ProfileLogoutButton from "@/components/dashboard/ProfileLogoutButton";

export default function ProfileClient() {
    const { theme } = useTheme();
    const L = theme === "light";
    const [profile, setProfile] = useState<{ full_name?: string; role?: string } | null>(null);
    const [user, setUser] = useState<{ email?: string; created_at?: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setUser({ email: user.email, created_at: user.created_at });
            const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
            setProfile(p);
        };
        load();
    }, []);

    const fullName = profile?.full_name ?? "—";
    const email = user?.email ?? "—";
    const role = profile?.role ?? "customer";
    const createdAt = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
        : "—";

    const primary = L ? "#1A1A1A" : "#F5F0E8";
    const muted = (a: number) => L ? `rgba(26,26,26,${a})` : `rgba(255,255,255,${a})`;
    const divider = L ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";
    const gold = "#F6A81C";

    const glass: React.CSSProperties = {
        background: L ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: L ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
    };

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 6rem" }}>
            <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: muted(0.45), textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>

                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: primary, margin: "0 0 0.25rem" }}>My Profile</h1>
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: muted(0.45), margin: "0 0 2rem" }}>Your account details</p>

                {/* Avatar + Name */}
                <div style={{ ...glass, padding: "2rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #F6A81C 0%, #D48C10 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 0 4px rgba(246,168,28,0.15)" }}>
                        <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", fontWeight: 700, color: "#0A0A0A" }}>{fullName.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: primary, margin: "0 0 4px", fontWeight: 600 }}>{fullName}</h2>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "2px 10px", background: role === "admin" ? "rgba(246,168,28,0.15)" : "rgba(100,200,100,0.1)", border: `1px solid ${role === "admin" ? "rgba(246,168,28,0.3)" : "rgba(100,200,100,0.2)"}`, borderRadius: "99px" }}>
                            <ShieldCheck size={10} style={{ color: role === "admin" ? gold : "#86efac" }} />
                            <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 600, color: role === "admin" ? (L ? "#7A5A00" : gold) : "#86efac", textTransform: "capitalize" }}>{role}</span>
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
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 0", borderBottom: i < 2 ? `1px solid ${divider}` : "none" }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(246,168,28,0.08)", border: "1px solid rgba(246,168,28,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Icon size={15} style={{ color: L ? "#7A5A00" : gold }} />
                            </div>
                            <div>
                                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", color: muted(0.38), margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
                                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: primary, margin: 0 }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action buttons */}
                <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <Link href="/dashboard/settings" style={{ ...glass, padding: "1rem", textDecoration: "none", textAlign: "center", display: "block" }}>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: L ? "#1A1A1A" : gold, margin: "0 0 2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                            <Settings size={13} /> Settings
                        </p>
                        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: muted(0.38), margin: 0 }}>Theme, location &amp; more</p>
                    </Link>
                    <Link href="/reservations" style={{ ...glass, padding: "1rem", textDecoration: "none", textAlign: "center", display: "block" }}>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: L ? "#1A1A1A" : gold, margin: "0 0 2px" }}>Make a Reservation</p>
                        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: muted(0.38), margin: 0 }}>Book your table</p>
                    </Link>
                </div>

                {/* Logout */}
                <div style={{ marginTop: "0.75rem" }}>
                    <ProfileLogoutButton />
                </div>
            </div>
        </div>
    );
}
