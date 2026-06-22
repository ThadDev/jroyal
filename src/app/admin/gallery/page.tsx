"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, Loader2, Plus } from "lucide-react";
import type { GalleryImage } from "@/types";

const CATEGORIES = ["general", "food", "events", "ambiance", "team"] as const;

export default function AdminGalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [category, setCategory] = useState<typeof CATEGORIES[number]>("general");
    const [caption, setCaption] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    const supabase = createClient();

    const fetchImages = async () => {
        setLoading(true);
        const { data } = await supabase.from("gallery").select("*").order("created_at", { ascending: false });
        setImages(data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchImages(); }, []); // eslint-disable-line

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("gallery").upload(fileName, file);
        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from("gallery").getPublicUrl(fileName);
        await supabase.from("gallery").insert([{ url: publicUrl, caption, category }]);

        setCaption("");
        if (fileRef.current) fileRef.current.value = "";
        setUploading(false);
        fetchImages();
    };

    const deleteImage = async (img: GalleryImage) => {
        if (!confirm("Delete this image?")) return;
        // Extract storage path from URL
        const urlParts = img.url.split("/gallery/");
        if (urlParts[1]) {
            await supabase.storage.from("gallery").remove([urlParts[1]]);
        }
        await supabase.from("gallery").delete().eq("id", img.id);
        fetchImages();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-2xl text-white">Gallery Manager</h1>
                    <p className="text-white/40 text-sm mt-1">{images.length} images</p>
                </div>
            </div>

            {/* Upload section */}
            <div className="bg-charcoal border border-white/5 p-6 mb-8">
                <h2 className="font-serif text-base text-white mb-4 flex items-center gap-2">
                    <Plus size={16} className="text-gold-500" /> Upload New Image
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label-dark">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
                            className="input-dark capitalize"
                            id="gallery-category"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c} className="capitalize">{c}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-dark">Caption (Optional)</label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            className="input-dark"
                            placeholder="Image caption..."
                            id="gallery-caption"
                        />
                    </div>
                    <div>
                        <label className="label-dark">Select Image</label>
                        <div className="relative">
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                className="block w-full text-sm text-white/50 file:mr-3 file:py-2 file:px-4 file:border-0 file:bg-gold-500/20 file:text-gold-400 file:text-xs file:cursor-pointer cursor-pointer disabled:opacity-50"
                                id="gallery-file-upload"
                            />
                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-charcoal/80">
                                    <Loader2 size={16} className="animate-spin text-gold-500" />
                                    <span className="text-gold-500 text-xs ml-2">Uploading…</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <p className="text-white/30 text-xs mt-3">
                    Note: Images are uploaded to Supabase Storage. Ensure your Supabase storage bucket &quot;gallery&quot; exists and is public.
                </p>
            </div>

            {/* Images Grid */}
            {loading ? (
                <div className="text-center py-16 text-white/30">Loading gallery…</div>
            ) : images.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/10">
                    <Upload size={32} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No images yet. Upload your first one above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {images.map((img) => (
                        <div key={img.id} className="group relative aspect-square bg-charcoal overflow-hidden border border-white/5">
                            <Image src={img.url} alt={img.caption ?? "Gallery image"} fill className="object-cover" sizes="200px" />
                            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/70 transition-all duration-300 flex flex-col items-center justify-end p-3">
                                {img.caption && (
                                    <p className="text-white/0 group-hover:text-white/80 text-xs text-center mb-2 transition-all duration-300 line-clamp-2">
                                        {img.caption}
                                    </p>
                                )}
                                <span className="text-[10px] text-gold-600/0 group-hover:text-gold-600 capitalize transition-all duration-300 mb-2">
                                    {img.category}
                                </span>
                                <button
                                    onClick={() => deleteImage(img)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 bg-red-500/80 text-white hover:bg-red-600"
                                    aria-label="Delete image"
                                    id={`delete-img-${img.id}`}
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
