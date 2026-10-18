"use client";
import { useCart, formatNaira } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    CreditCard,
    PackageOpen,
} from "lucide-react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
    const { theme } = useTheme();
    const L = theme === "light";

    const glass: React.CSSProperties = {
        background: L ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: L ? "1px solid rgba(0,0,0,0.10)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
    };

    const T = (a: number) => L ? `rgba(26,26,26,${a})` : `rgba(255,255,255,${a})`;
    const primary = L ? "#1A1A1A" : "#F5F0E8";
    const gold = "#F6A81C";
    const divider = L ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.05)";

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 5rem" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                {/* Back link */}
                <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: T(0.45), textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
                    <ArrowLeft size={14} /> Back to Menu
                </Link>

                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <ShoppingCart size={22} style={{ color: gold }} />
                        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "26px", color: primary, margin: 0 }}>
                            Your Cart
                        </h1>
                        {totalItems > 0 && (
                            <span style={{ background: gold, color: "#0A0A0A", borderRadius: "99px", fontSize: "11px", fontWeight: 700, padding: "2px 8px", fontFamily: "Inter,sans-serif" }}>
                                {totalItems} {totalItems === 1 ? "item" : "items"}
                            </span>
                        )}
                    </div>
                    {items.length > 0 && (
                        <button onClick={clearCart} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", padding: "0.375rem 0.75rem", color: "rgba(239,68,68,0.7)", fontSize: "12px", fontFamily: "Inter,sans-serif", cursor: "pointer" }}>
                            <Trash2 size={12} /> Clear All
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div style={{ ...glass, padding: "4rem 2rem", textAlign: "center" }}>
                        <PackageOpen size={48} style={{ color: T(0.15), margin: "0 auto 1rem" }} />
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: T(0.35), margin: "0 0 0.5rem" }}>
                            Your cart is empty
                        </h2>
                        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: T(0.25), margin: "0 0 1.5rem" }}>
                            Add dishes from the menu to get started
                        </p>
                        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", background: L ? "rgba(246,168,28,0.12)" : "rgba(246,168,28,0.10)", border: "1px solid rgba(246,168,28,0.25)", borderRadius: "8px", color: L ? "#1A1A1A" : gold, textDecoration: "none", fontSize: "13px", fontWeight: 600, fontFamily: "Inter,sans-serif" }}>
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                        {/* Cart Items */}
                        <div style={{ ...glass, padding: "0.75rem 1.25rem" }}>
                            {items.map((item, i) => (
                                <div key={item.cartItemId} style={{ padding: "1rem 0", borderBottom: i < items.length - 1 ? `1px solid ${divider}` : "none" }}>
                                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                                        {/* Thumbnail */}
                                        {item.image && (
                                            <div style={{ width: "52px", height: "52px", borderRadius: "8px", overflow: "hidden", position: "relative", flexShrink: 0, border: `1px solid ${divider}` }}>
                                                <Image src={item.image} alt={item.mealTitle} fill className="object-cover" sizes="52px" unoptimized />
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", color: primary, margin: "0 0 4px", fontWeight: 600 }}>
                                                {item.mealTitle}
                                            </h3>
                                            {item.selectedAddOns.length > 0 && (
                                                <div style={{ marginBottom: "6px" }}>
                                                    {item.selectedAddOns.map((a) => (
                                                        <span key={a.addOnId} style={{ display: "inline-block", background: "rgba(246,168,28,0.10)", border: "1px solid rgba(246,168,28,0.20)", borderRadius: "99px", padding: "1px 7px", fontSize: "10px", color: L ? "#7A5A00" : "rgba(246,168,28,0.85)", fontFamily: "Inter,sans-serif", marginRight: "4px", marginBottom: "3px" }}>
                                                            {a.quantity > 1 ? `${a.quantity}× ` : ""}{a.name}{a.price > 0 && ` +${formatNaira(a.price * a.quantity)}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: T(0.38), margin: 0 }}>
                                                Base: {formatNaira(item.basePrice)}
                                            </p>
                                        </div>

                                        {/* Qty + price + remove */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem", flexShrink: 0 }}>
                                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "15px", fontWeight: 700, color: L ? "#1A1A1A" : gold, margin: 0 }}>
                                                {formatNaira(item.totalPrice)}
                                            </p>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", background: L ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", border: `1px solid ${divider}`, color: T(0.6), cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease quantity">
                                                    <Minus size={11} />
                                                </button>
                                                <span style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 600, color: primary, minWidth: "16px", textAlign: "center" }}>
                                                    {item.quantity}
                                                </span>
                                                <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(246,168,28,0.12)", border: "1px solid rgba(246,168,28,0.22)", color: L ? "#7A5A00" : gold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase quantity">
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                            <button onClick={() => removeItem(item.cartItemId)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(239,68,68,0.55)", padding: "4px", display: "flex", alignItems: "center", gap: "4px", fontFamily: "Inter,sans-serif", fontSize: "10px" }} aria-label={`Remove ${item.mealTitle}`}>
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div style={{ ...glass, padding: "1.5rem" }}>
                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: primary, margin: "0 0 1.25rem" }}>
                                Order Summary
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: T(0.5) }}>
                                        Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                                    </span>
                                    <span style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: primary }}>{formatNaira(totalPrice)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: T(0.5) }}>Service Charge</span>
                                    <span style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: primary }}>₦0</span>
                                </div>
                                <div style={{ height: "1px", background: divider, margin: "0.5rem 0" }} />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", color: primary, fontWeight: 600 }}>Total</span>
                                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: L ? "#1A1A1A" : gold, fontWeight: 700 }}>
                                        {formatNaira(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: "0.75rem" }}>
                                <Link href="/dashboard/order" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", background: "linear-gradient(135deg, #F6A81C, #D48C10)", borderRadius: "10px", border: "none", color: "#0A0A0A", fontFamily: "Inter,sans-serif", fontSize: "14px", fontWeight: 700, textDecoration: "none", cursor: "pointer" }}>
                                    <CreditCard size={16} /> Complete Order
                                </Link>
                            </div>

                            <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: T(0.30), textAlign: "center", margin: 0 }}>
                                Secure payment powered by Paystack. Your cart is saved locally.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
