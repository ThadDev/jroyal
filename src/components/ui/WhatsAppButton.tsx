"use client";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function WhatsAppButton() {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [showLabel, setShowLabel] = useState(false);

    if (pathname.startsWith("/admin")) return null;
    const phoneNumber = "2348163176872";
    const message = "Hello Jroyal Grills, I would like to place an order.";

    useEffect(() => {
        // Show after a short delay
        const timer = setTimeout(() => setIsVisible(true), 1500);

        // Pulse the label every 10 seconds if not hovered
        const labelTimer = setInterval(() => {
            setShowLabel(true);
            setTimeout(() => setShowLabel(false), 4000);
        }, 12000);

        return () => {
            clearTimeout(timer);
            clearInterval(labelTimer);
        };
    }, []);

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-end gap-3 pointer-events-none">
                    {/* Animated label */}
                    <AnimatePresence>
                        {(showLabel) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                className="bg-obsidian/90 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-2xl text-[10px] font-bold border border-gold-500/30 whitespace-nowrap flex items-center gap-2"
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="tracking-widest uppercase">any enqiries?</span>
                                {/* Small tail */}
                                <div className="absolute -bottom-1 right-5 w-2 h-2 bg-obsidian rotate-45 border-r border-b border-gold-500/30" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* WhatsApp Button */}
                    <motion.a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onHoverStart={() => setShowLabel(true)}
                        onHoverEnd={() => setShowLabel(false)}
                        className="pointer-events-auto w-14 h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(37,211,102,0.4)] hover:shadow-[0_8px_30px_rgb(37,211,102,0.6)] transition-all duration-300 relative group"
                    >
                        {/* Ring animation */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#25D366] animate-ping opacity-20 group-hover:opacity-40" />

                        <svg
                            viewBox="0 0 24 24"
                            className="w-8 h-8 md:w-9 md:h-9 text-white fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412 0 12.048c0 2.123.554 4.197 1.606 6.044L0 24l6.117-1.605a11.837 11.837 0 005.925 1.573h.005c6.631 0 12.04-5.412 12.044-12.049a11.829 11.829 0 00-3.483-8.447z" />
                        </svg>
                    </motion.a>
                </div>
            )}
        </AnimatePresence>
    );
}
