// ============================================================
// Paystack – Server-side Transaction Verification
// NEVER import or call this from client components.
// ============================================================

export interface PaystackVerifyData {
    id: number;
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number; // in Kobo
    currency: string;
    paid_at: string;
    metadata: Record<string, unknown>;
    customer: {
        email: string;
    };
}

export interface PaystackVerifyResponse {
    verified: boolean;
    data: PaystackVerifyData | null;
    message: string;
}

/**
 * Verifies a Paystack transaction with the Paystack API using the secret key.
 *
 * Validates:
 *  - The transaction exists
 *  - The transaction status is 'success'
 *  - The currency is NGN
 *
 * The caller MUST additionally verify the amount matches the expected order total.
 *
 * @param reference - The payment reference to verify
 */
export async function verifyPaystackTransaction(
    reference: string
): Promise<PaystackVerifyResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        return { verified: false, data: null, message: "PAYSTACK_SECRET_KEY is not configured" };
    }

    // Sanitize reference to prevent path traversal
    const safeRef = encodeURIComponent(reference.trim());
    if (!safeRef) {
        return { verified: false, data: null, message: "Invalid reference" };
    }

    try {
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${safeRef}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            return {
                verified: false,
                data: null,
                message: `Paystack verify request failed (${response.status})`,
            };
        }

        const json = await response.json();

        if (!json.status || !json.data) {
            return { verified: false, data: null, message: json.message ?? "Verification failed" };
        }

        const txn: PaystackVerifyData = json.data;

        if (txn.status !== "success") {
            return {
                verified: false,
                data: txn,
                message: `Transaction status is '${txn.status}', not 'success'`,
            };
        }

        if (txn.currency !== "NGN") {
            return {
                verified: false,
                data: txn,
                message: `Unexpected currency: ${txn.currency}`,
            };
        }

        return { verified: true, data: txn, message: "Verified" };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return { verified: false, data: null, message };
    }
}
