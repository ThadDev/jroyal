"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function WelcomePage() {
    return (
        <div
            style={{
                minHeight: "100svh",
                background: "#0A0A0A",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 24px 48px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Ambient red glow behind logos */}
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    top: "18%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "320px",
                    height: "320px",
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(171,35,48,0.45) 0%, rgba(171,35,48,0.12) 50%, transparent 75%)",
                    filter: "blur(30px)",
                    pointerEvents: "none",
                }}
            />

            {/* Top spacer */}
            <div />

            {/* Center content */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ textAlign: "center", position: "relative", zIndex: 1 }}
            >
                {/* Dual logos */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        marginBottom: "40px",
                    }}
                >
                    {/* Logo 1 — Jroyal */}
                    <Image
                        src="/logo.png"
                        alt="Jroyal Grills"
                        width={88}
                        height={88}
                        style={{ objectFit: "contain", width: "88px", height: "88px" }}
                        priority
                    />

                    {/* Collaboration divider */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                        <div style={{ width: "1px", height: "20px", background: "rgba(246,168,28,0.25)" }} />
                        <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", color: "rgba(246,168,28,0.55)", letterSpacing: "0.08em", fontWeight: 600 }}>×</span>
                        <div style={{ width: "1px", height: "20px", background: "rgba(246,168,28,0.25)" }} />
                    </div>

                    {/* Logo 2 — Cafe */}
                    <Image
                        src="/cafe-logo.png"
                        alt="Cafe"
                        width={88}
                        height={88}
                        style={{ objectFit: "contain", width: "88px", height: "88px" }}
                        priority
                    />
                </div>

                {/* Primary text — "Welcome to" + logo */}
                <p
                    style={{
                        fontFamily: "Inter,sans-serif",
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.18em",
                        color: "rgba(246,168,28,0.7)",
                        textTransform: "uppercase",
                        marginBottom: "14px",
                    }}
                >
                    Welcome to
                </p>

                <div style={{ marginBottom: "14px" }}>
                    <Image
                        src="/logo.png"
                        alt="Jroyal Grills"
                        width={180}
                        height={60}
                        style={{ objectFit: "contain", maxHeight: "52px", width: "auto", margin: "0 auto" }}
                    />
                </div>

                {/* Subtext */}
                <p
                    style={{
                        fontFamily: "Inter,sans-serif",
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.6,
                        maxWidth: "240px",
                        margin: "0 auto",
                    }}
                >
                    where every meal tells a story…
                </p>
            </motion.div>

            {/* Bottom CTA buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
                style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "12px", position: "relative", zIndex: 1 }}
            >
                <Link
                    href="/auth/login"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "#AB2330",
                        color: "#ffffff",
                        fontFamily: "Inter,sans-serif",
                        fontSize: "15px",
                        fontWeight: 700,
                        textDecoration: "none",
                        letterSpacing: "0.01em",
                    }}
                    id="welcome-login"
                >
                    Log In
                </Link>

                <Link
                    href="/auth/signup"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        padding: "16px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.05)",
                        border: "1.5px solid rgba(246,168,28,0.30)",
                        color: "rgba(255,255,255,0.85)",
                        fontFamily: "Inter,sans-serif",
                        fontSize: "15px",
                        fontWeight: 600,
                        textDecoration: "none",
                        letterSpacing: "0.01em",
                    }}
                    id="welcome-create-account"
                >
                    Create Account
                </Link>
            </motion.div>
        </div>
    );
}
