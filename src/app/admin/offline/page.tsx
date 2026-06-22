"use client";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function AdminOfflinePage() {
    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-gold-500/20 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-gold-500/10 border border-gold-500/30 w-24 h-24 rounded-full flex items-center justify-center">
                        <WifiOff className="text-gold-400" size={40} />
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">You're Offline</h1>
                    <p className="text-white/50 text-sm leading-relaxed">
                        It looks like you've lost your internet connection. Don't worry, you can still view cached orders and reservations.
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 gap-3 pt-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-gold-600 hover:bg-gold-500 text-obsidian font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Try Reconnecting
                    </button>
                    <Link 
                        href="/admin"
                        className="w-full bg-white/5 hover:bg-white/10 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10"
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] pt-8">
                    Jroyal Grills Admin Shell • Offline Mode
                </p>
            </div>
        </div>
    );
}
