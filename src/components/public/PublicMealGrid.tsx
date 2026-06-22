"use client";
import type { Meal } from "@/types";
import MealCard from "@/components/dashboard/MealCard";
import { useRouter } from "next/navigation";

export default function PublicMealGrid({ meals }: { meals: Meal[] }) {
    const router = useRouter();

    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {meals.map((meal) => (
                <MealCard
                    key={meal.id}
                    meal={meal}
                    compact
                    onAdd={() => router.push("/auth/login")}
                />
            ))}
        </div>
    );
}
