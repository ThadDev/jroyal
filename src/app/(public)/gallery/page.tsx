import type { Metadata } from "next";
import Image from "next/image";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
    title: "Gallery – Experience Jroyal Grills",
    description:
        "Browse our gallery showcasing the ambiance, cuisine, and events at Jroyal Grills, Nsukka's premier restaurant.",
};

const galleryImages = [
    { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", alt: "Signature Nigerian cuisine", category: "Food" },
    { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Elegant dining hall", category: "Ambiance" },
    { src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80", alt: "Fresh seasonal ingredients", category: "Food" },
    { src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80", alt: "Private dining experience", category: "Events" },
    { src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80", alt: "Restaurant bar area", category: "Ambiance" },
    { src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80", alt: "Main dining area", category: "Ambiance" },
    { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", alt: "Corporate event setup", category: "Events" },
    { src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80", alt: "Premium beverages", category: "Food" },
    { src: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80", alt: "Catering service", category: "Events" },
    { src: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=800&q=80", alt: "Grilled seafood platter", category: "Food" },
    { src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", alt: "Wedding celebration", category: "Events" },
    { src: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=800&q=80", alt: "Chef at work", category: "Ambiance" },
];

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Header */}
            <div className="section-padding pb-0 text-center">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Our Gallery</p>
                <h1 className="section-title mb-4">
                    A Visual <span className="gold-gradient-text italic">Journey</span>
                </h1>
                <p className="section-subtitle max-w-xl mx-auto">
                    From artful cuisine to elegant events — every image tells the story of what we do best.
                </p>
            </div>

            {/* Gallery Grid */}
            <div className="section-padding">
                <div className="container-wide">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
                        {galleryImages.map((img, i) => (
                            <div
                                key={i}
                                className={`group relative overflow-hidden ${i === 0 || i === 5 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
                                    }`}
                            >
                                <Image
                                    src={img.src}
                                    alt={img.alt}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                />
                                <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/60 transition-all duration-500 flex flex-col items-center justify-end p-4">
                                    <span className="text-gold-400 text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-1">
                                        {img.category}
                                    </span>
                                    <p className="text-white/0 group-hover:text-white/80 text-xs text-center transition-all duration-500">
                                        {img.alt}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <CTABanner
                title="Be Part of the Story"
                subtitle="Every reservation is a new memory in the making. Book your experience today."
                primaryLabel="Reserve a Table"
                primaryHref="/reservations"
                secondaryLabel="Contact Us"
                secondaryHref="/contact"
            />
        </div>
    );
}
