// ============================================================
// Paystack – Webhook HMAC-SHA512 Signature Verification
// NEVER import or call this from client components.
// ============================================================
import { createHmac } from "crypto";

/**
 * Verifies that a Paystack webhook request is authentic by comparing
 * the X-Paystack-Signature header against an HMAC-SHA512 hash of the
 * raw request body using the secret key.
 *
 * @param rawBody   - The raw (unparsed) request body as a string
 * @param signature - The value of the X-Paystack-Signature header
 * @returns true if the signature is valid
 */
export function verifyPaystackWebhookSignature(
    rawBody: string,
    signature: string
): boolean {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        console.error("[Paystack Webhook] PAYSTACK_SECRET_KEY is not set");
        return false;
    }

    if (!signature || typeof signature !== "string") {
        return false;
    }

    const expectedHash = createHmac("sha512", secretKey)
        .update(rawBody)
        .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    if (expectedHash.length !== signature.length) {
        return false;
    }

    let diff = 0;
    for (let i = 0; i < expectedHash.length; i++) {
        diff |= expectedHash.charCodeAt(i) ^ signature.charCodeAt(i);
    }

    return diff === 0;
}

// ── Paystack Webhook Event Types ──────────────────────────────

export interface PaystackWebhookEvent {
    event: string;
    data: {
        id: number;
        status: "success" | "failed" | "abandoned";
        reference: string;
        amount: number; // Kobo
        currency: string;
        paid_at: string;
        customer: {
            email: string;
            customer_code?: string;
        };
        metadata?: Record<string, unknown>;
    };
}
