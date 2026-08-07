import type { Metadata } from "next";
import dynamic from "next/dynamic";

// HeroSection is above-the-fold — eager import so it SSRs immediately (best LCP)
import HeroSection from "@/components/sections/HeroSection";

// All below-fold sections are lazy-loaded (code-split) to shrink the initial JS bundle.
// ssr:true keeps server-rendering for SEO while deferring the client-side JS.
const AboutSection = dynamic(() => import("@/components/sections/AboutSection"), { ssr: true });
const ServicesSection = dynamic(() => import("@/components/sections/ServicesSection"), { ssr: true });
const FeaturedMenuSection = dynamic(() => import("@/components/sections/FeaturedMenuSection"), { ssr: true });
const GalleryPreviewSection = dynamic(() => import("@/components/sections/GalleryPreviewSection"), { ssr: true });
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"), { ssr: true });
const HomeCTABanner = dynamic(() => import("./HomeCTABanner"), { ssr: true });
const MapSection = dynamic(() => import("@/components/sections/MapSection"), { ssr: true });

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
            <HomeCTABanner />
            <MapSection />
        </>
    );
}
