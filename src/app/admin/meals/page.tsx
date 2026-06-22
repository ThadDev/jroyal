"use client";
import { useState } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ChefHat, Search, UploadCloud } from "lucide-react";
import type { Meal, MealCategory } from "@/types";
import { MEAL_CATEGORY_LABELS } from "@/types";
import { MEALS, MEAL_CATEGORIES } from "@/lib/data/meals";
import { formatNaira } from "@/context/CartContext";
import { createClient } from "@/lib/supabase/client";

// ── Empty form state ──────────────────────────────────────────
const emptyMeal = (): Omit<Meal, "id" | "createdAt" | "updatedAt"> => ({
    title: "",
    description: "",
    basePrice: 0,
    image: "",
    category: "main_course",
    available: true,
});

// ── Form component ────────────────────────────────────────────
interface MealFormProps {
    initial: Omit<Meal, "id" | "createdAt" | "updatedAt">;
    onSave: (data: Omit<Meal, "id" | "createdAt" | "updatedAt">) => void;
    onCancel: () => void;
}

function MealForm({ initial, onSave, onCancel }: MealFormProps) {
    const [form, setForm] = useState(initial);
    const [uploading, setUploading] = useState(false);

    const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
        setForm((p) => ({ ...p, [k]: v }));

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const supabase = createClient();
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("meal-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("meal-images").getPublicUrl(filePath);
            set("image", data.publicUrl);
        } catch (err: any) {
            alert(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const inputStyle = {
        width: "100%",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-charcoal border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative">
                <button onClick={onCancel} className="absolute top-4 right-4 text-white/40 hover:text-white p-1">
                    <X size={18} />
                </button>
                <h3 className="font-serif text-lg text-white mb-6">
                    {initial.title ? `Edit: ${initial.title}` : "New Meal"}
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Title *</label>
                        <input style={inputStyle} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Jollof Rice (Party Style)" />
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Description</label>
                        <textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description of the dish" />
                    </div>
                    <div>
                        <label style={labelStyle}>Base Price (₦) *</label>
                        <input style={inputStyle} type="number" min={0} value={form.basePrice} onChange={(e) => set("basePrice", parseInt(e.target.value) || 0)} />
                    </div>
                    <div>
                        <label style={labelStyle}>Category *</label>
                        <select style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value as MealCategory)}>
                            {MEAL_CATEGORIES.map((c) => (
                                <option key={c} value={c}>{MEAL_CATEGORY_LABELS[c]}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ gridColumn: "1/-1" }}>
                        <label style={labelStyle}>Image Upload</label>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <label
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                    padding: "0.5rem 1rem", background: "rgba(255,255,255,0.05)",
                                    border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "6px",
                                    color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: "12px", fontFamily: "Inter,sans-serif"
                                }}
                            >
                                <UploadCloud size={14} />
                                {uploading ? "Uploading..." : "Choose Image"}
                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploading} />
                            </label>
                            {form.image && (
                                <span style={{ fontSize: "11px", color: "rgba(34,197,94,0.8)" }}>Image selected</span>
                            )}
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", gridColumn: "1/-1", marginTop: "4px" }}>
                        <input type="checkbox" id="meal-available" checked={form.available} onChange={(e) => set("available", e.target.checked)} style={{ accentColor: "#C9A84C" }} />
                        <label htmlFor="meal-available" style={{ ...labelStyle, margin: 0 }}>Available on menu</label>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
                    <button
                        onClick={() => onSave(form)}
                        disabled={!form.title || form.basePrice < 0}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0.625rem", background: "linear-gradient(135deg,#C9A84C,#9A7D2E)", border: "none", borderRadius: "6px", color: "#0A0A0A", fontFamily: "Inter,sans-serif", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                    >
                        <Save size={14} /> Save Meal
                    </button>
                    <button onClick={onCancel} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", padding: "0.625rem", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "rgba(255,255,255,0.5)", fontFamily: "Inter,sans-serif", fontSize: "13px", cursor: "pointer" }}>
                        <X size={14} /> Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminMealsPage() {
    const [meals, setMeals] = useState<Meal[]>(
        MEALS.map((m) => ({ ...m }))
    );
    const [editing, setEditing] = useState<string | null>(null);
    const [adding, setAdding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCategory, setFilterCategory] = useState<MealCategory | "all">("all");

    const handleAdd = (data: Omit<Meal, "id" | "createdAt" | "updatedAt">) => {
        const now = new Date().toISOString();
        setMeals((prev) => [
            ...prev,
            { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now },
        ]);
        setAdding(false);
    };

    const handleEdit = (id: string, data: Omit<Meal, "id" | "createdAt" | "updatedAt">) => {
        setMeals((prev) =>
            prev.map((m) =>
                m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
            )
        );
        setEditing(null);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this meal? This cannot be undone.")) return;
        setMeals((prev) => prev.filter((m) => m.id !== id));
    };

    const toggleAvailable = (id: string) => {
        setMeals((prev) =>
            prev.map((m) => (m.id === id ? { ...m, available: !m.available } : m))
        );
    };

    const filteredMeals = meals.filter((m) => {
        const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = filterCategory === "all" || m.category === filterCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl md:text-3xl text-white flex items-center gap-3 font-bold">
                        <ChefHat size={28} className="text-gold-500" />
                        Meal Management
                    </h1>
                    <p className="text-white/40 text-sm mt-1">{filteredMeals.length} meals found</p>
                </div>
                {!adding && (
                    <button
                        onClick={() => setAdding(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-obsidian bg-gold-500 hover:bg-gold-400 transition-all active:scale-95 w-full sm:w-auto rounded-xl"
                        id="admin-add-meal"
                    >
                        <Plus size={18} /> Add New Meal
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search dishes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as MealCategory | "all")}
                    className="bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-gold-500/50 min-w-[200px]"
                >
                    <option value="all">All Categories</option>
                    {MEAL_CATEGORIES.map(c => (
                        <option key={c} value={c}>{MEAL_CATEGORY_LABELS[c]}</option>
                    ))}
                </select>
            </div>

            {/* Add form */}
            {adding && (
                <MealForm initial={emptyMeal()} onSave={handleAdd} onCancel={() => setAdding(false)} />
            )}

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-charcoal border border-white/5 overflow-hidden rounded-xl">
                <table className="w-full admin-table">
                    <thead>
                        <tr className="bg-white/[0.02]">
                            <th>Title</th>
                            <th>Category</th>
                            <th>Base Price</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMeals.map((meal) => (
                            <tr key={meal.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="font-medium text-white/80">{meal.title}</td>
                                <td className="text-white/50 text-xs capitalize">{MEAL_CATEGORY_LABELS[meal.category]}</td>
                                <td className="font-bold text-gold-400">{formatNaira(meal.basePrice)}</td>
                                <td>
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded-full ${meal.available ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                                        {meal.available ? "Available" : "Hidden"}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => toggleAvailable(meal.id)} className="p-2 text-white/40 hover:text-white transition-colors" title={meal.available ? "Hide from menu" : "Show on menu"}>
                                            {meal.available ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => setEditing(meal.id)} className="p-2 text-gold-500 hover:text-gold-400 transition-colors" title="Edit">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(meal.id)} className="p-2 text-red-500/50 hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {filteredMeals.map((meal) => (
                    <div key={meal.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex-1 pr-4">
                                <h3 className="text-white font-bold text-lg leading-tight mb-1">{meal.title}</h3>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{MEAL_CATEGORY_LABELS[meal.category]}</p>
                            </div>
                            <span className={`flex-shrink-0 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest border rounded-full ${meal.available ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                                {meal.available ? "Active" : "Hidden"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                            <span className="text-gold-400 font-black text-lg">{formatNaira(meal.basePrice)}</span>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => toggleAvailable(meal.id)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white transition-all"
                                >
                                    {meal.available ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                <button 
                                    onClick={() => setEditing(meal.id)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-all"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(meal.id)} 
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredMeals.length === 0 && (
                <div className="text-center text-white/30 py-20 bg-white/5 border border-white/10 rounded-2xl">
                    <ChefHat size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-lg font-serif">No meals found matching your search.</p>
                </div>
            )}

            {/* Edit form modal */}
            {editing && (() => {
                const mealToEdit = meals.find(m => m.id === editing);
                if (!mealToEdit) return null;
                return (
                    <MealForm
                        initial={{ 
                            title: mealToEdit.title, 
                            description: mealToEdit.description, 
                            basePrice: mealToEdit.basePrice, 
                            image: mealToEdit.image, 
                            category: mealToEdit.category, 
                            available: mealToEdit.available 
                        }}
                        onSave={(data) => mealToEdit && handleEdit(mealToEdit.id, data)}
                        onCancel={() => setEditing(null)}
                    />
                );
            })()}
        </div>
    );
}
