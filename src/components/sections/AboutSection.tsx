"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Heart, Leaf } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { useRef } from "react";

const values = [
    { icon: Heart, label: "Passion", desc: "Every dish crafted with love and cultural pride" },
    { icon: Award, label: "Excellence", desc: "Uncompromising quality in every experience" },
    { icon: Leaf, label: "Fresh", desc: "Locally sourced, seasonal ingredients daily" },
];

export default function AboutSection() {
    const { branch } = useBranch();
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <section className="section-padding bg-obsidian overflow-hidden" id="about">
            <div className="container-wide">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Video column */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        {/* Premium border frame — Royal Red accent corners */}
                        <div className="relative h-[500px] lg:h-[600px] border-2 border-gold-700/40">
                            {/* Top-left Royal Red corner accent */}
                            <div className="absolute -top-[6px] -left-[6px] w-14 h-14 border-t-4 border-l-4 border-royal-500 pointer-events-none z-10" />
                            {/* Bottom-right Royal Red corner accent */}
                            <div className="absolute -bottom-[6px] -right-[6px] w-14 h-14 border-b-4 border-r-4 border-royal-500 pointer-events-none z-10" />

                            <video
                                ref={videoRef}
                                src="/about-story-web.mp4"
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster="/assets/images/about-poster.jpg"
                                className="absolute inset-0 w-full h-full object-cover"
                                aria-label={`${branch.name} story video`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-obsidian/50 to-transparent pointer-events-none" />
                        </div>

                        {/* Floating stat card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="absolute -bottom-6 -right-4 lg:right-6 bg-charcoal border border-gold-700/30 p-6 w-48 z-20"
                        >
                            <p className="font-serif text-4xl font-bold gold-gradient-text">10+</p>
                            <p className="text-white/50 text-xs mt-1 leading-relaxed">
                                {branch.aboutStatLabel}
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Text column */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="text-royal-500 text-xs tracking-[0.3em] uppercase mb-4">Our Story</p>
                        <h2 className="section-title mb-6">
                            A Heritage of<br />
                            <span className="gold-gradient-text italic">Refined Taste</span>
                        </h2>
                        <div className="space-y-4 text-white/60 leading-relaxed mb-8">
                            {branch.aboutParagraphs.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>

                        {/* Values */}
                        <div className="grid grid-cols-3 gap-4 mb-10">
                            {values.map(({ icon: Icon, label, desc }) => (
                                <div key={label} className="text-center">
                                    <div className={`w-10 h-10 border flex items-center justify-center mx-auto mb-3 ${label === "Passion" ? "border-royal-700/40" : "border-gold-700/30"}`}>
                                        <Icon size={16} className={"text-gold-400"} />
                                    </div>
                                    <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
                                    <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>

                        <Link href="/contact" className="btn-outline border-gold-400 border">
                            Visit Us Today
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
