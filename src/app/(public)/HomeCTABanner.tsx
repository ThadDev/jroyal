"use client";
/**
 * HomeCTABanner
 * ─────────────
 * Client wrapper around CTABanner that injects branch-specific title.
 * The home page stays a server component (for SEO metadata) while this
 * child handles the dynamic content.
 */
import CTABanner from "@/components/sections/CTABanner";
import { useBranch } from "@/context/BranchContext";

export default function HomeCTABanner() {
    const { branch } = useBranch();
    return (
        <CTABanner
            title={branch.ctaBannerTitle}
            subtitle="Reserve your table today and let us craft an unforgettable experience tailored to you."
            primaryLabel="Make a Reservation"
            primaryHref="/reservations"
            secondaryLabel="Explore Our Menu"
            secondaryHref="/menu"
        />
    );
}
