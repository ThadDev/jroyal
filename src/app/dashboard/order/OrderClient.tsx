"use client";
import { useState, useEffect } from "react";
import { useCart, formatNaira } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Phone, Mail, User } from "lucide-react";

export default function OrderClient() {
    const { items, totalPrice, clearCart, totalItems } = useCart();
    const router = useRouter();
    const { showToast } = useToast();
    const supabase = createClient();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        // Fetch user profile to prefill form
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                
                setFormData({
                    name: profile?.full_name || user.user_metadata?.full_name || "",
                    email: user.email || "",
                    phone: profile?.phone || "",
                    address: "",
                });
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (items.length === 0) {
            showToast("Your cart is empty", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Insert into orders table
            const { error } = await supabase.from("orders").insert({
                user_id: user?.id,
                customer_name: formData.name,
                customer_email: formData.email,
                customer_phone: formData.phone,
                delivery_address: formData.address,
                status: "pending",
                total_amount: totalPrice,
                items: items, // Cart items array
            });

            if (error) {
                throw error;
            }

            // Trigger admin notification
            try {
                await fetch("/api/notifications/trigger", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: "New Order Received",
                        message: `${formData.name} placed an order for ${formatNaira(totalPrice)}.`,
                        type: "order",
                        url: `/admin/orders`,
                    }),
                });
            } catch (notifyErr) {
                console.error("Failed to trigger notification:", notifyErr);
            }

            clearCart();
            setIsSuccess(true);
            showToast("Order submitted successfully!", "success");
            
            // Redirect after a few seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);

        } catch (error: any) {
            console.error("Order submission error:", error);
            showToast(error.message || "Failed to submit order. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div style={{ paddingTop: "120px", minHeight: "100vh", padding: "120px 1.5rem 5rem", textAlign: "center" }}>
                <div style={{ maxWidth: "500px", margin: "0 auto", background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: "24px", padding: "3rem 2rem" }}>
                    <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "rgba(201,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                        <CheckCircle2 size={40} style={{ color: "#C9A84C" }} />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: "#F5F0E8", margin: "0 0 1rem" }}>
                        Order Received!
                    </h2>
                    <p style={{ fontFamily: "Inter,sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: "2rem" }}>
                        Thank you for your order. We are preparing it now and will deliver it to {formData.address} shortly.
                    </p>
                    <Link href="/dashboard" style={{ display: "inline-block", background: "linear-gradient(135deg, #C9A84C, #9A7D2E)", color: "#0A0A0A", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: 600, fontFamily: "Inter,sans-serif", fontSize: "14px" }}>
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: "80px", minHeight: "100vh", padding: "80px 1.5rem 5rem" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/dashboard/cart" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "Inter,sans-serif", fontSize: "13px", marginBottom: "1.5rem" }}>
                    <ArrowLeft size={14} /> Back to Cart
                </Link>

                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", color: "#F5F0E8", margin: "0 0 2rem" }}>
                    Complete Your Order
                </h1>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                    {/* Form Section */}
                    <div style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "2rem" }}>
                        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: "#F5F0E8", margin: "0 0 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                            Delivery Details
                        </h2>
                        
                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Full Name</label>
                                <div style={{ position: "relative" }}>
                                    <User size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                                    <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px 12px 40px", color: "#fff", outline: "none", fontFamily: "Inter,sans-serif", fontSize: "14px" }} />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Email</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                                        <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px 12px 40px", color: "#fff", outline: "none", fontFamily: "Inter,sans-serif", fontSize: "14px" }} />
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                    <label style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Phone Number</label>
                                    <div style={{ position: "relative" }}>
                                        <Phone size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} />
                                        <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="08012345678" style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px 12px 40px", color: "#fff", outline: "none", fontFamily: "Inter,sans-serif", fontSize: "14px" }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                <label style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>Delivery Address</label>
                                <div style={{ position: "relative" }}>
                                    <MapPin size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "rgba(255,255,255,0.3)" }} />
                                    <textarea required name="address" value={formData.address} onChange={handleChange} placeholder="Enter your full delivery address" rows={3} style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "12px 14px 12px 40px", color: "#fff", outline: "none", fontFamily: "Inter,sans-serif", fontSize: "14px", resize: "vertical" }} />
                                </div>
                            </div>

                            {/* Summary Box */}
                            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "1.5rem", marginTop: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Items ({totalItems})</span>
                                    <span style={{ color: "#fff", fontSize: "14px" }}>{formatNaira(totalPrice)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
                                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>Delivery</span>
                                    <span style={{ color: "#fff", fontSize: "14px" }}>TBD</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#C9A84C", fontSize: "16px", fontWeight: 700 }}>Total</span>
                                    <span style={{ color: "#C9A84C", fontSize: "18px", fontWeight: 700 }}>{formatNaira(totalPrice)}</span>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting || items.length === 0} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "14px", background: "linear-gradient(135deg, #C9A84C, #9A7D2E)", color: "#0A0A0A", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 700, fontFamily: "Inter,sans-serif", cursor: isSubmitting || items.length === 0 ? "not-allowed" : "pointer", opacity: isSubmitting || items.length === 0 ? 0.7 : 1, marginTop: "1rem" }}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Processing...
                                    </>
                                ) : (
                                    "Place Order"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
