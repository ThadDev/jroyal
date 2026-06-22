"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMeals } from "@/context/MealsContext";
import MealCard from "@/components/dashboard/MealCard";
import AddOnsModal from "@/components/dashboard/AddOnsModal";
import { Search, X, ChevronLeft, Utensils, Sparkles, TrendingUp, Filter } from "lucide-react";
import type { Meal, MealCategory } from "@/types";
import { MEAL_CATEGORY_LABELS } from "@/types";
import { MEAL_CATEGORIES } from "@/lib/data/meals";

const ALL = "all" as const;
type FilterValue = MealCategory | typeof ALL;

const CATEGORY_ICONS: Record<string, string> = {
    rice: "https://i.pinimg.com/736x/93/18/37/931837b68ca2789e5195fb52cdd181e6.jpg",
    soup: "https://i.pinimg.com/736x/9a/82/2b/9a822b858f4b32a7e6a6817b3bd15fd2.jpg",
    native_dishes: "https://i.pinimg.com/736x/1b/9c/09/1b9c093d50677f3f30a5af2ffef54890.jpg",
    main_course: "https://i.pinimg.com/1200x/71/b2/c1/71b2c184b268c7f718c482b65b56ecd6.jpg",
    grilled_and_protein: "https://i.pinimg.com/736x/2f/e1/92/2fe1927ec424e6b28d9ca2443fab4f60.jpg",
    pastries: "https://i.pinimg.com/736x/3f/b1/e2/3fb1e2e53997d2e8bda4796cd0e4cb8c.jpg",
    drinks: "https://i.pinimg.com/1200x/5a/28/75/5a28758f2a3db6f67c386005c96ee4f8.jpg",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
    rice: "from-amber-900/80 to-yellow-800/40",
    soup: "from-red-900/80 to-orange-800/40",
    native_dishes: "from-green-900/80 to-emerald-800/40",
    main_course: "from-blue-900/80 to-indigo-800/40",
    grilled_and_protein: "from-orange-900/80 to-red-800/40",
    pastries: "from-pink-900/80 to-rose-800/40",
    drinks: "from-cyan-900/80 to-teal-800/40",
};

// Trending / suggested meal IDs shown when no results
const TRENDING_IDS = [
    "meal-grill-001",
    "meal-rice-001",
    "meal-soup-003",
    "meal-native-002",
];

export default function MenuClient() {
    const { meals, loading, addOns } = useMeals();
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialQ = searchParams.get("q") ?? "";
    const initialCat = (searchParams.get("category") ?? ALL) as FilterValue;

    const [query, setQuery] = useState(initialQ);
    const [activeFilter, setActiveFilter] = useState<FilterValue>(initialCat);
    const [activeMeal, setActiveMeal] = useState<Meal | null>(null);
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    // Sync URL params → state when navigating in
    useEffect(() => {
        setQuery(searchParams.get("q") ?? "");
        setActiveFilter((searchParams.get("category") ?? ALL) as FilterValue);
    }, [searchParams]);

    const categoriesInUse: MealCategory[] = MEAL_CATEGORIES.filter((c) =>
        meals.some((m) => m.category === c)
    );

    // Filtered meals based on search + category
    const filtered = useMemo(() => {
        let result = meals;
        if (activeFilter !== ALL) {
            result = result.filter((m) => m.category === activeFilter);
        }
        if (query.trim()) {
            const q = query.toLowerCase();
            result = result.filter(
                (m) =>
                    m.title.toLowerCase().includes(q) ||
                    m.description.toLowerCase().includes(q) ||
                    MEAL_CATEGORY_LABELS[m.category].toLowerCase().includes(q)
            );
        }
        return result;
    }, [meals, query, activeFilter]);

    // Grouping by category (only when no search query active)
    const grouped = useMemo<Record<MealCategory, Meal[]>>(() => {
        const g = {} as Record<MealCategory, Meal[]>;
        if (!query.trim() && activeFilter === ALL) {
            categoriesInUse.forEach((cat) => {
                g[cat] = meals.filter((m) => m.category === cat);
            });
        }
        return g;
    }, [meals, query, activeFilter, categoriesInUse]);

    const trending = useMemo(
        () => TRENDING_IDS.map((id) => meals.find((m) => m.id === id)).filter(Boolean) as Meal[],
        [meals]
    );

    const hasResults = filtered.length > 0;
    const isSearching = query.trim().length > 0 || activeFilter !== ALL;

    // Update URL params reactively
    const applyFilter = (cat: FilterValue) => {
        setActiveFilter(cat);
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (cat !== ALL) params.set("category", cat);
        router.replace(`/dashboard/menu?${params.toString()}`, { scroll: false });
    };

    const applySearch = (q: string) => {
        setQuery(q);
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (activeFilter !== ALL) params.set("category", activeFilter);
        router.replace(`/dashboard/menu?${params.toString()}`, { scroll: false });
    };

    const clearAll = () => {
        setQuery("");
        setActiveFilter(ALL);
        router.replace("/dashboard/menu", { scroll: false });
        searchRef.current?.focus();
    };

    return (
        <div style={{ paddingTop: "70px", minHeight: "100vh" }}>

            {/* ── Sticky Search + Filter Header ── */}
            <div
                style={{
                    position: "sticky",
                    top: "64px",
                    zIndex: 30,
                    background: "rgba(8,8,16,0.95)",
                    backdropFilter: "blur(20px)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    padding: "0.875rem 1rem",
                }}
            >
                <div className="max-w-4xl mx-auto flex flex-col gap-3">
                    {/* Back + Title row */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all shrink-0"
                            aria-label="Go back"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div>
                            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#F5F0E8", margin: 0, fontWeight: 700 }}>
                                Our Menu
                            </h1>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)", margin: 0, marginTop: "1px" }}>
                                {loading ? "Loading…" : `${meals.length} items available`}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                            className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${showFilterPanel || activeFilter !== ALL
                                ? "bg-gold-500/15 border-gold-500/40 text-gold-400"
                                : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                                }`}
                        >
                            <Filter size={12} />
                            {activeFilter !== ALL ? MEAL_CATEGORY_LABELS[activeFilter as MealCategory] : "Filter"}
                        </button>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <Search
                            size={16}
                            style={{
                                position: "absolute", left: "14px", top: "50%",
                                transform: "translateY(-50%)", color: "rgba(201,168,76,0.7)"
                            }}
                        />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={(e) => applySearch(e.target.value)}
                            placeholder="Search dishes, ingredients, categories…"
                            autoFocus={!!initialQ}
                            style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(201,168,76,0.2)",
                                borderRadius: "999px",
                                padding: "0.75rem 2.75rem",
                                fontSize: "14px",
                                color: "#F5F0E8",
                                fontFamily: "Inter, sans-serif",
                                outline: "none",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.5)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(201,168,76,0.2)")}
                        />
                        {(query || activeFilter !== ALL) && (
                            <button
                                onClick={clearAll}
                                style={{
                                    position: "absolute", right: "12px", top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "rgba(255,255,255,0.08)", border: "none",
                                    borderRadius: "50%", width: "22px", height: "22px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: "pointer", color: "rgba(255,255,255,0.5)",
                                }}
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Category pills (shown when filter panel open) */}
                    {showFilterPanel && (
                        <div
                            className="flex gap-2 overflow-x-auto pb-1"
                            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                        >
                            <button
                                onClick={() => { applyFilter(ALL); setShowFilterPanel(false); }}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeFilter === ALL
                                    ? "bg-gold-500/15 border-gold-500/40 text-gold-400"
                                    : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                                    }`}
                            >
                                All
                            </button>
                            {categoriesInUse.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => { applyFilter(cat); setShowFilterPanel(false); }}
                                    className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${activeFilter === cat
                                        ? "bg-gold-500/15 border-gold-500/40 text-gold-400"
                                        : "bg-white/5 border-white/10 text-white/50 hover:text-white/70"
                                        }`}
                                >
                                    <img
                                        src={CATEGORY_ICONS[cat] || CATEGORY_ICONS.main_course}
                                        alt=""
                                        className="w-4 h-4 rounded-full object-cover"
                                    />
                                    {MEAL_CATEGORY_LABELS[cat]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">

                {/* ── Loading skeletons ── */}
                {loading && (
                    <div className="flex flex-col gap-10">
                        {[1, 2].map((s) => (
                            <div key={s}>
                                <div className="h-6 w-40 bg-white/5 rounded-full mb-4 animate-pulse" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-[100px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && (
                    <>
                        {/* ── Active category hero banner ── */}
                        {activeFilter !== ALL && !query.trim() && (
                            <div
                                className={`relative overflow-hidden rounded-2xl mb-6 h-[120px] flex items-end p-5 bg-gradient-to-r ${CATEGORY_GRADIENTS[activeFilter] ?? "from-gold-900/80 to-gold-800/40"}`}
                            >
                                <img
                                    src={CATEGORY_ICONS[activeFilter] || CATEGORY_ICONS.main_course}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                                />
                                <div className="relative z-10">
                                    <p className="text-xs text-white/50 font-sans mb-0.5">Browsing</p>
                                    <h2 className="font-serif text-2xl text-white font-bold m-0 leading-none">
                                        {MEAL_CATEGORY_LABELS[activeFilter as MealCategory]}
                                    </h2>
                                    <p className="text-xs text-white/50 font-sans mt-1 m-0">
                                        {filtered.length} {filtered.length === 1 ? "item" : "items"} available
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Search results header ── */}
                        {query.trim() && (
                            <div className="mb-5 flex items-center gap-2">
                                <Search size={14} style={{ color: "#C9A84C" }} />
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
                                    {hasResults
                                        ? <><span style={{ color: "#F5F0E8", fontWeight: 600 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span> for "{query}"</>
                                        : <>No results for "<span style={{ color: "#F5F0E8" }}>{query}</span>"</>
                                    }
                                </span>
                            </div>
                        )}

                        {/* ── Results grid ── */}
                        {hasResults && (query.trim() || activeFilter !== ALL) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                                {filtered.map((meal) => (
                                    <MealCard key={meal.id} meal={meal} compact onAdd={setActiveMeal} />
                                ))}
                            </div>
                        )}

                        {/* ── Grouped by category (default view) ── */}
                        {!query.trim() && activeFilter === ALL && (
                            <div className="flex flex-col gap-10">
                                {categoriesInUse.map((cat) => (
                                    <div key={cat}>
                                        {/* Category header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <img
                                                src={CATEGORY_ICONS[cat] || CATEGORY_ICONS.main_course}
                                                alt={MEAL_CATEGORY_LABELS[cat]}
                                                className="w-8 h-8 rounded-full object-cover border border-white/10"
                                            />
                                            <h3 className="font-serif text-lg text-gold-400 font-bold m-0 whitespace-nowrap">
                                                {MEAL_CATEGORY_LABELS[cat]}
                                            </h3>
                                            <div className="h-px flex-1 bg-gold-500/15" />
                                            <button
                                                onClick={() => applyFilter(cat)}
                                                className="text-xs text-white/30 hover:text-gold-400 transition-colors whitespace-nowrap"
                                            >
                                                See all
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(grouped[cat] ?? []).map((meal) => (
                                                <MealCard key={meal.id} meal={meal} compact onAdd={setActiveMeal} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── Empty State ── */}
                        {!hasResults && isSearching && (
                            <div className="py-4">
                                {/* Empty illustration */}
                                <div
                                    className="flex flex-col items-center justify-center py-12 text-center"
                                    style={{
                                        background: "rgba(255,255,255,0.02)",
                                        border: "1px dashed rgba(255,255,255,0.08)",
                                        borderRadius: "20px",
                                        marginBottom: "2.5rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "72px", height: "72px",
                                            borderRadius: "50%",
                                            background: "rgba(201,168,76,0.08)",
                                            border: "1px solid rgba(201,168,76,0.15)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            marginBottom: "1.25rem",
                                        }}
                                    >
                                        <Utensils size={28} style={{ color: "rgba(201,168,76,0.5)" }} />
                                    </div>
                                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#F5F0E8", fontWeight: 700, margin: "0 0 6px" }}>
                                        Nothing found
                                    </p>
                                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: "0 0 1.5rem", maxWidth: "280px", lineHeight: 1.6 }}>
                                        We couldn't find anything matching your search. Try a different keyword or browse by category.
                                    </p>
                                    <button
                                        onClick={clearAll}
                                        style={{
                                            padding: "0.5rem 1.5rem",
                                            borderRadius: "999px",
                                            background: "rgba(201,168,76,0.12)",
                                            border: "1px solid rgba(201,168,76,0.25)",
                                            color: "#C9A84C",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            fontFamily: "Inter, sans-serif",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Clear search
                                    </button>
                                </div>

                                {/* You might also like */}
                                <SuggestionSection title="You might also like" icon="sparkles" meals={trending} onAdd={setActiveMeal} />
                            </div>
                        )}

                        {/* ── Suggestions below search results ── */}
                        {hasResults && query.trim() && trending.filter(t => !filtered.find(f => f.id === t.id)).length > 0 && (
                            <SuggestionSection
                                title="Trending dishes"
                                icon="trending"
                                meals={trending.filter(t => !filtered.find(f => f.id === t.id))}
                                onAdd={setActiveMeal}
                            />
                        )}
                    </>
                )}
            </div>

            <AddOnsModal meal={activeMeal} addOns={addOns} onClose={() => setActiveMeal(null)} />
        </div>
    );
}

// ── Suggestion Section ─────────────────────────────────────────
function SuggestionSection({
    title,
    icon,
    meals,
    onAdd,
}: {
    title: string;
    icon: "sparkles" | "trending";
    meals: Meal[];
    onAdd: (meal: Meal) => void;
}) {
    if (!meals.length) return null;

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                {icon === "sparkles" ? (
                    <Sparkles size={15} style={{ color: "#C9A84C" }} />
                ) : (
                    <TrendingUp size={15} style={{ color: "#C9A84C" }} />
                )}
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", color: "#F5F0E8", fontWeight: 700, margin: 0 }}>
                    {title}
                </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} compact onAdd={onAdd} />
                ))}
            </div>
        </div>
    );
}
