"use client";

import { useState, useCallback, useEffect } from "react";
import { CreditCard, Loader2 } from "lucide-react";

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

interface ResumePaymentButtonProps {
    orderId: string;
}

export default function ResumePaymentButton({ orderId }: ResumePaymentButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadScript = useCallback((): Promise<boolean> => {
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
            let attempts = 0;
            const check = setInterval(() => {
                attempts++;
                if (typeof window !== "undefined" && typeof window.PaystackPop === "function") {
                    clearInterval(check);
                    resolve(true);
                } else if (attempts > 50) {
                    clearInterval(check);
                    resolve(false);
                }
            }, 100);
        });
    }, []);

    const handleResume = async () => {
        setLoading(true);
        setError(null);
        try {
            const ready = await loadScript();
            if (!ready || typeof window.PaystackPop !== "function") {
                throw new Error("Paystack SDK failed to load. Please refresh.");
            }

            const res = await fetch("/api/payments/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ order_id: orderId }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error ?? "Failed to initialize payment");
            }

            const { access_code, reference } = data;
            const popup = new window.PaystackPop();

            if (typeof popup.resumeTransaction !== "function") {
                throw new Error("Paystack resume transaction unavailable.");
            }

            popup.resumeTransaction(access_code, {
                onSuccess: async () => {
                    // Verify server side
                    await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`);
                    window.location.reload();
                },
                onCancel: () => {
                    setLoading(false);
                },
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Payment error";
            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <button
                onClick={handleResume}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 border border-gold-500/30 rounded-lg font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer"
            >
                {loading ? <Loader2 size={13} className="animate-spin" /> : <CreditCard size={13} />}
                {loading ? "Opening Paystack…" : "Pay Now"}
            </button>
            {error && <span className="text-[10px] text-red-400">{error}</span>}
        </div>
    );
}
