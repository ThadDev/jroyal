"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBranch } from "@/context/BranchContext";

const NAV_LINKS = [
    { href: "/", label: "Home" },
    { href: "/menu", label: "Menu" },
    { href: "/reservations", label: "Reservations" },
    { href: "/events", label: "Events" },
    { href: "/gallery", label: "Gallery" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/auth/login", label: "Login" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { branch } = useBranch();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                    scrolled
                        ? "bg-obsidian/95 backdrop-blur-md border-b border-gold-700/20 py-3"
                        : "bg-transparent py-5"
                )}
            >
                <div className="container-wide px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center" aria-label="Jroyal Grills – Home">
                        <Image
                            src="/logo.png"
                            alt="Jroyal Grills"
                            width={120}
                            height={48}
                            className="object-contain h-10 w-auto"
                            priority
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-5">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "nav-link !text-[11px] !tracking-[0.1em]",
                                    pathname === link.href && "text-royal-500"
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden lg:flex items-center gap-4">
                        <a
                            href={`https://wa.me/${branch.whatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-white/60 hover:text-royal-500 transition-colors"
                            aria-label={`WhatsApp ${branch.name}`}
                        >
                            <Phone size={14} />
                            <span>WhatsApp</span>
                        </a>
                        <Link href="/reservations" className="btn-primary py-2 text-xs">
                            Reserve a Table
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 text-white/70 hover:text-royal-500 transition-colors"
                        aria-label="Toggle navigation menu"
                        id="mobile-menu-toggle"
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-obsidian flex flex-col pt-20 overflow-y-auto"
                        id="mobile-nav"
                    >
                        <nav className="flex flex-col px-6 py-8 gap-1 min-h-min">
                            {NAV_LINKS.map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={link.href}
                                        className={cn(
                                            "block py-4 font-serif text-2xl font-medium border-b border-white/5 transition-colors",
                                            pathname === link.href ? "text-royal-500" : "text-white/80 hover:text-royal-400"
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>
                        <div className="px-6 mt-auto mb-12 flex flex-col gap-3">
                            <Link href="/reservations" className="btn-primary justify-center">
                                Reserve a Table
                            </Link>
                            <a
                                href={`https://wa.me/${branch.whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-outline justify-center"
                            >
                                WhatsApp Us
                            </a>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
