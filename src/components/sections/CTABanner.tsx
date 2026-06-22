"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CTABannerProps {
    title?: string;
    subtitle?: string;
    primaryLabel?: string;
    primaryHref?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
}

export default function CTABanner({
    title = "Ready to Experience the Landmark?",
    subtitle = "Reserve your table today and let us create an unforgettable experience for you.",
    primaryLabel = "Make a Reservation",
    primaryHref = "/reservations",
    secondaryLabel = "Explore Our Menu",
    secondaryHref = "/menu",
}: CTABannerProps) {
    return (
        <section className="relative overflow-hidden bg-obsidian border-y border-gold-700/20">
            {/* Decorative gold lines */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            rgba(201,168,76,0.02) 40px,
            rgba(201,168,76,0.02) 41px
          )`,
                }}
            />

            <div className="relative z-10 section-padding py-24">
                <div className="container-narrow text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        {/* Gold diamond */}
                        <div className="w-3 h-3 rotate-45 bg-gold-600/40 border border-gold-600/60 mx-auto mb-8" />

                        <h2 className="section-title mb-4">{title}</h2>
                        <p className="section-subtitle max-w-lg mx-auto mb-10">{subtitle}</p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href={primaryHref} className="btn-primary px-10 py-4 group">
                                {primaryLabel}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                            </Link>
                            <Link href={secondaryHref} className="btn-ghost">
                                {secondaryLabel}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
