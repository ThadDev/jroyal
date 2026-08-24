"use client";
// ============================================================
// PaystackCheckout.tsx
// Handles the full Paystack Inline popup flow and all states:
//   idle → initializing → popup_open → verifying → success | failed | cancelled
// ============================================================
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    XCircle,
    Loader2,
    CreditCard,
    RefreshCw,
    AlertTriangle,
    Clock,
} from "lucide-react";
import Link from "next/link";
import type { CartItem } from "@/types";
import { formatNaira } from "@/context/CartContext";

// ── Paystack Inline JS type shim ─────────────────────────────
// v2: PaystackPop is a CLASS — you must call `new PaystackPop()` to get an instance.
declare global {
    interface Window {
        PaystackPop?: new () => {
            resumeTransaction: (
                accessCode: string,
                callbacks: {
                    onSuccess: (transaction: { reference: string; trans: string }) => void;
                    onCancel: () => void;
                }
            ) => void;
        };
    }
}

// ── Types ──────────────────────────────────────────────────────
type PaymentState =
    | "idle"
    | "initializing"
    | "popup_open"
    | "verifying"
    | "success"
    | "failed"
    | "cancelled";

interface PaystackCheckoutProps {
    items: CartItem[];
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    /** Called on successful verified payment — triggers cart clear */
    onSuccess: (orderId: string, reference: string) => void;
    disabled?: boolean;
}

// ── Shared style constants ─────────────────────────────────────
const glass = {
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
};

// ── Component ──────────────────────────────────────────────────
export default function PaystackCheckout({
    items,
    customerName,
    customerEmail,
    customerPhone,
    deliveryAddress,
    onSuccess,
    disabled = false,
}: PaystackCheckoutProps) {
    const router = useRouter();
    const [state, setState] = useState<PaymentState>("idle");
    const [error, setError] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [reference, setReference] = useState<string | null>(null);
    const [amountNaira, setAmountNaira] = useState<number | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Helper to ensure Paystack Inline JS v2 is loaded and window.PaystackPop constructor is ready
    const loadPaystackInlineScript = useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            const V2_SRC = "https://js.paystack.co/v2/inline.js";

            if (typeof window !== "undefined" && typeof window.PaystackPop === "function") {
                resolve(true);
                return;
            }

            let script = document.getElementById("paystack-inline-script") as HTMLScriptElement | null;

            if (!script) {
                script = document.createElement("script");
                script.id = "paystack-inline-script";
                script.src = V2_SRC;
                script.async = true;
                document.head.appendChild(script);
            }

            // Poll every 100ms for up to 5 seconds to catch script readiness cleanly
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof window !== "undefined" && typeof window.PaystackPop === "function") {
                    clearInterval(checkInterval);
                    resolve(true);
                } else if (attempts > 50) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 100);
        });
    }, []);

    // ── Load Paystack Inline v2 JS ───────────────────────────────
    useEffect(() => {
        let isMounted = true;
        loadPaystackInlineScript().then((ready) => {
            if (isMounted) {
                setScriptLoaded(ready);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [loadPaystackInlineScript]);

    // ── Step 3: Verify payment server-side ─────────────────────
    const verifyPayment = useCallback(
        async (ref: string, oId: string, attempt = 1) => {
            const MAX_ATTEMPTS = 5;
            const RETRY_DELAY_MS = 2000;

            try {
                const res = await fetch(`/api/payments/verify/${encodeURIComponent(ref)}`);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error ?? "Verification failed");
                }

                if (data.payment_status === "paid" && data.verified) {
                    setState("success");
                    onSuccess(oId, ref);
                    return;
                }

                // Not yet confirmed — retry (webhook may still be processing)
                if (attempt < MAX_ATTEMPTS) {
                    setTimeout(() => verifyPayment(ref, oId, attempt + 1), RETRY_DELAY_MS);
                } else {
                    // Max retries — webhook will still update the DB asynchronously
                    setState("verifying"); // Keep in "verifying" — webhook is source of truth
                }
            } catch (err) {
                const message = err instanceof Error ? err.message : "Verification error";
                setError(message);
                setState("failed");
            }
        },
        [onSuccess]
    );

    // ── Step 1: Initialize payment via our backend ─────────────
    const handlePayNow = useCallback(async () => {
        if (disabled || state !== "idle") return;

        setError(null);
        setState("initializing");

        try {
            const res = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    items,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    delivery_address: deliveryAddress,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to initialize payment");
            }

            const { access_code, reference: ref, order_id, amount_naira } = data;
            setOrderId(order_id);
            setReference(ref);
            setAmountNaira(amount_naira);

            // ── Step 2: Open Paystack popup ─────────────────────
            // Ensure PaystackPop constructor is ready (handles retries & fast clicks)
            const isSdkReady = await loadPaystackInlineScript();
            if (!isSdkReady || typeof window.PaystackPop !== "function") {
                throw new Error(
                    "Paystack SDK is taking longer than expected to load. Please try again in a moment."
                );
            }

            setState("popup_open");

            // v2: instantiate the class, then call resumeTransaction on the instance
            const popup = new window.PaystackPop();

            if (typeof popup.resumeTransaction !== "function") {
                throw new Error(
                    "Paystack SDK resumeTransaction is unavailable. Please refresh and try again."
                );
            }

            popup.resumeTransaction(access_code, {
                onSuccess: async () => {
                    // Popup fires onSuccess — verify server-side before trusting it
                    setState("verifying");
                    await verifyPayment(ref, order_id);
                },
                onCancel: () => {
                    // Customer closed the popup — order stays pending
                    setState("cancelled");
                },
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Payment initialization failed";
            setError(message);
            setState("idle");
        }
    }, [disabled, state, items, customerName, customerEmail, customerPhone, deliveryAddress, verifyPayment]);

    // ── Retry handler ───────────────────────────────────────────
    const handleRetry = () => {
        setError(null);
        setOrderId(null);
        setReference(null);
        setAmountNaira(null);
        setState("idle");
    };

    // ── UI ──────────────────────────────────────────────────────

    // Success state
    if (state === "success" && orderId) {
        return (
            <div
                style={{
                    ...glass,
                    padding: "3rem 2rem",
                    textAlign: "center",
                    border: "1px solid rgba(201,168,76,0.25)",
                }}
            >
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.25)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                    }}
                >
                    <CheckCircle2 size={40} style={{ color: "#22c55e" }} />
                </div>
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "26px",
                        color: "#F5F0E8",
                        margin: "0 0 0.75rem",
                    }}
                >
                    Payment Successful!
                </h2>
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                        margin: "0 0 0.5rem",
                    }}
                >
                    Your order has been confirmed and we're already preparing it.
                </p>
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "12px",
                        color: "rgba(201,168,76,0.7)",
                        margin: "0 0 2rem",
                        fontWeight: 600,
                    }}
                >
                    Order #{orderId.slice(0, 8).toUpperCase()}
                    {amountNaira && ` · ${formatNaira(amountNaira)}`}
                </p>
                <Link
                    href="/dashboard/orders"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "linear-gradient(135deg, #C9A84C, #9A7D2E)",
                        color: "#0A0A0A",
                        padding: "12px 28px",
                        borderRadius: "8px",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                    }}
                >
                    View My Orders
                </Link>
            </div>
        );
    }

    // Verifying state (polling)
    if (state === "verifying") {
        return (
            <div
                style={{
                    ...glass,
                    padding: "3rem 2rem",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(201,168,76,0.08)",
                        border: "1px solid rgba(201,168,76,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                    }}
                >
                    <Clock size={32} style={{ color: "#C9A84C" }} />
                </div>
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "22px",
                        color: "#F5F0E8",
                        margin: "0 0 0.75rem",
                    }}
                >
                    Confirming Payment…
                </h2>
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        margin: "0 0 1.5rem",
                        maxWidth: "320px",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                    Your payment is being confirmed with our server. This should take just a moment.
                    You may safely close this page — we'll update your order automatically.
                </p>
                <Loader2 size={24} style={{ color: "rgba(201,168,76,0.5)", animation: "spin 1s linear infinite" }} />
                {orderId && (
                    <p
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.25)",
                            margin: "1.25rem 0 0",
                        }}
                    >
                        Order #{orderId.slice(0, 8).toUpperCase()}
                    </p>
                )}
            </div>
        );
    }

    // Cancelled state
    if (state === "cancelled") {
        return (
            <div
                style={{
                    ...glass,
                    padding: "2.5rem 2rem",
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(234,179,8,0.08)",
                        border: "1px solid rgba(234,179,8,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.25rem",
                    }}
                >
                    <AlertTriangle size={28} style={{ color: "#eab308" }} />
                </div>
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "20px",
                        color: "#F5F0E8",
                        margin: "0 0 0.5rem",
                    }}
                >
                    Payment Cancelled
                </h2>
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        margin: "0 0 1.75rem",
                    }}
                >
                    You closed the payment window. Your order is saved — you can pay again whenever you're ready.
                </p>
                <button
                    onClick={handleRetry}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "linear-gradient(135deg, #C9A84C, #9A7D2E)",
                        color: "#0A0A0A",
                        border: "none",
                        padding: "11px 24px",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        cursor: "pointer",
                    }}
                >
                    <CreditCard size={15} /> Try Again
                </button>
            </div>
        );
    }

    // Failed state
    if (state === "failed") {
        return (
            <div
                style={{
                    ...glass,
                    padding: "2.5rem 2rem",
                    textAlign: "center",
                    border: "1px solid rgba(239,68,68,0.15)",
                }}
            >
                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.25rem",
                    }}
                >
                    <XCircle size={28} style={{ color: "#ef4444" }} />
                </div>
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "20px",
                        color: "#F5F0E8",
                        margin: "0 0 0.5rem",
                    }}
                >
                    Payment Failed
                </h2>
                {error && (
                    <p
                        style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "12px",
                            color: "rgba(239,68,68,0.7)",
                            margin: "0 0 0.75rem",
                            background: "rgba(239,68,68,0.05)",
                            border: "1px solid rgba(239,68,68,0.1)",
                            borderRadius: "6px",
                            padding: "0.5rem 0.875rem",
                        }}
                    >
                        {error}
                    </p>
                )}
                <p
                    style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.5)",
                        lineHeight: 1.6,
                        margin: "0 0 1.75rem",
                    }}
                >
                    Something went wrong. Your card was not charged. Please try again or use a different payment method.
                </p>
                <button
                    onClick={handleRetry}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "rgba(201,168,76,0.12)",
                        color: "#C9A84C",
                        border: "1px solid rgba(201,168,76,0.3)",
                        padding: "11px 24px",
                        borderRadius: "8px",
                        fontWeight: 700,
                        fontFamily: "Inter, sans-serif",
                        fontSize: "14px",
                        cursor: "pointer",
                    }}
                >
                    <RefreshCw size={15} /> Try Again
                </button>
            </div>
        );
    }

    // Idle / initializing — the Pay Now button
    const isLoading = state === "initializing" || state === "popup_open";

    return (
        <div>
            {error && (
                <div
                    style={{
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: "8px",
                        padding: "0.75rem 1rem",
                        marginBottom: "1rem",
                        fontFamily: "Inter, sans-serif",
                        fontSize: "13px",
                        color: "rgba(239,68,68,0.8)",
                    }}
                >
                    {error}
                </div>
            )}
            <button
                id="paystack-pay-now-btn"
                onClick={handlePayNow}
                disabled={disabled || isLoading || !scriptLoaded || items.length === 0}
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    width: "100%",
                    padding: "14px",
                    background:
                        disabled || !scriptLoaded || items.length === 0
                            ? "rgba(201,168,76,0.3)"
                            : "linear-gradient(135deg, #C9A84C, #9A7D2E)",
                    color: "#0A0A0A",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    cursor: disabled || isLoading || !scriptLoaded || items.length === 0
                        ? "not-allowed"
                        : "pointer",
                    opacity: disabled || !scriptLoaded ? 0.7 : 1,
                    transition: "opacity 0.2s",
                    marginTop: "1rem",
                }}
            >
                {isLoading ? (
                    <>
                        <Loader2 size={18} className="animate-spin" />
                        {state === "initializing" ? "Setting up payment…" : "Opening Paystack…"}
                    </>
                ) : (
                    <>
                        <CreditCard size={18} />
                        Pay Now
                    </>
                )}
            </button>
            <p
                style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.25)",
                    textAlign: "center",
                    margin: "0.75rem 0 0",
                }}
            >
                Secured by Paystack · Cards, Bank Transfer, USSD
            </p>
        </div>
    );
}
