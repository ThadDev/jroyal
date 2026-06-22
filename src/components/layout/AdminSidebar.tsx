"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    ImageIcon,
    LogOut,
    ChefHat,
    Users,
    Utensils,
    Layers,
    ShoppingCart,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    { href: "/admin/meals", label: "Meals", icon: Utensils },
    { href: "/admin/addons", label: "Add-Ons", icon: Layers },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/blog", label: "Blog Posts", icon: BookOpen },
    { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
];

import NotificationDropdown from "@/components/ui/NotificationDropdown";

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-charcoal">
            {/* Logo and Notifications */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image
                        src="/logo.png"
                        alt="Jroyal Grills"
                        width={100}
                        height={40}
                        className="object-contain h-8 w-auto"
                    />
                    <p className="text-[10px] text-gold-700 tracking-wider">Admin Panel</p>
                </div>
                <div className="flex items-center gap-2">
                    <NotificationDropdown />
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden text-white/50 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map(({ href, label, icon: Icon, exact }) => {
                    const isActive = exact ? pathname === href : pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-none",
                                isActive
                                    ? "bg-gold-500/10 text-gold-400 border-l-2 border-gold-500"
                                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent"
                            )}
                            id={`admin-nav-${label.toLowerCase().replace(/\s/g, "-")}`}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                    ← View Site
                </Link>
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/40 hover:text-red-400 transition-colors"
                    id="admin-sign-out"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 min-h-screen bg-charcoal border-r border-white/5 flex-col flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-charcoal border-b border-white/5 px-4 flex items-center justify-between z-40">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="w-10 h-10 flex items-center justify-center text-gold-500 bg-white/5"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="text-white font-serif font-bold text-lg">Admin</span>
                </div>
                <NotificationDropdown />
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-72 bg-charcoal z-[60] lg:hidden"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
            
            {/* Mobile Spacer */}
            <div className="h-16 lg:hidden" />
        </>
    );
}
