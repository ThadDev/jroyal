"use client";
import { Plus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface AddToCartButtonProps {
    onClick: () => void;
    compact?: boolean;
}

export default function AddToCartButton({ onClick, compact = false }: AddToCartButtonProps) {
    const { theme } = useTheme();
    const L = theme === "light";

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
            style={{
                display: "flex",
                alignItems: "center",
                gap: compact ? "0" : "0.375rem",
                padding: compact ? "0.4rem 0.5rem" : "0.5rem 0.875rem",
                background: L ? "rgba(171,35,48,0.10)" : "rgba(246,168,28,0.12)",
                border: L ? "1px solid rgba(171,35,48,0.25)" : "1px solid rgba(246,168,28,0.25)",
                borderRadius: "8px",
                color: L ? "#AB2330" : "#F6A81C",
                fontFamily: "Inter, sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                flexShrink: 0,
            }}
            aria-label="Add to cart"
        >
            <Plus size={compact ? 14 : 12} />
            {!compact && "Add"}
        </button>
    );
}
