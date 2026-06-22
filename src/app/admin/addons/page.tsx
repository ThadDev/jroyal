"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Save, X, Layers } from "lucide-react";
import type { AddOn, AddOnCategory } from "@/types";
import { ADDON_CATEGORY_LABELS } from "@/types";
import { ADDONS } from "@/lib/data/addons";
import { formatNaira } from "@/context/CartContext";

const ADDON_CATEGORIES: AddOnCategory[] = ["proteins", "swallows", "extras"];

const emptyAddon = (): Omit<AddOn, "id"> => ({
    name: "",
    price: 0,
    category: "proteins",
});

// ── Form component ────────────────────────────────────────────
interface AddOnFormProps {
    initial: Omit<AddOn, "id">;
    onSave: (data: Omit<AddOn, "id">) => void;
    onCancel: () => void;
    title?: string;
}

function AddOnForm({ initial, onSave, onCancel, title = "New Add-On" }: AddOnFormProps) {
    const [form, setForm] = useState(initial);
    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    const inputStyle = {
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "0.5rem 0.75rem",
        color: "#F5F0E8",
        fontFamily: "Inter,sans-serif",
        fontSize: "13px",
        outline: "none",
    };
    const labelStyle = {
        display: "block",
        fontFamily: "Inter,sans-serif",
        fontSize: "11px",
        color: "rgba(255,255,255,0.5)",
        marginBottom: "4px",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
    };

    return (
        <tr>
            <td colSpan={4} style={{ padding: "0.5rem 0" }}>
                <div className="bg-charcoal border border-gold-700/20 p-4 mb-2">
                    <h4 className="text-sm font-medium text-white/70 mb-3">{title}</h4>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div>
                            <label style={labelStyle}>Name *</label>
                            <input style={{ ...inputStyle, width: "180px" }} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Chicken Lap" />
                        </div>
                        <div>
                            <label style={labelStyle}>Price (₦)</label>
                            <input style={{ ...inputStyle, width: "110px" }} type="number" min={0} value={form.price} onChange={(e) => set("price", parseInt(e.target.value) || 0)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Category *</label>
                            <select style={{ ...inputStyle, width: "130px" }} value={form.category} onChange={(e) => set("category", e.target.value as AddOnCategory)}>
                                {ADDON_CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{ADDON_CATEGORY_LABELS[c]}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => onSave(form)} disabled={!form.name} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 1rem", background: "linear-gradient(135deg,#C9A84C,#9A7D2E)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontFamily: "Inter,sans-serif", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                                <Save size={13} /> Save
                            </button>
                            <button onClick={onCancel} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "0.5rem 0.75rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", fontFamily: "Inter,sans-serif", fontSize: "12px", cursor: "pointer" }}>
                                <X size={13} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminAddOnsPage() {
    const [addOns, setAddOns] = useState<AddOn[]>(ADDONS.map((a) => ({ ...a })));
    const [editing, setEditing] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);

    const handleAdd = (data: Omit<AddOn, "id">) => {
        setAddOns((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
        setAdding(false);
    };

    const handleEdit = (id: string, data: Omit<AddOn, "id">) => {
        setAddOns((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this add-on?")) return;
        setAddOns((prev) => prev.filter((a) => a.id !== id));
    };

    // Group by category for display
    const grouped = ADDON_CATEGORIES.map((cat) => ({
        cat,
        items: addOns.filter((a) => a.category === cat),
    }));

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl text-white flex items-center gap-2">
                        <Layers size={22} className="text-gold-500" />
                        Add-Ons Management
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        {addOns.length} add-ons · Proteins / Swallows / Extras
                    </p>
                </div>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-obsidian bg-gold-500 hover:bg-gold-400 transition-colors"
                        id="admin-add-addon"
                    >
                        <Plus size={15} /> Add Add-On
                    </button>
                )}
            </div>

            {/* Category sections */}
            {grouped.map(({ cat, items }) => (
                <div key={cat} className="mb-8">
                    <div className="flex items-center gap-4 mb-3">
                        <h2 className="font-serif text-base text-gold-400">{ADDON_CATEGORY_LABELS[cat]}</h2>
                        <div className="h-px flex-1 bg-gold-700/20" />
                        <span className="text-white/30 text-xs font-mono">{items.length} items</span>
                    </div>

                    <div className="bg-charcoal border border-white/5 overflow-x-auto">
                        <table className="w-full admin-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Add-on rows */}
                                {items.map((addon) => (
                                    <>
                                        <tr key={addon.id}>
                                            <td className="font-medium text-white/80">{addon.name}</td>
                                            <td>
                                                <span className={addon.price === 0 ? "text-green-400 text-xs" : ""}>
                                                    {addon.price === 0 ? "Free" : `+${formatNaira(addon.price)}`}
                                                </span>
                                            </td>
                                            <td className="text-white/50 text-xs capitalize">{ADDON_CATEGORY_LABELS[addon.category]}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => setEditing(addon.id)} className="p-1.5 text-gold-600 hover:text-gold-400 transition-colors" title="Edit">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(addon.id)} className="p-1.5 text-red-500/50 hover:text-red-400 transition-colors" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {editing === addon.id && (
                                            <AddOnForm
                                                key={`${addon.id}-edit`}
                                                initial={{ name: addon.name, price: addon.price, category: addon.category }}
                                                onSave={(data) => handleEdit(addon.id, data)}
                                                onCancel={() => setEditing(null)}
                                                title={`Edit: ${addon.name}`}
                                            />
                                        )}
                                    </>
                                ))}

                                {/* Inline "Add" form at end of this category's section */}
                                {adding && (
                                    <AddOnForm
                                        initial={emptyAddon()}
                                        onSave={handleAdd}
                                        onCancel={() => setAdding(false)}
                                    />
                                )}

                                {items.length === 0 && !adding && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-white/25 py-4 text-xs">
                                            No {ADDON_CATEGORY_LABELS[cat].toLowerCase()} yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}
