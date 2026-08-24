"use client";
// ============================================================
// OrderClient.tsx – Checkout form + Paystack payment integration
// Replaces the old direct-Supabase-insert approach.
// The order is now created server-side via /api/payments/initialize
// so the amount is always validated server-side.
// ============================================================
import { useState, useEffect } from "react";
import { useCart, formatNaira } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, User } from "lucide-react";
import PaystackCheckout from "@/components/dashboard/PaystackCheckout";

// ── Shared style helpers ───────────────────────────────────────
const glass = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "2rem",
} as const;

const inputStyle = {
    width: "100%",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "12px 14px 12px 40px",
    color: "#fff",
    outline: "none",
    fontFamily: "Inter,sans-serif",
    fontSize: "14px",
} as const;

const labelStyle = {
    fontFamily: "Inter,sans-serif",
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
} as const;

// ── Component ──────────────────────────────────────────────────
export default function OrderClient() {
    const { items, totalPrice, clearCart, totalItems } = useCart();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const [formValid, setFormValid] = useState(false);

    // Prefill form from user profile
    useEffect(() => {
        const fetchProfile = async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, phone")
                    .eq("id", user.id)
                    .single();

                setFormData((prev) => ({
                    ...prev,
                    name: profile?.full_name || user.user_metadata?.full_name || "",
                    email: user.email || "",
                    phone: profile?.phone || "",
                }));
            }
        };
        fetchProfile();
    }, []);

    // Track form validity reactively
    useEffect(() => {
        const { name, email, phone, address } = formData;
        setFormValid(
            name.trim().length > 0 &&
                email.trim().length > 0 &&
                email.includes("@") &&
                phone.trim().length > 0 &&
                address.trim().length > 0
        );
    }, [formData]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Called by PaystackCheckout on confirmed payment
    const handlePaymentSuccess = (orderId: string, reference: string) => {
        clearCart();
        // PaystackCheckout handles the success UI — no redirect here
        // so the customer can see the confirmation without it flashing away.
        console.log(`[OrderClient] Payment confirmed — order ${orderId}, ref ${reference}`);
    };

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 5rem" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Back link */}
                <Link
                    href="/dashboard/cart"
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
                    <ArrowLeft size={14} /> Back to Cart
                </Link>

                <h1
                    style={{
                        fontFamily: "'Playfair Display',serif",
                        fontSize: "28px",
                        color: "#F5F0E8",
                        margin: "0 0 2rem",
                    }}
                >
                    Complete Your Order
                </h1>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                    {/* Delivery details form */}
                    <div style={glass}>
                        <h2
                            style={{
                                fontFamily: "'Playfair Display',serif",
                                fontSize: "18px",
                                color: "#F5F0E8",
                                margin: "0 0 1.5rem",
                                borderBottom: "1px solid rgba(255,255,255,0.1)",
                                paddingBottom: "1rem",
                            }}
                        >
                            Delivery Details
                        </h2>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.25rem",
                            }}
                        >
                            {/* Full Name */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={labelStyle}>Full Name</label>
                                <div style={{ position: "relative" }}>
                                    <User
                                        size={16}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            color: "rgba(255,255,255,0.3)",
                                        }}
                                    />
                                    <input
                                        id="order-name"
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Email + Phone */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "1.25rem",
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={labelStyle}>Email</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail
                                            size={16}
                                            style={{
                                                position: "absolute",
                                                left: "14px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "rgba(255,255,255,0.3)",
                                            }}
                                        />
                                        <input
                                            id="order-email"
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="john@example.com"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={labelStyle}>Phone Number</label>
                                    <div style={{ position: "relative" }}>
                                        <Phone
                                            size={16}
                                            style={{
                                                position: "absolute",
                                                left: "14px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "rgba(255,255,255,0.3)",
                                            }}
                                        />
                                        <input
                                            id="order-phone"
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="08012345678"
                                            style={inputStyle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={labelStyle}>Delivery Address</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin
                                        size={16}
                                        style={{
                                            position: "absolute",
                                            left: "14px",
                                            top: "14px",
                                            color: "rgba(255,255,255,0.3)",
                                        }}
                                    />
                                    <textarea
                                        id="order-address"
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter your full delivery address"
                                        rows={3}
                                        style={{ ...inputStyle, resize: "vertical" }}
                                    />
                                </div>
                            </div>

                            {/* Order summary */}
                            <div
                                style={{
                                    background: "rgba(0,0,0,0.3)",
                                    borderRadius: "12px",
                                    padding: "1.5rem",
                                    marginTop: "0.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                                        Items ({totalItems})
                                    </span>
                                    <span style={{ color: "#fff", fontSize: "14px" }}>
                                        {formatNaira(totalPrice)}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "1rem",
                                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                                        paddingBottom: "1rem",
                                    }}
                                >
                                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                                        Service Charge
                                    </span>
                                    <span style={{ color: "#fff", fontSize: "14px" }}>₦0</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#C9A84C", fontSize: "16px", fontWeight: 700 }}>
                                        Total
                                    </span>
                                    <span style={{ color: "#C9A84C", fontSize: "18px", fontWeight: 700 }}>
                                        {formatNaira(totalPrice)}
                                    </span>
                                </div>
                            </div>

                            {/* Form validation hint */}
                            {!formValid && (
                                <p
                                    style={{
                                        fontFamily: "Inter,sans-serif",
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.3)",
                                        margin: 0,
                                    }}
                                >
                                    Please fill in all delivery details before paying.
                                </p>
                            )}

                            {/* Paystack Checkout button + states */}
                            <PaystackCheckout
                                items={items}
                                customerName={formData.name}
                                customerEmail={formData.email}
                                customerPhone={formData.phone}
                                deliveryAddress={formData.address}
                                onSuccess={handlePaymentSuccess}
                                disabled={!formValid || items.length === 0}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
