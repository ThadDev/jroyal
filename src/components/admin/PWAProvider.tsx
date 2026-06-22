"use client";
import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Detect if already installed/standalone
        if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
            setIsStandalone(true);
        }

        // Register Service Worker for /admin
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                // Register Service Worker for /admin
                navigator.serviceWorker.register("/sw-admin.js", { scope: "/admin" })
                    .then((reg) => console.log("Admin PWA SW registered:", reg.scope))
                    .catch((err) => console.error("Admin PWA SW registration failed:", err));
            });
        }

        // Listen for install prompt
        const handler = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
            // Show banner after a short delay if not standalone
            if (!isStandalone) {
                setTimeout(() => setShowBanner(true), 3000);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [isStandalone]);

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
            setInstallPrompt(null);
            setShowBanner(false);
        }
    };

    return (
        <>
            {children}
            
            <AnimatePresence>
                {showBanner && !isStandalone && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-[100]"
                    >
                        <div className="bg-charcoal border border-gold-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-obsidian/90">
                            <div className="p-5 flex items-start gap-4">
                                <div className="w-12 h-12 bg-gold-500/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-gold-500/20">
                                    <Smartphone className="text-gold-400" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-serif font-bold text-base mb-1">Install Admin App</h3>
                                    <p className="text-white/50 text-xs leading-relaxed">
                                        Install the Jroyal Grills dashboard to your home screen for faster access and better notifications.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setShowBanner(false)}
                                    className="text-white/30 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-3 bg-white/5 flex gap-2">
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 bg-gold-600 hover:bg-gold-500 text-obsidian font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    Install Now
                                </button>
                                <button
                                    onClick={() => setShowBanner(false)}
                                    className="px-4 py-2.5 text-white/50 hover:text-white text-sm transition-colors"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
