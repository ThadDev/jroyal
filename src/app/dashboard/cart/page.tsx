"use client";
import { useCart, formatNaira } from "@/context/CartContext";
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

const glass = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
};

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 5rem" }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                {/* Back link */}
                <Link
                    href="/dashboard"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "rgba(255,255,255,0.4)",
                        textDecoration: "none",
                        fontFamily: "Inter,sans-serif",
                        fontSize: "13px",
                        marginBottom: "1.5rem",
                    }}
                >
                    <ArrowLeft size={14} /> Back to Menu
                </Link>

                {/* Header row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <ShoppingCart size={22} style={{ color: "#C9A84C" }} />
                        <h1
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: "26px",
                                color: "#F5F0E8",
                                margin: 0,
                            }}
                        >
                            Your Cart
                        </h1>
                        {totalItems > 0 && (
                            <span
                                style={{
                                    background: "#C9A84C",
                                    color: "#0A0A0A",
                                    borderRadius: "99px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    fontFamily: "Inter,sans-serif",
                                }}
                            >
                                {totalItems} {totalItems === 1 ? "item" : "items"}
                            </span>
                        )}
                    </div>
                    {items.length > 0 && (
                        <button
                            onClick={clearCart}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                background: "none",
                                border: "1px solid rgba(239,68,68,0.2)",
                                borderRadius: "8px",
                                padding: "0.375rem 0.75rem",
                                color: "rgba(239,68,68,0.6)",
                                fontSize: "12px",
                                fontFamily: "Inter,sans-serif",
                                cursor: "pointer",
                            }}
                        >
                            <Trash2 size={12} /> Clear All
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    /* ── Empty state ── */
                    <div style={{ ...glass, padding: "4rem 2rem", textAlign: "center" }}>
                        <PackageOpen
                            size={48}
                            style={{ color: "rgba(255,255,255,0.1)", margin: "0 auto 1rem" }}
                        />
                        <h2
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: "20px",
                                color: "rgba(255,255,255,0.3)",
                                margin: "0 0 0.5rem",
                            }}
                        >
                            Your cart is empty
                        </h2>
                        <p
                            style={{
                                fontFamily: "Inter,sans-serif",
                                fontSize: "13px",
                                color: "rgba(255,255,255,0.2)",
                                margin: "0 0 1.5rem",
                            }}
                        >
                            Add dishes from the menu to get started
                        </p>
                        <Link
                            href="/dashboard"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                padding: "0.625rem 1.25rem",
                                background: "rgba(201,168,76,0.12)",
                                border: "1px solid rgba(201,168,76,0.25)",
                                borderRadius: "8px",
                                color: "#C9A84C",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: 600,
                                fontFamily: "Inter,sans-serif",
                            }}
                        >
                            Browse Menu
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                        {/* ── Cart Items ── */}
                        <div style={{ ...glass, padding: "0.75rem 1.25rem" }}>
                            {items.map((item, i) => (
                                <div
                                    key={item.cartItemId}
                                    style={{
                                        padding: "1rem 0",
                                        borderBottom:
                                            i < items.length - 1
                                                ? "1px solid rgba(255,255,255,0.05)"
                                                : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "0.875rem",
                                        }}
                                    >
                                        {/* Thumbnail */}
                                        {item.image && (
                                            <div
                                                style={{
                                                    width: "52px",
                                                    height: "52px",
                                                    borderRadius: "8px",
                                                    overflow: "hidden",
                                                    position: "relative",
                                                    flexShrink: 0,
                                                    border: "1px solid rgba(255,255,255,0.06)",
                                                }}
                                            >
                                                <Image
                                                    src={item.image}
                                                    alt={item.mealTitle}
                                                    fill
                                                    className="object-cover"
                                                    sizes="52px"
                                                    unoptimized
                                                />
                                            </div>
                                        )}

                                        {/* Details */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3
                                                style={{
                                                    fontFamily: "'Playfair Display',serif",
                                                    fontSize: "14px",
                                                    color: "#F5F0E8",
                                                    margin: "0 0 4px",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item.mealTitle}
                                            </h3>

                                            {/* Add-ons breakdown */}
                                            {item.selectedAddOns.length > 0 && (
                                                <div style={{ marginBottom: "6px" }}>
                                                    {item.selectedAddOns.map((a) => (
                                                        <span
                                                            key={a.addOnId}
                                                            style={{
                                                                display: "inline-block",
                                                                background: "rgba(201,168,76,0.08)",
                                                                border: "1px solid rgba(201,168,76,0.2)",
                                                                borderRadius: "99px",
                                                                padding: "1px 7px",
                                                                fontSize: "10px",
                                                                color: "rgba(201,168,76,0.8)",
                                                                fontFamily: "Inter,sans-serif",
                                                                marginRight: "4px",
                                                                marginBottom: "3px",
                                                            }}
                                                        >
                                                            {a.quantity > 1 ? `${a.quantity}× ` : ""}
                                                            {a.name}
                                                            {a.price > 0 && ` +${formatNaira(a.price * a.quantity)}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Base price */}
                                            <p
                                                style={{
                                                    fontFamily: "Inter,sans-serif",
                                                    fontSize: "11px",
                                                    color: "rgba(255,255,255,0.35)",
                                                    margin: 0,
                                                }}
                                            >
                                                Base: {formatNaira(item.basePrice)}
                                            </p>
                                        </div>

                                        {/* Quantity + price + remove */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "flex-end",
                                                gap: "0.5rem",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {/* Line total */}
                                            <p
                                                style={{
                                                    fontFamily: "Inter,sans-serif",
                                                    fontSize: "15px",
                                                    fontWeight: 700,
                                                    color: "#C9A84C",
                                                    margin: 0,
                                                }}
                                            >
                                                {formatNaira(item.totalPrice)}
                                            </p>

                                            {/* Quantity controls */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.375rem",
                                                }}
                                            >
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.cartItemId, item.quantity - 1)
                                                    }
                                                    style={{
                                                        width: "26px",
                                                        height: "26px",
                                                        borderRadius: "50%",
                                                        background: "rgba(255,255,255,0.06)",
                                                        border: "1px solid rgba(255,255,255,0.1)",
                                                        color: "rgba(255,255,255,0.6)",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={11} />
                                                </button>
                                                <span
                                                    style={{
                                                        fontFamily: "Inter,sans-serif",
                                                        fontSize: "13px",
                                                        fontWeight: 600,
                                                        color: "#F5F0E8",
                                                        minWidth: "16px",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.cartItemId, item.quantity + 1)
                                                    }
                                                    style={{
                                                        width: "26px",
                                                        height: "26px",
                                                        borderRadius: "50%",
                                                        background: "rgba(201,168,76,0.1)",
                                                        border: "1px solid rgba(201,168,76,0.2)",
                                                        color: "#C9A84C",
                                                        cursor: "pointer",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={11} />
                                                </button>
                                            </div>

                                            {/* Remove */}
                                            <button
                                                onClick={() => removeItem(item.cartItemId)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "rgba(239,68,68,0.4)",
                                                    padding: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    fontFamily: "Inter,sans-serif",
                                                    fontSize: "10px",
                                                }}
                                                aria-label={`Remove ${item.mealTitle}`}
                                            >
                                                <Trash2 size={12} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Order Summary ── */}
                        <div style={{ ...glass, padding: "1.5rem" }}>
                            <h2
                                style={{
                                    fontFamily: "'Playfair Display',serif",
                                    fontSize: "18px",
                                    color: "#F5F0E8",
                                    margin: "0 0 1.25rem",
                                }}
                            >
                                Order Summary
                            </h2>

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span
                                        style={{
                                            fontFamily: "Inter,sans-serif",
                                            fontSize: "13px",
                                            color: "rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "Inter,sans-serif",
                                            fontSize: "13px",
                                            color: "#F5F0E8",
                                        }}
                                    >
                                        {formatNaira(totalPrice)}
                                    </span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span
                                        style={{
                                            fontFamily: "Inter,sans-serif",
                                            fontSize: "13px",
                                            color: "rgba(255,255,255,0.5)",
                                        }}
                                    >
                                        Service Charge
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "Inter,sans-serif",
                                            fontSize: "13px",
                                            color: "#F5F0E8",
                                        }}
                                    >
                                        ₦0
                                    </span>
                                </div>
                                <div
                                    style={{
                                        height: "1px",
                                        background: "rgba(255,255,255,0.06)",
                                        margin: "0.5rem 0",
                                    }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span
                                        style={{
                                            fontFamily: "'Playfair Display',serif",
                                            fontSize: "16px",
                                            color: "#F5F0E8",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Total
                                    </span>
                                    <span
                                        style={{
                                            fontFamily: "'Playfair Display',serif",
                                            fontSize: "18px",
                                            color: "#C9A84C",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {formatNaira(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Complete Order button */}
                            <div style={{ marginBottom: "0.75rem" }}>
                                <Link
                                    href="/dashboard/order"
                                    style={{
                                        width: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        padding: "0.875rem",
                                        background: "linear-gradient(135deg, #C9A84C, #9A7D2E)",
                                        borderRadius: "10px",
                                        border: "none",
                                        color: "#0A0A0A",
                                        fontFamily: "Inter,sans-serif",
                                        fontSize: "14px",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    <CreditCard size={16} />
                                    Complete Order
                                </Link>
                            </div>

                            <p
                                style={{
                                    fontFamily: "Inter,sans-serif",
                                    fontSize: "11px",
                                    color: "rgba(255,255,255,0.25)",
                                    textAlign: "center",
                                    margin: 0,
                                }}
                            >
                                Secure payment powered by Paystack. Your cart is saved locally.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
