import type { Metadata } from "next";
import ContactInfoGrid from "./ContactInfoGrid";
import MapSection from "@/components/sections/MapSection";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Jroyal Grills. Located Opposite Flat Gate, Behind Flat, Nsukka, 410001, Enugu State. Reach us via WhatsApp, email, or our online reservation form.",
    keywords: [
        "Jroyal Grills contact",
        "Jroyal Grills address",
        "restaurant Nsukka contact",
        "Jroyal Grills phone",
        "Jroyal Grills WhatsApp",
    ],
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Header */}
            <div className="section-padding pb-0 text-center">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Get In Touch</p>
                <h1 className="section-title mb-4">
                    We&apos;d Love to<span className="gold-gradient-text italic"> Hear From You</span>
                </h1>
                <p className="section-subtitle max-w-xl mx-auto">
                    Whether you have a reservation enquiry, event request, or just want to say hello — we&apos;re always here.
                </p>
            </div>

            {/* Contact info cards — client component reads branch */}
            <div className="section-padding">
                <div className="container-wide">
                    <ContactInfoGrid />
                </div>
            </div>

            {/* Map — reads branch.mapsEmbedUrl internally */}
            <MapSection title="Find Us" />
        </div>
    );
}
