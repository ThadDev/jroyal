"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Star, MapPin } from "lucide-react";
import { useBranch } from "@/context/BranchContext";

export default function HeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

    const { branch } = useBranch();

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden"
            id="hero"
        >
            {/* Background with parallax */}
            <motion.div style={{ y }} className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url('/hero.jpg')`,
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/50 to-obsidian" />
                <div className="absolute inset-0 bg-gradient-to-r from-obsidian/40 via-transparent to-obsidian/20" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-royal-500/20 to-transparent" />
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-gold-600/40 to-transparent hidden lg:block" />
            <div className="absolute top-1/4 right-8 w-px h-32 bg-gradient-to-b from-transparent via-gold-600/40 to-transparent hidden lg:block" />

            {/* Content */}
            <motion.div
                style={{ opacity }}
                className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
            >
                {/* Pre-title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex items-center justify-center gap-3 mb-6"
                >
                    <div className="h-px w-12 bg-gold-600/60" />
                    {/* <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className="fill-gold-500 text-gold-500" />
                        ))}
                    </div> */}
                    <span className="text-royal-500 text-xs tracking-[0.3em] uppercase font-light">
                        {branch.heroEstLabel}
                    </span>
                    <div className="h-px w-12 bg-gold-600/60" />
                </motion.div>

                {/* Main heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="font-serif text-4xl sm:text-6xl lg:text-8xl font-bold text-white leading-[1.05] mb-6"
                >
                    Where Every Meal
                    <span className="block gold-gradient-text italic mt-2">Tells a Story</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="text-white/60 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed mb-4"
                >
                    {branch.tagline}
                </motion.p>

                {/* Location */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.9 }}
                    className="flex items-center justify-center gap-2 text-gold-700 text-xs mb-10"
                >
                    <MapPin size={12} />
                    <span className="tracking-wider">{branch.heroLocationLine}</span>
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.1 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link href="/reservations" className="btn-gold-gradient bg-gold-500 text-black px-8 py-4 text-sm">
                        Reserve a Table
                    </Link>
                    <Link href="/menu" className="btn-outline px-8 py-4 text-sm">
                        Explore Our Menu
                    </Link>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
            >
                <span className="text-white/30 text-[10px] tracking-widest uppercase">Scroll</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                    <ChevronDown size={16} className="text-royal-500/80" />
                </motion.div>
            </motion.div>
        </section>
    );
}
