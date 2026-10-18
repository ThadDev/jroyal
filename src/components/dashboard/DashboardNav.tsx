"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useBranch } from "@/context/BranchContext";
import {
  Home, User, ShoppingCart, Utensils, ClipboardList,
  MapPin, Settings, ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/menu", label: "Menu", icon: Utensils },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/cart", label: "Cart", icon: ShoppingCart },
];

export default function DashboardNav({ displayName, userId }: { displayName: string; userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { theme } = useTheme();
  const { branch, resetBranch } = useBranch();
  const [scrolled, setScrolled] = useState(false);
  const isLight = theme === "light";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLocationSwitch = () => {
    resetBranch();
  };

  // ── Theme-aware styles ──────────────────────────────────────────────────
  const navBg = isLight
    ? scrolled
      ? "rgba(255,241,210,0.97)"
      : "rgba(255,241,210,0.90)"
    : scrolled
      ? "rgba(8,8,16,0.97)"
      : "rgba(8,8,16,0.85)";

  const navBorder = isLight
    ? scrolled ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(0,0,0,0.05)"
    : scrolled ? "1px solid rgba(246,168,28,0.15)" : "1px solid rgba(255,255,255,0.05)";

  const linkColor = (active: boolean) =>
    active ? "#F6A81C" : isLight ? "rgba(26,26,26,0.6)" : "rgba(255,255,255,0.6)";

  const activeBg = (active: boolean) =>
    active ? (isLight ? "rgba(246,168,28,0.12)" : "rgba(246,168,28,0.12)") : "transparent";

  const activeBorder = (active: boolean) =>
    active
      ? "1px solid rgba(246,168,28,0.25)"
      : "1px solid transparent";

  const tabBg = isLight ? "rgba(255,241,210,0.97)" : "rgba(8,8,16,0.92)";
  const tabBorder = isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(246,168,28,0.1)";

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: navBg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: navBorder,
          transition: "background 0.3s, border 0.3s",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", height: "64px", padding: "0 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

          {/* Logo */}
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/logo.png"
              alt="Jroyal Grills"
              width={100}
              height={50}
              className="object-contain h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav style={{ display: "none", alignItems: "center", gap: "0.25rem" }} className="lg:flex">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    padding: "0.5rem 0.875rem",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: "Inter, sans-serif",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    background: activeBg(active),
                    color: linkColor(active),
                    border: activeBorder(active),
                  }}
                >
                  <Icon size={14} />
                  {label}
                  {label === "Cart" && totalItems > 0 && (
                    <span style={{ marginLeft: "2px", background: "#AB2330", color: "#F5F0E8", borderRadius: "99px", fontSize: "10px", fontWeight: 700, padding: "0 5px", lineHeight: "16px" }}>
                      {totalItems}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Desktop right area */}
            <div className="hidden lg:flex" style={{ alignItems: "center", gap: "0.75rem" }}>
              {/* Location widget */}
              <button
                onClick={handleLocationSwitch}
                title="Switch location"
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", padding: "0 0.25rem",
                  gap: "1px",
                }}
              >
                <MapPin size={16} style={{ color: isLight ? "#AB2330" : "#F6A81C" }} />
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "9px", color: isLight ? "#1A1A1A" : "rgba(255,255,255,0.5)", maxWidth: "70px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {branch.name}
                </span>
              </button>

              {/* Notification */}
              <NotificationDropdown />

              {/* User avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", borderRadius: "99px", background: isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)", border: isLight ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg, #F6A81C 0%, #D48C10 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#0A0A0A", fontFamily: "Inter,sans-serif" }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: "12px", color: isLight ? "rgba(26,26,26,0.7)" : "rgba(255,255,255,0.7)", fontFamily: "Inter,sans-serif", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </span>
              </div>
            </div>

            {/* Mobile right area — just user avatar + notification */}
            <div className="flex lg:hidden" style={{ alignItems: "center", gap: "0.75rem" }}>
              {/* Location widget (mobile) */}
              <button
                onClick={handleLocationSwitch}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}
              >
                <MapPin size={20} style={{ color: isLight ? "#AB2330" : "#F6A81C" }} />
                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "8px", color: isLight ? "rgba(26,26,26,0.65)" : "rgba(255,255,255,0.5)", maxWidth: "58px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {branch.name}
                </span>
              </button>

              {/* Notification */}
              <NotificationDropdown />

              {/* User Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #F6A81C 0%, #D48C10 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#0A0A0A", fontFamily: "Inter,sans-serif" }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span style={{ fontSize: "9px", color: isLight ? "rgba(26,26,26,0.5)" : "rgba(255,255,255,0.5)", fontFamily: "Inter,sans-serif", marginTop: "2px", maxWidth: "50px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName.split(" ")[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: tabBg,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: tabBorder,
          transition: "background 0.3s, border 0.3s",
        }}
        className="flex lg:hidden"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: "0.625rem 0.25rem",
                color: active
                  ? (isLight ? "#AB2330" : "#F6A81C")
                  : isLight ? "rgba(11, 11, 11, 0.4)" : "rgba(255,255,255,0.4)",
                textDecoration: "none",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={24} />
                {label === "Cart" && totalItems > 0 && (
                  <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#AB2330", color: "#F5F0E8", borderRadius: "99px", fontSize: "9px", fontWeight: 700, padding: "0 4px", lineHeight: "14px" }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", marginTop: "3px" }}>{label}</span>
              {active && (
                <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "20px", height: "2px", background: isLight ? "#AB2330" : "#F6A81C", borderRadius: "2px 2px 0 0" }} />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
