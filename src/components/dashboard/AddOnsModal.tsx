"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import type { Meal, AddOn, SelectedAddOn, AddOnCategory } from "@/types";
import { ADDON_CATEGORY_LABELS } from "@/types";
import { useCart, computeItemTotal, formatNaira } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────
interface AddOnsModalProps {
    meal: Meal | null;
    addOns: AddOn[];
    onClose: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
const CATEGORY_ORDER: AddOnCategory[] = ["proteins", "swallows", "extras"];

// ── Component ──────────────────────────────────────────────────
export default function AddOnsModal({
    meal,
    addOns,
    onClose,
}: AddOnsModalProps) {
    const { addItem } = useCart();
    const { showToast } = useToast();

    // Retain the meal data during the exit animation even when `meal` prop becomes null
    const [savedMeal, setSavedMeal] = useState<Meal | null>(meal);
    useEffect(() => {
        if (meal) setSavedMeal(meal);
    }, [meal]);

    const activeMeal = meal || savedMeal;

    // Map of addOnId → quantity (0 means not selected)
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // Reset quantities when the modal opens for a new meal
    useEffect(() => {
        if (meal) setQuantities({});
    }, [meal]);

    // Close on Escape key
    useEffect(() => {
        if (!meal) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [meal, onClose]);

    const setQty = useCallback((id: string, delta: number) => {
        setQuantities((prev) => {
            const current = prev[id] ?? 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [id]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [id]: next };
        });
    }, []);

    // Group add-ons by category
    const grouped = CATEGORY_ORDER.reduce<Record<AddOnCategory, AddOn[]>>(
        (acc, cat) => {
            acc[cat] = addOns.filter((a) => a.category === cat);
            return acc;
        },
        { proteins: [], swallows: [], extras: [] }
    );

    // If there is no active meal at all (not even saved during exit), render nothing
    if (!activeMeal) return null;

    // Build SelectedAddOn array from current quantities
    const selectedAddOns: SelectedAddOn[] = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([addOnId, quantity]) => {
            const addon = addOns.find((a) => a.id === addOnId)!;
            return {
                addOnId,
                name: addon.name,
                price: addon.price,
                quantity,
            };
        });

    const liveTotal = computeItemTotal(activeMeal.basePrice, selectedAddOns, 1);

    const handleConfirm = () => {
        addItem(activeMeal, selectedAddOns);
        showToast(`${activeMeal.title} added to cart!`, "success");
        onClose();
    };

    return (
        <AnimatePresence>
            {meal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99998,
                            background: "rgba(0,0,0,0.72)",
                            backdropFilter: "blur(4px)",
                        }}
                    />

                    {/* Modal panel */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, y: 40, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                pointerEvents: "auto",
                                width: "100%",
                                maxWidth: "520px",
                                maxHeight: "90vh",
                                display: "flex",
                                flexDirection: "column",
                                background: "rgba(10,10,18,0.98)",
                                border: "1px solid rgba(201,168,76,0.2)",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)",
                            }}
                        >
                            {/* ── Header Image ── */}
                            {activeMeal.image && (
                                <div
                                    style={{
                                        width: "100%",
                                        height: "160px",
                                        position: "relative",
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        flexShrink: 0,
                                    }}
                                >
                                    <Image
                                        src={activeMeal.image}
                                        alt={activeMeal.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: "linear-gradient(to top, rgba(10,10,18,0.98) 0%, transparent 100%)",
                                        }}
                                    />
                                </div>
                            )}

                            {/* ── Header Info ── */}
                            <div
                                style={{
                                    padding: activeMeal.image ? "0 1.5rem 1rem" : "1.25rem 1.5rem",
                                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                                    display: "flex",
                                    alignItems: "flex-start",
                                    justifyContent: "space-between",
                                    gap: "1rem",
                                    flexShrink: 0,
                                    marginTop: activeMeal.image ? "-40px" : "0",
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: "10px",
                                            color: "rgba(201,168,76,0.9)",
                                            letterSpacing: "0.2em",
                                            textTransform: "uppercase",
                                            margin: "0 0 4px",
                                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                        }}
                                    >
                                        Customise Your Order
                                    </p>
                                    <h2
                                        style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: "24px",
                                            color: "#F5F0E8",
                                            margin: 0,
                                            fontWeight: 600,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                                        }}
                                    >
                                        {activeMeal.title}
                                    </h2>
                                    <p
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                            fontSize: "13px",
                                            color: "rgba(255,255,255,0.7)",
                                            margin: "6px 0 0",
                                        }}
                                    >
                                        Base price: <span style={{ color: "#C9A84C", fontWeight: 600 }}>{formatNaira(activeMeal.basePrice)}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        width: "32px",
                                        height: "32px",
                                        borderRadius: "50%",
                                        background: "rgba(0,0,0,0.4)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "rgba(255,255,255,0.8)",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        backdropFilter: "blur(4px)",
                                    }}
                                    aria-label="Close"
                                >
                                    <X size={15} />
                                </button>
                            </div>

                            {/* ── Add-Ons List (scrollable) ── */}
                            <div style={{ overflowY: "auto", flex: 1, padding: "1rem 1.5rem" }}>
                                {CATEGORY_ORDER.map((cat) => {
                                    const catItems = grouped[cat];
                                    if (!catItems.length) return null;
                                    return (
                                        <div key={cat} style={{ marginBottom: "1.5rem" }}>
                                            {/* Category heading */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.625rem",
                                                    marginBottom: "0.75rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontFamily: "Inter, sans-serif",
                                                        fontSize: "10px",
                                                        fontWeight: 700,
                                                        letterSpacing: "0.18em",
                                                        textTransform: "uppercase",
                                                        color: "#C9A84C",
                                                    }}
                                                >
                                                    {ADDON_CATEGORY_LABELS[cat]}
                                                </span>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        height: "1px",
                                                        background: "rgba(201,168,76,0.15)",
                                                    }}
                                                />
                                            </div>

                                            {/* Add-on rows */}
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                                {catItems.map((addon) => {
                                                    const qty = quantities[addon.id] ?? 0;
                                                    const isSelected = qty > 0;

                                                    return (
                                                        <div
                                                            key={addon.id}
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                padding: "0.625rem 0.875rem",
                                                                borderRadius: "10px",
                                                                background: isSelected
                                                                    ? "rgba(201,168,76,0.08)"
                                                                    : "rgba(255,255,255,0.03)",
                                                                border: `1px solid ${isSelected ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.06)"}`,
                                                                transition: "all 0.18s ease",
                                                            }}
                                                        >
                                                            {/* Name + price */}
                                                            <div>
                                                                <p
                                                                    style={{
                                                                        fontFamily: "Inter, sans-serif",
                                                                        fontSize: "13px",
                                                                        fontWeight: 500,
                                                                        color: isSelected ? "#F5F0E8" : "rgba(255,255,255,0.7)",
                                                                        margin: 0,
                                                                    }}
                                                                >
                                                                    {addon.name}
                                                                </p>
                                                                <p
                                                                    style={{
                                                                        fontFamily: "Inter, sans-serif",
                                                                        fontSize: "11px",
                                                                        color: addon.price === 0 ? "rgba(100,200,130,0.7)" : "rgba(201,168,76,0.7)",
                                                                        margin: "2px 0 0",
                                                                    }}
                                                                >
                                                                    {addon.price === 0 ? "Free" : `+${formatNaira(addon.price)}`}
                                                                    {qty > 0 && addon.price > 0 && (
                                                                        <span style={{ color: "#C9A84C", marginLeft: "4px" }}>
                                                                            = {formatNaira(addon.price * qty)}
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>

                                                            {/* Quantity controls */}
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.5rem",
                                                                }}
                                                            >
                                                                <button
                                                                    onClick={() => setQty(addon.id, -1)}
                                                                    disabled={qty === 0}
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        borderRadius: "50%",
                                                                        background: qty > 0 ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.04)",
                                                                        border: `1px solid ${qty > 0 ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.08)"}`,
                                                                        color: qty > 0 ? "#C9A84C" : "rgba(255,255,255,0.2)",
                                                                        cursor: qty > 0 ? "pointer" : "default",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        transition: "all 0.15s",
                                                                    }}
                                                                    aria-label={`Remove ${addon.name}`}
                                                                >
                                                                    <Minus size={11} />
                                                                </button>

                                                                <span
                                                                    style={{
                                                                        fontFamily: "Inter, sans-serif",
                                                                        fontSize: "13px",
                                                                        fontWeight: 700,
                                                                        color: qty > 0 ? "#C9A84C" : "rgba(255,255,255,0.25)",
                                                                        minWidth: "18px",
                                                                        textAlign: "center",
                                                                    }}
                                                                >
                                                                    {qty}
                                                                </span>

                                                                <button
                                                                    onClick={() => setQty(addon.id, +1)}
                                                                    style={{
                                                                        width: "28px",
                                                                        height: "28px",
                                                                        borderRadius: "50%",
                                                                        background: "rgba(201,168,76,0.12)",
                                                                        border: "1px solid rgba(201,168,76,0.3)",
                                                                        color: "#C9A84C",
                                                                        cursor: "pointer",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        transition: "all 0.15s",
                                                                    }}
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

                            {/* ── Footer: live total + confirm ── */}
                            <div
                                style={{
                                    padding: "1rem 1.5rem",
                                    borderTop: "1px solid rgba(255,255,255,0.06)",
                                    background: "rgba(0,0,0,0.3)",
                                    flexShrink: 0,
                                }}
                            >
                                {/* Price breakdown */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "0.875rem",
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                fontFamily: "Inter, sans-serif",
                                                fontSize: "11px",
                                                color: "rgba(255,255,255,0.4)",
                                                margin: 0,
                                            }}
                                        >
                                            Item Total
                                        </p>
                                        <p
                                            style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontSize: "22px",
                                                fontWeight: 700,
                                                color: "#C9A84C",
                                                margin: 0,
                                                lineHeight: 1.1,
                                            }}
                                        >
                                            {formatNaira(liveTotal)}
                                        </p>
                                    </div>
                                    {selectedAddOns.length > 0 && (
                                        <div style={{ textAlign: "right" }}>
                                            <p
                                                style={{
                                                    fontFamily: "Inter, sans-serif",
                                                    fontSize: "10px",
                                                    color: "rgba(255,255,255,0.3)",
                                                    margin: 0,
                                                }}
                                            >
                                                {selectedAddOns.length} add-on{selectedAddOns.length > 1 ? "s" : ""} selected
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Add to cart button */}
                                <button
                                    onClick={handleConfirm}
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        padding: "0.875rem",
                                        background: "linear-gradient(135deg, #C9A84C, #9A7D2E)",
                                        border: "none",
                                        borderRadius: "10px",
                                        color: "#0A0A0A",
                                        fontFamily: "Inter, sans-serif",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "opacity 0.2s",
                                    }}
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
