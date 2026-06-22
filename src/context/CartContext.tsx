"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { CartItem, Meal, SelectedAddOn } from "@/types";

// ── Helpers ──────────────────────────────────────────────────

/** Format a naira amount for display */
export function formatNaira(amount: number): string {
    return `₦${amount.toLocaleString("en-NG")}`;
}

/** Compute the total price of a single cart line */
export function computeItemTotal(
    basePrice: number,
    addOns: SelectedAddOn[],
    quantity: number
): number {
    const addOnCost = addOns.reduce((sum, a) => sum + a.price * a.quantity, 0);
    return (basePrice + addOnCost) * quantity;
}

// ── Context type ──────────────────────────────────────────────
interface CartContextType {
    items: CartItem[];
    addItem: (meal: Meal, selectedAddOns: SelectedAddOn[]) => void;
    removeItem: (cartItemId: string) => void;
    updateQuantity: (cartItemId: string, quantity: number) => void;
    updateAddOns: (cartItemId: string, addOns: SelectedAddOn[]) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function CartProvider({
    children,
    userId,
}: {
    children: ReactNode;
    userId: string;
}) {
    const storageKey = `mama-onyinye-cart-${userId}`;
    const [items, setItems] = useState<CartItem[]>([]);
    const [hydrated, setHydrated] = useState(false);

    // Load from localStorage on mount (after hydration)
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) setItems(JSON.parse(stored));
        } catch {
            // ignore corrupt data
        }
        setHydrated(true);
    }, [storageKey]);

    // Persist whenever cart changes (after first hydration)
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(storageKey, JSON.stringify(items));
        } catch {
            // storage quota exceeded — fail silently
        }
    }, [items, storageKey, hydrated]);

    /** Add a meal (with chosen add-ons) as a new line in the cart */
    const addItem = useCallback((meal: Meal, selectedAddOns: SelectedAddOn[]) => {
        const cartItemId = crypto.randomUUID();
        const totalPrice = computeItemTotal(meal.basePrice, selectedAddOns, 1);

        setItems((prev) => [
            ...prev,
            {
                cartItemId,
                mealId: meal.id,
                mealTitle: meal.title,
                basePrice: meal.basePrice,
                image: meal.image,
                selectedAddOns,
                quantity: 1,
                totalPrice,
            },
        ]);
    }, []);

    const removeItem = useCallback((cartItemId: string) => {
        setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
    }, []);

    const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
        } else {
            setItems((prev) =>
                prev.map((i) =>
                    i.cartItemId === cartItemId
                        ? {
                              ...i,
                              quantity,
                              totalPrice: computeItemTotal(i.basePrice, i.selectedAddOns, quantity),
                          }
                        : i
                )
            );
        }
    }, []);

    const updateAddOns = useCallback((cartItemId: string, addOns: SelectedAddOn[]) => {
        setItems((prev) =>
            prev.map((i) =>
                i.cartItemId === cartItemId
                    ? {
                          ...i,
                          selectedAddOns: addOns,
                          totalPrice: computeItemTotal(i.basePrice, addOns, i.quantity),
                      }
                    : i
            )
        );
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.totalPrice, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                updateAddOns,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
