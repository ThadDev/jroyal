import type { Metadata } from "next";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import FeaturedMenuSection from "@/components/sections/FeaturedMenuSection";
import ServicesSection from "@/components/sections/ServicesSection";
import GalleryPreviewSection from "@/components/sections/GalleryPreviewSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import HomeCTABanner from "./HomeCTABanner";
import MapSection from "@/components/sections/MapSection";

export const metadata: Metadata = {
    title: "Jroyal Grills – Premium Grills & Fine Dining | Nsukka, Nigeria",
    description:
        "Experience exceptional grills, private events, and outside catering at Jroyal Grills — Nsukka's premier restaurant.",
};

export default function HomePage() {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <ServicesSection />

            <FeaturedMenuSection />
            <GalleryPreviewSection />
            <TestimonialsSection />
            {/* Dynamic CTABanner — client wrapper reads branch context */}
            <HomeCTABanner />
            {/* MapSection reads branch mapsEmbedUrl internally */}
            <MapSection />
        </>
    );
}
