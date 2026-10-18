"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import { useBranch } from "@/context/BranchContext";
import { useToast } from "@/context/ToastContext";
import {
    User, Sun, Moon, MapPin, Lock, LogOut, Trash2,
    ChevronRight, ArrowLeft, Settings, Shield,
} from "lucide-react";

export default function SettingsPage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const { branch, resetBranch } = useBranch();
    const { showToast } = useToast();
    const [signingOut, setSigningOut] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isLight = theme === "light";

    const handleSignOut = async () => {
        setSigningOut(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        showToast("Signed out. See you next time! 👋", "info");
        router.push("/auth/login");
        router.refresh();
    };

    const handleLocationSwitch = () => {
        resetBranch();
        showToast("Choose your location below!", "info");
    };

    const sectionStyle: React.CSSProperties = {
        background: isLight ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "0.75rem",
    };

    const rowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        padding: "1rem 1.25rem",
        borderBottom: isLight ? "1px solid rgba(0,0,0,0.06)" : "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        transition: "background 0.15s",
        textDecoration: "none",
    };

    const iconBoxStyle = (color: string): React.CSSProperties => ({
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        background: `${color}18`,
        border: `1px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    });

    const labelStyle: React.CSSProperties = {
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        color: isLight ? "#1A1A1A" : "#F5F0E8",
        flex: 1,
    };

    const subLabelStyle: React.CSSProperties = {
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        color: isLight ? "rgba(26,26,26,0.45)" : "rgba(255,255,255,0.35)",
        marginTop: "1px",
    };

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.25rem 6rem" }}>
            <div style={{ maxWidth: "560px", margin: "0 auto" }}>

                {/* Back */}
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: isLight ? "rgba(26,26,26,0.45)" : "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
                    <ArrowLeft size={14} /> Back to Dashboard
                </Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(246,168,28,0.12)", border: "1px solid rgba(246,168,28,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Settings size={20} style={{ color: "#F6A81C" }} />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color: isLight ? "#1A1A1A" : "#F5F0E8", margin: 0, fontWeight: 700 }}>Settings</h1>
                        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", color: isLight ? "rgba(26,26,26,0.45)" : "rgba(255,255,255,0.4)", margin: 0 }}>Manage your account & preferences</p>
                    </div>
                </div>

                {/* ── Account Section ── */}
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isLight ? "rgba(26,26,26,0.4)" : "rgba(255,255,255,0.3)", marginBottom: "0.5rem", paddingLeft: "4px" }}>Account</p>
                <div style={sectionStyle}>
                    <Link href="/dashboard/profile" style={{ ...rowStyle }}>
                        <div style={iconBoxStyle("#F6A81C")}>
                            <User size={16} style={{ color: "#F6A81C" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={labelStyle}>My Profile</div>
                            <div style={subLabelStyle}>View & update personal details</div>
                        </div>
                        <ChevronRight size={15} style={{ color: isLight ? "rgba(26,26,26,0.3)" : "rgba(255,255,255,0.25)" }} />
                    </Link>

                    <div style={{ ...rowStyle, borderBottom: "none" }}>
                        <div style={iconBoxStyle("#AB2330")}>
                            <Shield size={16} style={{ color: "#AB2330" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={labelStyle}>Change Password</div>
                            <div style={subLabelStyle}>A reset link will be sent to your email</div>
                        </div>
                        <button
                            onClick={async () => {
                                const supabase = createClient();
                                const { data: { user } } = await supabase.auth.getUser();
                                if (user?.email) {
                                    await supabase.auth.resetPasswordForEmail(user.email, {
                                        redirectTo: `${window.location.origin}/auth/update-password`,
                                    });
                                    showToast("Password reset email sent! Check your inbox.", "info");
                                }
                            }}
                            style={{ cursor: "pointer", padding: "4px 10px", borderRadius: "8px", background: "rgba(171,35,48,0.1)", border: "1px solid rgba(171,35,48,0.2)", fontFamily: "Inter,sans-serif", fontSize: "11px", fontWeight: 600, color: "#AB2330" }}
                        >
                            Send
                        </button>
                    </div>
                </div>

                {/* ── Preferences Section ── */}
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: isLight ? "rgba(26,26,26,0.4)" : "rgba(255,255,255,0.3)", marginBottom: "0.5rem", paddingLeft: "4px", marginTop: "1.25rem" }}>Preferences</p>
                <div style={sectionStyle}>
                    {/* Theme Toggle */}
                    <div style={{ ...rowStyle }}>
                        <div style={iconBoxStyle("#F6A81C")}>
                            {isLight ? <Sun size={16} style={{ color: "#F6A81C" }} /> : <Moon size={16} style={{ color: "#F6A81C" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={labelStyle}>Appearance</div>
                            <div style={subLabelStyle}>{isLight ? "Light mode active" : "Dark mode active"}</div>
                        </div>
                        {/* Toggle switch */}
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            style={{
                                width: "48px",
                                height: "26px",
                                borderRadius: "13px",
                                border: "none",
                                cursor: "pointer",
                                position: "relative",
                                background: isLight ? "#F6A81C" : "rgba(255,255,255,0.12)",
                                transition: "background 0.25s",
                                flexShrink: 0,
                            }}
                        >
                            <div style={{
                                position: "absolute",
                                top: "3px",
                                left: isLight ? "25px" : "3px",
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                background: "#fff",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                transition: "left 0.25s",
                            }} />
                        </button>
                    </div>

                    {/* Location */}
                    <div style={{ ...rowStyle, borderBottom: "none" }}>
                        <div style={iconBoxStyle("#AB2330")}>
                            <MapPin size={16} style={{ color: "#AB2330" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={labelStyle}>Location</div>
                            <div style={subLabelStyle}>Currently: {branch.name}</div>
                        </div>
                        <button
                            onClick={handleLocationSwitch}
                            style={{
                                background: "rgba(171,35,48,0.07)",
                                border: "1px solid rgba(171,35,48,0.25)",
                                borderRadius: "8px",
                                padding: "4px 10px",
                                fontFamily: "Inter,sans-serif",
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#AB2330",
                                cursor: "pointer",
                            }}
                        >
                            Switch
                        </button>
                    </div>
                </div>

                {/* ── Danger Zone ── */}
                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(171,35,48,0.5)", marginBottom: "0.5rem", paddingLeft: "4px", marginTop: "1.25rem" }}>Danger Zone</p>
                <div style={sectionStyle}>
                    {/* Logout */}
                    <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        style={{ ...rowStyle, width: "100%", background: "none", border: "none", textAlign: "left" }}
                    >
                        <div style={iconBoxStyle("#EF4444")}>
                            <LogOut size={16} style={{ color: "#EF4444" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ ...labelStyle, color: "#EF4444" }}>{signingOut ? "Signing out…" : "Log Out"}</div>
                            <div style={subLabelStyle}>End your current session</div>
                        </div>
                    </button>

                    {/* Delete Account */}
                    <div style={{ borderBottom: "none" }}>
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{ ...rowStyle, width: "100%", background: "none", border: "none", textAlign: "left", borderBottom: "none" }}
                            >
                                <div style={iconBoxStyle("#EF4444")}>
                                    <Trash2 size={16} style={{ color: "#EF4444" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ ...labelStyle, color: "#EF4444" }}>Delete Account</div>
                                    <div style={subLabelStyle}>Permanently remove your account & data</div>
                                </div>
                            </button>
                        ) : (
                            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "#EF4444", margin: 0, fontWeight: 500 }}>Are you sure? This cannot be undone.</p>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={() => { showToast("Please contact support to delete your account.", "info"); setShowDeleteConfirm(false); }}
                                        style={{ flex: 1, padding: "0.625rem", borderRadius: "8px", border: "none", background: "#EF4444", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                    >
                                        Yes, Delete
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        style={{ flex: 1, padding: "0.625rem", borderRadius: "8px", border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.1)", background: "transparent", color: isLight ? "#1A1A1A" : "#F5F0E8", fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* App version note */}
                <p style={{ textAlign: "center", fontFamily: "Inter,sans-serif", fontSize: "11px", color: isLight ? "rgba(26,26,26,0.25)" : "rgba(255,255,255,0.2)", marginTop: "2rem" }}>
                    Jroyal Grills · v1.0
                </p>
            </div>
        </div>
    );
}
