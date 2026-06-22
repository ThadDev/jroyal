"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import type { Meal, AddOn } from "@/types";
import { MEALS } from "@/lib/data/meals";
import { ADDONS } from "@/lib/data/addons";

// ── Context type ──────────────────────────────────────────────
interface MealsContextType {
    meals: Meal[];
    addOns: AddOn[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const MealsContext = createContext<MealsContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────
/**
 * Provides meals and add-ons globally.
 * Currently uses seed data; replace the `fetchData` logic with
 * `fetch("/api/meals")` once the database tables are ready.
 */
export function MealsProvider({ children }: { children: ReactNode }) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [addOns, setAddOns] = useState<AddOn[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ── Seed data path (current) ──────────────────────
            // Replace with API calls once DB tables exist:
            //   const [mealsRes, addOnsRes] = await Promise.all([
            //     fetch("/api/meals"),
            //     fetch("/api/addons"),
            //   ]);
            //   setMeals(await mealsRes.json());
            //   setAddOns(await addOnsRes.json());
            setMeals(MEALS.filter((m) => m.available));
            setAddOns(ADDONS);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load menu data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <MealsContext.Provider value={{ meals, addOns, loading, error, refetch: fetchData }}>
            {children}
        </MealsContext.Provider>
    );
}

// ── Hook ──────────────────────────────────────────────────────
export function useMeals() {
    const ctx = useContext(MealsContext);
    if (!ctx) throw new Error("useMeals must be used within MealsProvider");
    return ctx;
}
