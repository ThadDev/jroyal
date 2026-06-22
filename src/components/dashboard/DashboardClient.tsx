"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMeals } from "@/context/MealsContext";
import Link from "next/link";
import { ArrowRight, Utensils, Search, SlidersHorizontal } from "lucide-react";
import type { Meal, MealCategory } from "@/types";
import { MEAL_CATEGORY_LABELS } from "@/types";
import { MEAL_CATEGORIES } from "@/lib/data/meals";
import MealCard from "@/components/dashboard/MealCard";
import AddOnsModal from "@/components/dashboard/AddOnsModal";

interface DashboardClientProps {
    firstName: string;
}

// Banners Data
const PROMO_BANNERS = [
    {
        id: "promo1",
        title: `Special offer for ${new Date().toLocaleString('default', { month: 'long' })}!`,
        buttonText: "Order now",
        image: "https://i.pinimg.com/1200x/75/7f/10/757f1002f30dc855e214c5857d50c668.jpg?q=80&w=800&auto=format&fit=crop",
        gradient: "from-green-900/90 via-charcoal/70 to-transparent"
    },
    {
        id: "promo2",
        title: "Freshly Baked Pastries Daily",
        buttonText: "Order now",
        image: "https://i.pinimg.com/736x/9b/f1/73/9bf173382fa2d0a7f1cc212c9fa44886.jpg",
        gradient: "from-indigo-900/90 via-charcoal/70 to-transparent"
    },
    {
        id: "promo3",
        title: "Have an event? Reserve a table",
        buttonText: "Reserve table",
        link: "/reservations",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        gradient: "from-rose-900/90 via-charcoal/70 to-transparent"
    }
];

const CATEGORY_ICONS: Record<string, string> = {
    rice: "https://i.pinimg.com/736x/93/18/37/931837b68ca2789e5195fb52cdd181e6.jpg",
    soup: "https://i.pinimg.com/736x/9a/82/2b/9a822b858f4b32a7e6a6817b3bd15fd2.jpg",
    native_dishes: "https://i.pinimg.com/736x/1b/9c/09/1b9c093d50677f3f30a5af2ffef54890.jpg",
    main_course: "https://i.pinimg.com/1200x/71/b2/c1/71b2c184b268c7f718c482b65b56ecd6.jpg",
    grilled_and_protein: "https://i.pinimg.com/736x/2f/e1/92/2fe1927ec424e6b28d9ca2443fab4f60.jpg",
    pastries: "https://i.pinimg.com/736x/3f/b1/e2/3fb1e2e53997d2e8bda4796cd0e4cb8c.jpg",
    drinks: "https://i.pinimg.com/1200x/5a/28/75/5a28758f2a3db6f67c386005c96ee4f8.jpg"
};

export default function DashboardClient({ firstName }: DashboardClientProps) {
    const { meals, loading, addOns } = useMeals();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
    const menuRef = useRef<HTMLElement>(null);
    const bannerCarouselRef = useRef<HTMLDivElement>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [activeBannerIndex, setActiveBannerIndex] = useState(0);
    const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

    // Auto-slide promotional banner carousel once through
    useEffect(() => {
        const interval = setInterval(() => {
            if (bannerCarouselRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = bannerCarouselRef.current;

                if (scrollLeft + clientWidth >= scrollWidth - 10) {
                    clearInterval(interval);
                } else {
                    const children = Array.from(bannerCarouselRef.current.children) as HTMLElement[];
                    let closestIndex = 0;
                    let minDiff = Infinity;
                    children.forEach((child, index) => {
                        const diff = Math.abs(child.offsetLeft - scrollLeft);
                        if (diff < minDiff) {
                            minDiff = diff;
                            closestIndex = index;
                        }
                    });

                    const nextIndex = closestIndex + 1;
                    if (nextIndex < children.length) {
                        bannerCarouselRef.current.scrollTo({ left: children[nextIndex].offsetLeft, behavior: "smooth" });
                    } else {
                        clearInterval(interval);
                    }
                }
            }
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    // Listen for search focus event dispatched from DashboardNav
    useEffect(() => {
        const focusSearch = () => {
            const input = searchInputRef.current;
            if (!input) return;
            // Scroll the input into the visible viewport before focusing
            // (critical on mobile so the keyboard doesn't hide it)
            input.scrollIntoView({ behavior: "smooth", block: "center" });
            // Small delay lets scroll settle before keyboard opens
            setTimeout(() => {
                input.focus();
                input.select();
                setSearchFocused(true);
                // Remove highlight after animation
                setTimeout(() => setSearchFocused(false), 1800);
            }, 300);
        };
        window.addEventListener("dashboard:focus-search", focusSearch);
        return () => window.removeEventListener("dashboard:focus-search", focusSearch);
    }, []);

    const handleBannerScroll = () => {
        if (!bannerCarouselRef.current) return;
        const scrollLeft = bannerCarouselRef.current.scrollLeft;
        const children = Array.from(bannerCarouselRef.current.children) as HTMLElement[];
        let closestIndex = 0;
        let minDiff = Infinity;

        children.forEach((child, index) => {
            const diff = Math.abs(child.offsetLeft - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });

        if (activeBannerIndex !== closestIndex) {
            setActiveBannerIndex(closestIndex);
        }
    };

    const handleCategoryScroll = () => {
        if (!categoryScrollRef.current) return;
        const scrollLeft = categoryScrollRef.current.scrollLeft;
        const children = Array.from(categoryScrollRef.current.children) as HTMLElement[];
        
        let closestIndex = 0;
        let minDiff = Infinity;
        
        children.forEach((child, index) => {
            const diff = Math.abs(child.offsetLeft - scrollLeft);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = index;
            }
        });

        if (activeCategoryIndex !== closestIndex) {
            setActiveCategoryIndex(closestIndex);
        }
    };

    const scrollToBanner = (index: number) => {
        if (!bannerCarouselRef.current) return;
        const banner = bannerCarouselRef.current.children[index] as HTMLElement;
        if (banner) {
            bannerCarouselRef.current.scrollTo({
                left: banner.offsetLeft,
                behavior: "smooth"
            });
        }
    };

    const scrollToMenu = () => {
        if (menuRef.current) {
            const y = menuRef.current.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    };

    const handleCategoryClick = (cat: MealCategory) => {
        router.push(`/dashboard/menu?category=${cat}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/dashboard/menu?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const featured = meals.slice(0, 4);

    const categoriesInUse: MealCategory[] = MEAL_CATEGORIES.filter((c: MealCategory) =>
        meals.some((m) => m.category === c)
    );

    const grouped: Record<MealCategory, Meal[]> = {} as Record<MealCategory, Meal[]>;
    categoriesInUse.forEach((cat: MealCategory) => {
        grouped[cat] = meals.filter((m: Meal) => m.category === cat);
    });

    return (
        <div style={{ paddingTop: "70px", minHeight: "100vh" }}>
            {/* ── Search Bar ── */}
            <div className="px-4 md:px-6 pt-4 pb-2 max-w-7xl mx-auto">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        ref={searchInputRef}
                        id="dashboard-search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search dishes, categories…"
                        style={{
                            transition: "border-color 0.2s, box-shadow 0.3s",
                            boxShadow: searchFocused
                                ? "0 0 0 3px rgba(201,168,76,0.25), 0 0 20px rgba(201,168,76,0.12)"
                                : "none",
                        }}
                        className={`w-full bg-white/5 rounded-full py-3.5 pl-12 pr-12 text-sm text-white placeholder-white/40 focus:outline-none transition-all border ${searchFocused
                                ? "border-gold-500/60"
                                : "border-white/10"
                            }`}
                    />
                    <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-gold-400 transition-colors" aria-label="Search">
                        <Search size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/menu")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-gold-400 transition-colors"
                        aria-label="Browse full menu"
                    >
                        <SlidersHorizontal size={18} />
                    </button>
                </form>
            </div>

            {/* ── Scrollable Promo Banners ── */}
            <section className="pt-4 pb-6 px-4 md:px-6 max-w-7xl mx-auto">
                <div className="relative">
                    <div
                        ref={bannerCarouselRef}
                        onScroll={handleBannerScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth" }}
                    >
                        {PROMO_BANNERS.map((promo) => (
                            <div
                                key={promo.id}
                                className="snap-center relative overflow-hidden rounded-2xl flex-shrink-0 w-full h-[160px] md:h-[200px] flex flex-col justify-center p-6 shadow-xl"
                            >
                                <img src={promo.image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover" />
                                <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient}`} />
                                <div className="relative z-10 w-[85%] sm:w-2/3">
                                    <h2 className="text-white font-serif text-[17px] md:text-2xl font-bold leading-tight mb-4 drop-shadow-lg">
                                        {promo.title}
                                    </h2>
                                    {promo.link ? (
                                        <Link href={promo.link} className="inline-flex items-center justify-center bg-obsidian text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gold-500 hover:text-obsidian transition-colors shadow-md">
                                            {promo.buttonText}
                                        </Link>
                                    ) : (
                                        <button onClick={scrollToMenu} className="inline-flex items-center justify-center bg-obsidian text-white text-xs font-bold px-5 py-2.5 rounded-full hover:bg-gold-500 hover:text-obsidian transition-colors shadow-md">
                                            {promo.buttonText}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Scroll Dots */}
                    <div className="flex justify-center items-center gap-2 mt-4">
                        {PROMO_BANNERS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToBanner(index)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeBannerIndex === index
                                        ? "w-5 bg-gold-500"
                                        : "w-2 bg-white/20 hover:bg-white/40"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Top Categories Icons ── */}
            <section className="px-4 md:px-6 py-2 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg text-white font-bold m-0">Top Categories</h2>
                    <Link href="/dashboard/menu" className="text-xs text-white/50 hover:text-gold-400 transition-colors">See all</Link>
                </div>

                <div
                    ref={categoryScrollRef}
                    onScroll={handleCategoryScroll}
                    className="flex gap-4 sm:gap-8 overflow-x-auto pb-4 snap-x snap-mandatory"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {categoriesInUse.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center justify-start gap-2 flex-shrink-0 snap-start active:scale-95 transition-transform w-[72px]"
                        >
                            <div className={`w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-transparent p-0.5`}>
                                <img
                                    src={CATEGORY_ICONS[cat as string] || CATEGORY_ICONS.main_course}
                                    alt={MEAL_CATEGORY_LABELS[cat]}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                            <span className={`text-[11px] font-sans font-semibold text-center leading-tight text-white/80`}>
                                {MEAL_CATEGORY_LABELS[cat]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Category Scroll Dots */}
                <div className="flex justify-center items-center gap-1.5 mt-2">
                    {categoriesInUse.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1 rounded-full transition-all duration-300 ${activeCategoryIndex === index
                                    ? "w-4 bg-gold-500"
                                    : "w-1 bg-white/20"
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* ── Featured Meals ── */}
            <section className="px-4 md:px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-lg text-white font-bold m-0">Featured Picks</h2>
                    <Link href="/dashboard/menu" className="text-xs text-white/50 hover:text-gold-400 transition-colors">See all</Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-full h-[220px] bg-white/5 rounded-2xl border border-white/10 animate-pulse" />
                        ))
                    ) : (
                        featured.map((meal) => (
                            <div key={meal.id} className="relative w-full">
                                <MealCard meal={meal} featured onAdd={setActiveMeal} />
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ── Quick Menu Preview ── */}
            <section ref={menuRef} className="px-4 md:px-6 py-8 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-2xl text-white font-bold m-0 flex items-center gap-2">
                        <Utensils size={20} className="text-gold-500" />
                        Browse Menu
                    </h2>
                    <Link
                        href="/dashboard/menu"
                        className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 transition-colors font-semibold"
                    >
                        Full menu <ArrowRight size={12} />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-white/30 text-sm">Loading impressive menu…</div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {categoriesInUse.slice(0, 4).map((cat) => {
                            // For drinks, feature Zobo, Yoghurt & Chocolate Parfait specifically
                            const DRINKS_FEATURED = ["meal-drink-006", "meal-drink-005", "meal-drink-004"];
                            const previewMeals = cat === "drinks"
                                ? DRINKS_FEATURED.map((id) => (grouped[cat] ?? []).find((m) => m.id === id)).filter(Boolean) as typeof grouped[typeof cat]
                                : (grouped[cat] ?? []).slice(0, 3);
                            return (
                                <div key={cat}>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h3 className="font-serif text-lg text-gold-400 font-bold m-0 whitespace-nowrap">
                                            {MEAL_CATEGORY_LABELS[cat]}
                                        </h3>
                                        <div className="h-px flex-1 bg-gold-500/20" />
                                        <button
                                            onClick={() => router.push(`/dashboard/menu?category=${cat}`)}
                                            className="text-xs text-white/30 hover:text-gold-400 transition-colors whitespace-nowrap"
                                        >
                                            See all
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {previewMeals.map((meal) => (
                                            <MealCard key={meal.id} meal={meal} compact onAdd={setActiveMeal} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        <Link
                            href="/dashboard/menu"
                            className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-gold-500/20 bg-gold-500/5 hover:bg-gold-500/10 text-gold-400 text-sm font-semibold transition-all"
                        >
                            View full menu <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
            </section>

            <AddOnsModal meal={activeMeal} addOns={addOns} onClose={() => setActiveMeal(null)} />
        </div>
    );
}
