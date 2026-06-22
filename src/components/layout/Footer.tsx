"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import ChangeBranchButton from "@/components/ui/ChangeBranchButton";

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { branch } = useBranch();

    return (
        <footer className="bg-obsidian border-t border-white/5">
            {/* Gold top stripe */}
            <div className="h-px w-full shimmer-gold opacity-60" />

            <div className="container-wide section-padding pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="mb-6">
                            <Image
                                src="/logo.png"
                                alt="Jroyal Grills"
                                width={140}
                                height={56}
                                className="object-contain h-12 w-auto"
                            />
                        </div>
                        <p className="text-white/50 text-sm leading-relaxed mb-6">
                            {branch.footerBlurb}
                        </p>
                        <div className="flex items-center gap-4">
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                            >
                                <Instagram size={14} />
                            </a>
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                            >
                                <Facebook size={14} />
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="w-8 h-8 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                            >
                                <Twitter size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif text-sm font-semibold text-gold-500 uppercase tracking-widest mb-6">
                            Navigate
                        </h3>
                        <ul className="space-y-3">
                            {[
                                { href: "/menu", label: "Our Menu" },
                                { href: "/reservations", label: "Reservations" },
                                { href: "/events", label: "Events & Catering" },
                                { href: "/gallery", label: "Gallery" },
                                { href: "/blog", label: "Blog" },
                                { href: "/contact", label: "Contact Us" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-white/50 text-sm hover:text-gold-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-serif text-sm font-semibold text-gold-500 uppercase tracking-widest mb-6">
                            Services
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Restaurant Dining",
                                "Corporate Events",
                                "Outside Catering",
                                "Private Dining",
                                "Outdoor Catering",
                                "Event Planning",
                            ].map((s) => (
                                <li key={s} className="text-white/50 text-sm flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-gold-700 flex-shrink-0" />
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-serif text-sm font-semibold text-gold-500 uppercase tracking-widest mb-6">
                            Find Us
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin size={14} className="text-gold-600 mt-1 flex-shrink-0" />
                                <span className="text-white/50 text-sm leading-relaxed">
                                    {branch.address}
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Clock size={14} className="text-gold-600 flex-shrink-0" />
                                <span className="text-white/50 text-sm">Mon 4PM–11PM · Tue–Sun 10AM–11PM</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={14} className="text-gold-600 flex-shrink-0" />
                                <a
                                    href={`https://wa.me/${branch.whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/50 text-sm hover:text-gold-400 transition-colors"
                                    aria-label={`WhatsApp ${branch.name}`}
                                >
                                    {branch.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={14} className="text-gold-600 flex-shrink-0" />
                                <a
                                    href="mailto:info@jroyalgrills.com"
                                    className="text-white/50 text-sm hover:text-gold-400 transition-colors"
                                >
                                    info@jroyalgrills.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs">
                        © {currentYear} {branch.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <ChangeBranchButton variant="footer" />
                        <Link href="/admin/login" className="text-white/20 text-xs hover:text-white/40 transition-colors">
                            Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
