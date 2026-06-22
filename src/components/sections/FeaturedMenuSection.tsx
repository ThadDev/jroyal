import Link from "next/link";
import { MEALS } from "@/lib/data/meals";
import PublicMealGrid from "@/components/public/PublicMealGrid";

export default function FeaturedMenuSection() {
    // Select the first 6 available meals as featured
    const featuredMeals = MEALS.filter((m) => m.available).slice(0, 6);

    return (
        <section className="section-padding bg-charcoal/30 border-y border-white/5">
            <div className="container-narrow text-center mb-16">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Taste of Excellence</p>
                <h2 className="section-title mb-4">
                    Featured <span className="gold-gradient-text italic">Meals</span>
                </h2>
                <p className="section-subtitle max-w-xl mx-auto">
                    A selection of our chef's finest recommendations, crafted with passion and premium ingredients.
                </p>
            </div>
            
            <div className="container-wide mb-16">
                <PublicMealGrid meals={featuredMeals} />
            </div>

            <div className="text-center">
                <Link href="/menu" className="btn-primary">
                    View Full Menu
                </Link>
            </div>
        </section>
    );
}
