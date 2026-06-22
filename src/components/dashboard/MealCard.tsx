"use client";
import Image from "next/image";
import type { Meal } from "@/types";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { formatNaira } from "@/context/CartContext";
import { Utensils } from "lucide-react";

interface MealCardProps {
    meal: Meal;
    compact?: boolean;
    /** Optional gradient hint for featured cards */
    accentGradient?: string;
    /** Show as the horizontal-scroll "featured" card format */
    featured?: boolean;
    /** Callback to open the global Add-Ons modal */
    onAdd: (meal: Meal) => void;
}

const glassCard = {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    transition: "all 0.2s ease",
};

export default function MealCard({
    meal,
    compact = false,
    accentGradient,
    featured = false,
    onAdd,
}: MealCardProps) {
    if (featured) {
        return (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    flexShrink: 0,
                    ...glassCard,
                    ...(accentGradient ? { backgroundImage: accentGradient } : {}),
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Hero Image taking the top section */}
                <div
                    style={{
                        width: "100%",
                        height: "120px",
                        backgroundColor: "rgba(255,255,255,0.05)",
                        position: "relative",
                    }}
                >
                    {meal.image ? (
                        <Image
                            src={meal.image}
                            alt={meal.title}
                            fill
                            className="object-cover"
                            sizes="260px"
                            unoptimized
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Utensils size={24} style={{ color: "#C9A84C" }} />
                        </div>
                    )}
                    {/* Dark gradient overlay blending into card body */}
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }} />
                </div>

                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "14px",
                            color: "#F5F0E8",
                            margin: "0 0 4px",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {meal.title}
                    </h3>
                    <p
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                            margin: "0 0 16px",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flex: 1,
                        }}
                    >
                        {meal.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <span
                            style={{
                                fontFamily: "Inter, sans-serif",
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#C9A84C",
                            }}
                        >
                            {formatNaira(meal.basePrice)}
                        </span>
                        <AddToCartButton onClick={() => onAdd(meal)} compact={true} />
                    </div>
                </div>
            </div>
        );
    }

    // ── Compact list card ──────────────────────────────────────
    return (
        <div
            style={{
                ...glassCard,
                padding: "0.75rem",
                display: "flex",
                alignItems: "stretch",
                gap: "1.25rem",
            }}
        >
            {/* Thumbnail */}
            <div
                style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    flexShrink: 0,
                    backgroundColor: "rgba(255,255,255,0.05)",
                }}
            >
                {meal.image ? (
                    <Image
                        src={meal.image}
                        alt={meal.title}
                        fill
                        className="object-cover"
                        sizes="100px"
                        unoptimized
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Utensils size={20} style={{ color: "#C9A84C" }} />
                    </div>
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "0.25rem 0" }}>
                <h4
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "15px",
                        color: "#F5F0E8",
                        margin: "0 0 4px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {meal.title}
                </h4>
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.45)",
                        margin: "0 0 12px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                    }}
                >
                    {meal.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <span
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "#C9A84C",
                        }}
                    >
                        {formatNaira(meal.basePrice)}
                    </span>
                    <AddToCartButton onClick={() => onAdd(meal)} compact={compact} />
                </div>
            </div>
        </div>
    );
}
