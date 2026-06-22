"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const galleryImages = [
    { src: "https://i.pinimg.com/736x/ce/3c/fb/ce3cfb6b672a3fe525f11345566f482d.jpg", alt: "Signature Nigerian cuisine" },
    { src: "https://i.pinimg.com/736x/ed/3c/64/ed3c6454f367a1fd9c43c9b294528d55.jpg", alt: "Fresh colourful ingredients" },
    { src: "https://i.pinimg.com/736x/e6/88/6a/e6886abfc254ac9f9c110d16bf2a5425.jpg", alt: "Elegant dining atmosphere" },
    { src: "https://i.pinimg.com/736x/3e/95/70/3e9570ca7323d071908aa7077aabc00b.jpg", alt: "Private dining event" },
    { src: "https://i.pinimg.com/736x/06/8d/c5/068dc52b100ec940bd407deea560481f.jpg", alt: "Restaurant bar experience" },
    { src: "https://i.pinimg.com/736x/60/6e/84/606e84f01116088c05cdd94378ef8a79.jpg", alt: "Premium cocktail selection" },
];

export default function GalleryPreviewSection() {
    return (
        <section className="section-padding bg-obsidian" id="gallery-preview">
            <div className="container-wide">
                <div className="text-center mb-12">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4"
                    >
                        Gallery
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title"
                    >
                        A Feast for the Eyes
                    </motion.h2>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="grid grid-cols-2 lg:grid-cols-3 gap-1"
                >
                    {galleryImages.map((img, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06 }}
                            className="group relative overflow-hidden aspect-square"
                        >
                            <Image
                                src={img.src}
                                alt={img.alt}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-all duration-500 flex items-center justify-center">
                                <p className="text-white/0 group-hover:text-white/90 text-xs text-center px-4 transition-all duration-500 font-light tracking-wide">
                                    {img.alt}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="text-center mt-10">
                    <Link href="/gallery" className="btn-outline">
                        View Full Gallery
                    </Link>
                </div>
            </div>
        </section>
    );
}
