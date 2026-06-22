"use client";
import { Plus } from "lucide-react";

interface AddToCartButtonProps {
    onClick: () => void;
    compact?: boolean;
}

/**
 * "Add to Cart" button.
 * Triggers the parent's onClick handler to open the global Add-Ons modal.
 */
export default function AddToCartButton({ onClick, compact = false }: AddToCartButtonProps) {
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
                background: "rgba(201,168,76,0.12)",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: "8px",
                color: "#C9A84C",
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
