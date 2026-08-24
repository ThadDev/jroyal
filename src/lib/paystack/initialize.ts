// ============================================================
// Paystack – Server-side Transaction Initialization
// NEVER import or call this from client components.
// ============================================================

export interface PaystackInitializeParams {
    email: string;
    /** Amount in Kobo (Naira × 100) */
    amountKobo: number;
    reference: string;
    /** Customer's full name — passed as metadata */
    customerName: string;
    orderId: string;
}

export interface PaystackInitializeResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}

/**
 * Initializes a Paystack transaction using the secret key.
 * Returns the access_code needed to open the Inline popup on the frontend.
 *
 * @throws Error if Paystack API request fails
 */
export async function initializePaystackTransaction(
    params: PaystackInitializeParams
): Promise<PaystackInitializeResponse> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured");
    }

    const body = {
        email: params.email,
        amount: params.amountKobo,
        reference: params.reference,
        currency: "NGN",
        metadata: {
            customer_name: params.customerName,
            order_id: params.orderId,
            custom_fields: [
                {
                    display_name: "Order ID",
                    variable_name: "order_id",
                    value: params.orderId,
                },
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: params.customerName,
                },
            ],
        },
    };

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Paystack initialization failed (${response.status}): ${errorText}`);
    }

    const json = await response.json();

    if (!json.status) {
        throw new Error(`Paystack initialization error: ${json.message}`);
    }

    return json.data as PaystackInitializeResponse;
}
