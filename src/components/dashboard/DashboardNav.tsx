"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Home, User, ShoppingCart, LogOut, ChefHat, Menu as MenuIcon, X, Utensils, Search, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import NotificationDropdown from "@/components/ui/NotificationDropdown";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/menu", label: "Menu", icon: Utensils },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardList },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/cart", label: "Cart", icon: ShoppingCart },
];

export default function DashboardNav({ displayName, userId }: { displayName: string; userId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    showToast("Signed out. See you next time! 👋", "info");
    router.push("/auth/login");
    router.refresh();
  };

  const handleSearchFocus = () => {
    // Scroll to top so the search bar is in view
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Fire the custom event — DashboardClient listens and focuses the input
    window.dispatchEvent(new CustomEvent("dashboard:focus-search"));
    // Close mobile menu if open
    setMobileOpen(false);
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-obsidian/95 backdrop-blur-md border-b border-gold-700/20" : "bg-obsidian/60 backdrop-blur-md border-b border-white/5"
          }`}
      >
        <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
          {/* Logo (Left) */}
          <Link href="/dashboard" className="flex items-center gap-2 md:gap-2.5 text-none">
            <div className="flex justify-center">
                <Image
                    src="/logo.png"
                    alt="Jroyal Grills"
                    width={100}
                    height={40}
                    className="object-contain h-8 w-auto"
                    priority
                />
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ alignItems: "center", gap: "0.25rem" }} className="hidden lg:flex">
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
                    background: active ? "rgba(201,168,76,0.12)" : "transparent",
                    color: active ? "#C9A84C" : "rgba(255,255,255,0.6)",
                    border: active ? "1px solid rgba(201,168,76,0.2)" : "1px solid transparent",
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
          <div className="flex items-center gap-3">
            {/* Desktop User Info & Sign Out */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search button */}
              <button
                onClick={handleSearchFocus}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-gold-400 hover:border-gold-500/30 hover:bg-gold-500/5 transition-all"
                aria-label="Search menu"
              >
                <Search size={15} />
              </button>
              {/* Notification Dropdown */}
              <NotificationDropdown />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-bold text-obsidian font-sans">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-white/70 font-sans max-w-[120px] truncate">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-transparent border border-white/10 text-white/40 text-xs font-sans hover:text-red-400 hover:border-red-400/30 transition-all"
                aria-label="Sign out"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>

            {/* Mobile User Info & Toggle (Right side) */}
            <div className="flex lg:hidden items-center gap-3">
              {/* User Avatar + Name Underneath */}
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-obsidian font-sans">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-[9px] text-white/60 font-sans mt-0.5 max-w-[50px] truncate">
                  {displayName.split(" ")[0]}
                </span>
              </div>

              {/* Mobile Search icon */}
              <button
                onClick={handleSearchFocus}
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-gold-400 active:scale-95 transition-all"
                aria-label="Search menu"
              >
                <Search size={18} />
              </button>

              <NotificationDropdown />

              {/* Mobile Cart Icon */}
              <Link href="/dashboard/cart" className="relative p-1.5 text-white/70 hover:text-royal-400 transition-colors">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-royal-500 text-white text-[9px] font-bold min-w-[14px] h-[14px] px-1 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Hamburger Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex items-center justify-center w-9 h-9 bg-white/5 border border-white/10 rounded-md text-white/70 active:scale-95 transition-transform"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={18} /> : <MenuIcon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.28 }}
            style={{
              position: "fixed", inset: 0, zIndex: 45,
              background: "rgba(8,8,16,0.97)",
              backdropFilter: "blur(20px)",
              display: "flex", flexDirection: "column",
              paddingTop: "80px",
            }}
          >
            <div style={{ padding: "1.5rem" }}>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                {NAV_ITEMS.map(({ href, label, icon: Icon, exact }, i) => {
                  const active = isActive(href, exact);
                  return (
                    <motion.div key={href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                      <Link
                        href={href}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "0.875rem 1rem",
                          borderRadius: "8px",
                          textDecoration: "none",
                          background: active ? "rgba(201,168,76,0.1)" : "transparent",
                          border: `1px solid ${active ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.05)"}`,
                          color: active ? "#C9A84C" : "rgba(255,255,255,0.7)",
                          fontFamily: "'Playfair Display',serif",
                          fontSize: "18px",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <Icon size={18} />
                          {label}
                        </span>
                        {label === "Cart" && totalItems > 0 && (
                          <span style={{ background: "#AB2330", color: "#F5F0E8", borderRadius: "99px", fontSize: "11px", fontWeight: 700, padding: "1px 8px" }}>{totalItems}</span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontSize: "13px", fontFamily: "Inter,sans-serif", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  ← Back to Site
                </Link>
                <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", color: "rgba(239,68,68,0.7)", background: "none", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "8px", fontSize: "13px", fontFamily: "Inter,sans-serif", cursor: "pointer" }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom tab bar */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
          background: "rgba(8,8,16,0.92)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(201,168,76,0.1)",
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
                color: active ? "#C9A84C" : "rgba(255,255,255,0.4)",
                textDecoration: "none",
                position: "relative",
              }}
            >
              <div style={{ position: "relative" }}>
                <Icon size={20} />
                {label === "Cart" && totalItems > 0 && (
                  <span style={{ position: "absolute", top: "-6px", right: "-8px", background: "#AB2330", color: "#F5F0E8", borderRadius: "99px", fontSize: "9px", fontWeight: 700, padding: "0 4px", lineHeight: "14px" }}>
                    {totalItems}
                  </span>
                )}
              </div>
              <span style={{ fontFamily: "Inter,sans-serif", fontSize: "10px", marginTop: "3px" }}>{label}</span>
              {active && (
                <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "20px", height: "2px", background: "#AB2330", borderRadius: "2px 2px 0 0" }} />
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
