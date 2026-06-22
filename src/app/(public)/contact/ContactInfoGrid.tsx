"use client";
/**
 * ContactInfoGrid
 * ───────────────
 * Client component that renders the branch-specific contact information cards.
 * Extracted so contact/page.tsx can remain a server component (for SEO metadata).
 */
import { MapPin, Clock, Mail, MessageCircle } from "lucide-react";
import { useBranch } from "@/context/BranchContext";

export default function ContactInfoGrid() {
    const { branch } = useBranch();

    const cards = [
        {
            icon: MapPin,
            title: "Address",
            value: branch.address,
            link: branch.mapsDirectionsUrl,
            linkLabel: "Get Directions →",
        },
        {
            icon: Clock,
            title: "Opening Hours",
            value: "Monday – Sunday\n9:00 AM – 9:00 PM",
            link: null as string | null,
            linkLabel: null as string | null,
        },
        {
            icon: MessageCircle,
            title: "WhatsApp",
            value: "Chat with us instantly for reservations and enquiries",
            link: `https://wa.me/${branch.whatsapp}`,
            linkLabel: "Open WhatsApp →",
        },
        {
            icon: Mail,
            title: "Email",
            value: "info@mamaonyinye.com",
            link: "mailto:info@mamaonyinye.com",
            linkLabel: "Send Email →",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 mb-16">
            {cards.map(({ icon: Icon, title, value, link, linkLabel }) => (
                <div
                    key={title}
                    className="bg-charcoal border border-white/5 p-8 hover:border-gold-700/20 transition-colors"
                >
                    <div className="w-10 h-10 border border-gold-700/30 flex items-center justify-center mb-6">
                        <Icon size={18} className="text-gold-600" />
                    </div>
                    <h3 className="font-serif text-gold-400 font-semibold mb-3">{title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line mb-3">
                        {value}
                    </p>
                    {link && (
                        <a
                            href={link}
                            target={link.startsWith("http") ? "_blank" : undefined}
                            rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="text-gold-500 text-xs hover:text-gold-400 transition-colors"
                        >
                            {linkLabel}
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
