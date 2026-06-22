import type { AddOn } from "@/types";

/**
 * Canonical add-on seed data.
 * Admin-managed in production; served from seed during dev.
 * Prices are whole numbers in Naira.
 */
export const ADDONS: AddOn[] = [
    // ── Proteins ─────────────────────────────────────────────
    { id: "addon-prot-001", name: "Beef",                  price: 500,  category: "proteins" },
    { id: "addon-prot-002", name: "Goat Meat",             price: 600,  category: "proteins" },
    { id: "addon-prot-003", name: "Kodo",                  price: 500,  category: "proteins" },
    { id: "addon-prot-004", name: "Gizzard",               price: 500,  category: "proteins" },
    { id: "addon-prot-005", name: "Boiled Egg",            price: 300,  category: "proteins" },
    { id: "addon-prot-006", name: "Chicken Breast/Wing",   price: 2500, category: "proteins" },
    { id: "addon-prot-007", name: "Chicken Lap",           price: 4000, category: "proteins" },
    { id: "addon-prot-008", name: "Ice Fish Centre",       price: 1400, category: "proteins" },
    { id: "addon-prot-009", name: "Ice Fish Tail",         price: 2500, category: "proteins" },
    { id: "addon-prot-010", name: "Turkey Wings",          price: 5000, category: "proteins" },

    // ── Swallows ─────────────────────────────────────────────
    { id: "addon-swal-001", name: "Eba",                   price: 0,    category: "swallows" },
    { id: "addon-swal-002", name: "Fufu",                  price: 0,    category: "swallows" },
    { id: "addon-swal-003", name: "Semo",                  price: 0,    category: "swallows" },

    // ── Extras ───────────────────────────────────────────────
    { id: "addon-extr-001", name: "Salad",                 price: 500,  category: "extras" },
];
