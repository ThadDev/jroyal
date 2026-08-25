"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBranch } from "@/context/BranchContext";

/**
 * BranchSwitcherFloatingButton
 * ─────────────────────────────
 * Raised, ultra-premium fixed floating button on the bottom-left of the screen.
 * On click: clears stored branch preference in localStorage and opens the
 * fullscreen LocationSelector modal for location switching.
 */
export default function BranchSwitcherFloatingButton() {
    const pathname = usePathname();
    const { branch, resetBranch, showSelector } = useBranch();

    // Do not show on admin panel or when location selector modal is active
    if (pathname?.startsWith("/admin") || showSelector) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-12 left-5 md:bottom-12 md:left-8 z-[100] pointer-events-auto"
        >
            <motion.button
                id="floating-branch-switcher-btn"
                onClick={resetBranch}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                aria-label="Switch restaurant branch"
                className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-gold-500/40 via-white/10 to-gold-500/30 hover:from-gold-400 hover:via-gold-300 hover:to-gold-500 transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.85)] hover:shadow-[0_16px_45px_rgba(212,168,50,0.32)] cursor-pointer outline-none"
            >
                {/* Inner glass card */}
                <div className="px-4 py-3 bg-[#0C0C0C]/95 backdrop-blur-xl rounded-[15px] flex items-center gap-3 border border-white/5">
                    {/* Metallic Gold Icon Badge with Live Pulse */}
                    <div className="relative flex-shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5BE53] via-[#C9A84C] to-[#8C6D21] flex items-center justify-center text-obsidian shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.4)] group-hover:scale-105 transition-transform duration-300">
                            <MapPin size={18} className="fill-obsidian/20 stroke-[2.2]" />
                        </div>
                        {/* Live active dot */}
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-obsidian"></span>
                        </span>
                    </div>

                    {/* Text information */}
                    <div className="flex flex-col text-left pr-1">
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] font-bold text-gold-400">
                            <Sparkles size={10} className="text-gold-400/80" />
                            <span>Branch</span>
                        </div>
                        <span className="font-serif font-bold text-sm text-white tracking-wide truncate max-w-[130px] sm:max-w-[170px] leading-snug">
                            {branch?.shortName || branch?.name || "Nsukka Branch"}
                        </span>
                    </div>

                    {/* Quick action button pill */}
                    <div className="pl-2 border-l border-white/10 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/50 group-hover:text-gold-400 transition-colors">
                        <span className="hidden sm:inline">Switch</span>
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-300 text-gold-400" />
                    </div>
                </div>
            </motion.button>
        </motion.div>
    );
}
