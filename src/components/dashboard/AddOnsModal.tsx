"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import type { Meal, AddOn, SelectedAddOn, AddOnCategory } from "@/types";
import { ADDON_CATEGORY_LABELS } from "@/types";
import { useCart, computeItemTotal, formatNaira } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

interface AddOnsModalProps {
    meal: Meal | null;
    addOns: AddOn[];
    onClose: () => void;
}

const CATEGORY_ORDER: AddOnCategory[] = ["proteins", "swallows", "extras"];

export default function AddOnsModal({ meal, addOns, onClose }: AddOnsModalProps) {
    const { addItem } = useCart();
    const { showToast } = useToast();
    const { theme } = useTheme();
    const L = theme === "light";

    const [savedMeal, setSavedMeal] = useState<Meal | null>(meal);
    useEffect(() => { if (meal) setSavedMeal(meal); }, [meal]);
    const activeMeal = meal || savedMeal;

    const [quantities, setQuantities] = useState<Record<string, number>>({});
    useEffect(() => { if (meal) setQuantities({}); }, [meal]);

    useEffect(() => {
        if (!meal) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [meal, onClose]);

    const setQty = useCallback((id: string, delta: number) => {
        setQuantities((prev) => {
            const next = Math.max(0, (prev[id] ?? 0) + delta);
            if (next === 0) { const { [id]: _, ...rest } = prev; return rest; }
            return { ...prev, [id]: next };
        });
    }, []);

    const grouped = CATEGORY_ORDER.reduce<Record<AddOnCategory, AddOn[]>>(
        (acc, cat) => { acc[cat] = addOns.filter((a) => a.category === cat); return acc; },
        { proteins: [], swallows: [], extras: [] }
    );

    if (!activeMeal) return null;

    const selectedAddOns: SelectedAddOn[] = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([addOnId, quantity]) => {
            const addon = addOns.find((a) => a.id === addOnId)!;
            return { addOnId, name: addon.name, price: addon.price, quantity };
        });

    const liveTotal = computeItemTotal(activeMeal.basePrice, selectedAddOns, 1);

    const handleConfirm = () => {
        addItem(activeMeal, selectedAddOns);
        showToast(`${activeMeal.title} added to cart!`, "success");
        onClose();
    };

    // ── Theme tokens ──────────────────────────────────────────────
    const modalBg = L ? "rgba(255,246,230,0.98)" : "rgba(10,10,18,0.98)";
    const modalBorder = L ? "1px solid rgba(171,35,48,0.18)" : "1px solid rgba(246,168,28,0.2)";
    const headerDivider = L ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)";
    const footerBg = L ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.3)";
    const footerBorder = L ? "1px solid rgba(0,0,0,0.08)" : "1px solid rgba(255,255,255,0.06)";
    const titleColor = L ? "#1A1A1A" : "#F5F0E8";
    const mutedColor = (a: number) => L ? `rgba(26,26,26,${a})` : `rgba(255,255,255,${a})`;
    const accent = L ? "#AB2330" : "#F6A81C";           // red on light, gold on dark
    const accentFaint = L ? "rgba(171,35,48,0.08)" : "rgba(246,168,28,0.08)";
    const accentBorder = L ? "rgba(171,35,48,0.22)" : "rgba(246,168,28,0.22)";
    const subtitleLabel = L ? "rgba(171,35,48,0.85)" : "rgba(246,168,28,0.9)";
    const dividerLine = L ? "rgba(171,35,48,0.15)" : "rgba(246,168,28,0.15)";
    const closeBg = L ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.4)";
    const closeBorder = L ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";
    const closeColor = L ? "rgba(26,26,26,0.7)" : "rgba(255,255,255,0.8)";
    const imgPlaceBg = L ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
    const rowBg = (sel: boolean) => sel ? accentFaint : (L ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)");
    const rowBorder = (sel: boolean) => `1px solid ${sel ? accentBorder : (L ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.06)")}`;

    return (
        <AnimatePresence>
            {meal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={onClose}
                        style={{ position: "fixed", inset: 0, zIndex: 99998, background: "rgba(0,0,0,0.68)", backdropFilter: "blur(4px)" }}
                    />

                    {/* Modal panel */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", pointerEvents: "none" }}
                    >
                        <div style={{ pointerEvents: "auto", width: "100%", maxWidth: "520px", maxHeight: "90vh", display: "flex", flexDirection: "column", background: modalBg, border: modalBorder, borderRadius: "20px", overflow: "hidden", boxShadow: L ? "0 24px 80px rgba(0,0,0,0.18)" : "0 24px 80px rgba(0,0,0,0.6)" }}>

                            {/* Header Image — overlay always dark for readability */}
                            {activeMeal.image && (
                                <div style={{ width: "100%", height: "160px", position: "relative", backgroundColor: imgPlaceBg, flexShrink: 0 }}>
                                    <Image src={activeMeal.image} alt={activeMeal.title} fill className="object-cover" unoptimized />
                                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)" }} />
                                </div>
                            )}

                            {/* Header Info */}
                            <div style={{ padding: activeMeal.image ? "0 1.5rem 1rem" : "1.25rem 1.5rem", borderBottom: headerDivider, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexShrink: 0, marginTop: activeMeal.image ? "-40px" : "0", position: "relative", zIndex: 2 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: subtitleLabel, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px", textShadow: activeMeal.image ? "0 2px 4px rgba(0,0,0,0.8)" : "none" }}>
                                        Customise Your Order
                                    </p>
                                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", color: activeMeal.image ? "#F5F0E8" : titleColor, margin: 0, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: activeMeal.image ? "0 2px 4px rgba(0,0,0,0.8)" : "none" }}>
                                        {activeMeal.title}
                                    </h2>
                                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: activeMeal.image ? "rgba(255,255,255,0.75)" : mutedColor(0.6), margin: "6px 0 0" }}>
                                        Base price: <span style={{ color: accent, fontWeight: 600 }}>{formatNaira(activeMeal.basePrice)}</span>
                                    </p>
                                </div>
                                <button onClick={onClose} style={{ width: "32px", height: "32px", borderRadius: "50%", background: closeBg, border: `1px solid ${closeBorder}`, color: closeColor, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, backdropFilter: "blur(4px)" }} aria-label="Close">
                                    <X size={15} />
                                </button>
                            </div>

                            {/* Add-Ons List (scrollable) */}
                            <div style={{ overflowY: "auto", flex: 1, padding: "1rem 1.5rem" }}>
                                {CATEGORY_ORDER.map((cat) => {
                                    const catItems = grouped[cat];
                                    if (!catItems.length) return null;
                                    return (
                                        <div key={cat} style={{ marginBottom: "1.5rem" }}>
                                            {/* Category heading */}
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
                                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: accent }}>
                                                    {ADDON_CATEGORY_LABELS[cat]}
                                                </span>
                                                <div style={{ flex: 1, height: "1px", background: dividerLine }} />
                                            </div>

                                            {/* Add-on rows */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                                {catItems.map((addon) => {
                                                    const qty = quantities[addon.id] ?? 0;
                                                    const isSelected = qty > 0;
                                                    return (
                                                        <div key={addon.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0.875rem", borderRadius: "10px", background: rowBg(isSelected), border: rowBorder(isSelected), transition: "all 0.18s ease" }}>
                                                            {/* Name + price */}
                                                            <div>
                                                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: isSelected ? titleColor : mutedColor(0.65), margin: 0 }}>
                                                                    {addon.name}
                                                                </p>
                                                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: addon.price === 0 ? "rgba(100,200,130,0.8)" : (L ? "rgba(171,35,48,0.70)" : "rgba(246,168,28,0.70)"), margin: "2px 0 0" }}>
                                                                    {addon.price === 0 ? "Free" : `+${formatNaira(addon.price)}`}
                                                                    {qty > 0 && addon.price > 0 && (
                                                                        <span style={{ color: accent, marginLeft: "4px" }}>= {formatNaira(addon.price * qty)}</span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* Quantity controls */}
                                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                                <button
                                                                    onClick={() => setQty(addon.id, -1)}
                                                                    disabled={qty === 0}
                                                                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: qty > 0 ? accentFaint : (L ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.04)"), border: `1px solid ${qty > 0 ? accentBorder : (L ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)")}`, color: qty > 0 ? accent : mutedColor(0.2), cursor: qty > 0 ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                                                                    aria-label={`Remove ${addon.name}`}
                                                                >
                                                                    <Minus size={11} />
                                                                </button>
                                                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: qty > 0 ? accent : mutedColor(0.25), minWidth: "18px", textAlign: "center" }}>
                                                                    {qty}
                                                                </span>
                                                                <button
                                                                    onClick={() => setQty(addon.id, +1)}
                                                                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: accentFaint, border: `1px solid ${accentBorder}`, color: accent, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                                                                    aria-label={`Add ${addon.name}`}
                                                                >
                                                                    <Plus size={11} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer: live total + confirm */}
                            <div style={{ padding: "1rem 1.5rem", borderTop: footerBorder, background: footerBg, flexShrink: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.875rem" }}>
                                    <div>
                                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: mutedColor(0.4), margin: 0 }}>Item Total</p>
                                        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: accent, margin: 0, lineHeight: 1.1 }}>
                                            {formatNaira(liveTotal)}
                                        </p>
                                    </div>
                                    {selectedAddOns.length > 0 && (
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: mutedColor(0.3), margin: 0 }}>
                                                {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? "s" : ""} selected
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleConfirm}
                                    style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", background: L ? "linear-gradient(135deg, #AB2330, #8A1A25)" : "linear-gradient(135deg, #F6A81C, #D48C10)", border: "none", borderRadius: "10px", color: "#fff", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s" }}
                                >
                                    <ShoppingCart size={16} />
                                    Add to Cart — {formatNaira(liveTotal)}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
