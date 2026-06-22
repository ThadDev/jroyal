import type { Metadata } from "next";
import Link from "next/link";
import CTABanner from "@/components/sections/CTABanner";
import { MEALS, MEAL_CATEGORIES } from "@/lib/data/meals";
import { MEAL_CATEGORY_LABELS } from "@/types";
import PublicMealGrid from "@/components/public/PublicMealGrid";

export const metadata: Metadata = {
    title: "Our Menu – Nigerian & Continental Cuisine",
    description:
        "Explore our curated menu of authentic Nigerian dishes and continental favourites, prepared fresh daily by our expert chefs at Jroyal Grills, Nsukka.",
};

export default function MenuPage() {
    // Group available meals by category (in defined display order)
    const grouped = MEAL_CATEGORIES.map((cat) => ({
        category: cat,
        label: MEAL_CATEGORY_LABELS[cat],
        meals: MEALS.filter((m) => m.category === cat && m.available),
    })).filter((g) => g.meals.length > 0);

    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Header */}
            <div className="section-padding pb-0 text-center">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Our Cuisine</p>
                <h1 className="section-title mb-4">
                    The Jroyal <span className="gold-gradient-text italic">Menu</span>
                </h1>
                <p className="section-subtitle max-w-xl mx-auto mb-4">
                    A celebration of Nigerian tradition and continental flair, crafted fresh daily
                    from the finest local ingredients.
                </p>
                <p className="text-white/30 text-xs italic">
                    Prices include VAT. Menu subject to seasonal availability.
                </p>
            </div>

            {/* Menu categories */}
            <div className="section-padding">
                <div className="container-narrow space-y-24">
                    {grouped.map(({ category, label, meals }) => (
                        <div key={category}>
                            <div className="flex items-center gap-6 mb-12">
                                <h2 className="font-serif text-2xl text-gold-400 tracking-wider whitespace-nowrap">
                                    {label}
                                </h2>
                                <div className="h-px flex-1 bg-gold-700/20" />
                            </div>
                            <PublicMealGrid meals={meals} />
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA — login to order */}
            <div className="section-padding pt-0">
                <div className="container-narrow text-center">
                    <div className="inline-block mb-8 px-6 py-3 border border-gold-700/30 bg-gold-900/10">
                        <p className="text-white/60 text-sm">
                            Want to order?{" "}
                            <Link href="/auth/login" className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                                Sign in
                            </Link>{" "}
                            to access our full ordering system with add-ons and cart.
                        </p>
                    </div>
                </div>
            </div>

            <CTABanner
                title="Dine With Us Tonight"
                subtitle="Every dish is better shared. Reserve your table and let us take care of the rest."
                primaryLabel="Make a Reservation"
                primaryHref="/reservations"
                secondaryLabel="Contact Us"
                secondaryHref="/contact"
            />
        </div>
    );
}
