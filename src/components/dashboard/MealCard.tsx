"use client";
import Image from "next/image";
import type { Meal } from "@/types";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { formatNaira } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { Utensils } from "lucide-react";

interface MealCardProps {
    meal: Meal;
    compact?: boolean;
    accentGradient?: string;
    featured?: boolean;
    onAdd: (meal: Meal) => void;
}

export default function MealCard({ meal, compact = false, accentGradient, featured = false, onAdd }: MealCardProps) {
    const { theme } = useTheme();
    const L = theme === "light";

    const card: React.CSSProperties = {
        background: L ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.03)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: L ? "1px solid rgba(0,0,0,0.09)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        transition: "all 0.2s ease",
    };

    // light mode: black titles, red prices; dark mode: cream titles, gold prices
    const titleColor = L ? "#1A1A1A" : "#F5F0E8";
    const descColor = L ? "rgba(26,26,26,0.50)" : "rgba(255,255,255,0.45)";
    const priceColor = L ? "#AB2330" : "#F6A81C";
    const imgPlaceBg = L ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    const iconColor = L ? "#AB2330" : "#F6A81C";
    // overlay is always dark so the text (overlaid on image) stays readable
    const imgOverlay = "linear-gradient(to top, rgba(0,0,0,0.75), transparent)";

    if (featured) {
        return (
            <div style={{ width: "100%", height: "100%", flexShrink: 0, ...card, ...(accentGradient ? { backgroundImage: accentGradient } : {}), position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ width: "100%", height: "120px", backgroundColor: imgPlaceBg, position: "relative" }}>
                    {meal.image ? (
                        <Image src={meal.image} alt={meal.title} fill className="object-cover" sizes="260px" unoptimized />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Utensils size={24} style={{ color: iconColor }} />
                        </div>
                    )}
                    {/* Always dark gradient so overlaid text stays legible */}
                    <div style={{ position: "absolute", inset: 0, background: imgOverlay }} />
                </div>

                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: titleColor, margin: "0 0 4px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {meal.title}
                    </h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: descColor, margin: "0 0 16px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                        {meal.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: priceColor }}>
                            {formatNaira(meal.basePrice)}
                        </span>
                        <AddToCartButton onClick={() => onAdd(meal)} compact={true} />
                    </div>
                </div>
            </div>
        );
    }

    // Compact list card
    return (
        <div style={{ ...card, padding: "0.75rem", display: "flex", alignItems: "stretch", gap: "1.25rem" }}>
            <div style={{ width: "100px", height: "100px", borderRadius: "12px", overflow: "hidden", position: "relative", flexShrink: 0, backgroundColor: imgPlaceBg }}>
                {meal.image ? (
                    <Image src={meal.image} alt={meal.title} fill className="object-cover" sizes="100px" unoptimized />
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Utensils size={20} style={{ color: iconColor }} />
                    </div>
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: "0.25rem 0" }}>
                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "15px", color: titleColor, margin: "0 0 4px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {meal.title}
                </h4>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: descColor, margin: "0 0 12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                    {meal.description}
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: priceColor }}>
                        {formatNaira(meal.basePrice)}
                    </span>
                    <AddToCartButton onClick={() => onAdd(meal)} compact={compact} />
                </div>
            </div>
        </div>
    );
}
