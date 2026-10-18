"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";
import ChangeBranchButton from "@/components/ui/ChangeBranchButton";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { branch } = useBranch();
    const { theme } = useTheme();
    const pathname = usePathname();
    const L = theme === "light";

    const footerBg = L ? "#FFF1D2" : "#080810";
    const topBorder = L ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.05)";
    const headingColor = L ? "#1A1A1A" : "#F6A81C";         // section headings
    const iconColor = L ? "#AB2330" : "#F6A81C";         // contact icons
    const textColor = L ? "rgba(26,26,26,0.60)" : "rgba(255,255,255,0.50)";
    const linkColor = L ? "#1A1A1A" : "rgba(255,255,255,0.50)";
    const linkActive = "#AB2330";
    const dotColor = L ? "#AB2330" : "#F6A81C";
    const dividerColor = L ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.05)";
    const socialBorder = L ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.10)";
    const socialText = L ? "rgba(26,26,26,0.50)" : "rgba(255,255,255,0.40)";
    const copyText = L ? "rgba(26,26,26,0.35)" : "rgba(255,255,255,0.30)";

    const isActive = (href: string) => pathname === href || pathname.startsWith(href);

    const navLinks = [
        { href: "/dashboard", label: "Home" },
        { href: "/dashboard/menu", label: "Menu" },
        { href: "/dashboard/orders", label: "Orders" },
        { href: "/dashboard/cart", label: "Cart" },
        { href: "/dashboard/settings", label: "Settings" },
    ];

    return (
        <footer style={{ background: footerBg, borderTop: topBorder, transition: "background 0.3s" }}>
            {/* Shimmer divider */}
            <div className="h-px w-full shimmer-gold opacity-60" />

            <div className="container-wide section-padding pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <Image src="/logo.png" alt="Jroyal Grills" width={140} height={56} className="object-contain h-12 w-auto" />
                        </div>
                        <p style={{ color: textColor, fontSize: "14px", lineHeight: "1.6", marginBottom: "1.5rem", fontFamily: "Inter,sans-serif" }}>
                            {branch.footerBlurb}
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { icon: Instagram, label: "Instagram" },
                                { icon: Facebook, label: "Facebook" },
                                { icon: Twitter, label: "Twitter" },
                            ].map(({ icon: Icon, label }) => (
                                <a key={label} href="#" aria-label={label}
                                    style={{ width: "32px", height: "32px", border: `1px solid ${socialBorder}`, display: "flex", alignItems: "center", justifyContent: "center", color: socialText, transition: "all 0.2s", textDecoration: "none" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = iconColor; (e.currentTarget as HTMLElement).style.borderColor = iconColor; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = socialText; (e.currentTarget as HTMLElement).style.borderColor = socialBorder; }}
                                >
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigate */}
                    <div>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "13px", fontWeight: 600, color: headingColor, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
                            Navigate
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {navLinks.map(({ href, label }) => {
                                const active = isActive(href);
                                return (
                                    <li key={href}>
                                        <Link href={href} style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: active ? linkActive : linkColor, textDecoration: "none", fontWeight: active ? 600 : 400, display: "flex", alignItems: "center", gap: "6px" }}>
                                            {active && <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: linkActive, display: "inline-block" }} />}
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "13px", fontWeight: 600, color: headingColor, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
                            Services
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {["Restaurant Dining", "Corporate Events", "Outside Catering", "Private Dining", "Outdoor Catering", "Event Planning"].map((s) => (
                                <li key={s} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "Inter,sans-serif", fontSize: "14px", color: textColor }}>
                                    <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "13px", fontWeight: 600, color: headingColor, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "1.5rem" }}>
                            Find Us
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <li style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                                <MapPin size={14} style={{ color: iconColor, marginTop: "2px", flexShrink: 0 }} />
                                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: textColor, lineHeight: 1.5 }}>{branch.address}</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Clock size={14} style={{ color: iconColor, flexShrink: 0 }} />
                                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: textColor }}>Mon 4PM–11PM · Tue–Sun 10AM–11PM</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Phone size={14} style={{ color: iconColor, flexShrink: 0 }} />
                                <a href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: textColor, textDecoration: "none" }}>
                                    {branch.phone}
                                </a>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <Mail size={14} style={{ color: iconColor, flexShrink: 0 }} />
                                <a href="mailto:info@jroyalgrills.com" style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: textColor, textDecoration: "none" }}>
                                    info@jroyalgrills.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: `1px solid ${dividerColor}`, paddingTop: "2rem", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <p style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", color: copyText, margin: 0 }}>
                        © {currentYear} {branch.name}. All rights reserved.
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                        <ChangeBranchButton variant="footer" />
                        <Link href="/admin/login" style={{ fontFamily: "Inter,sans-serif", fontSize: "12px", color: copyText, textDecoration: "none" }}>
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
