import type { Metadata } from "next";
import { Clock, MapPin, Phone, MessageCircle } from "lucide-react";
import ReservationForm from "@/components/forms/ReservationForm";

export const metadata: Metadata = {
    title: "Make a Reservation",
    description:
        "Reserve your table at Jroyal Grills. Book online for restaurant dining, private events, catering, and more in Nsukka, Nigeria.",
};

export default function ReservationsPage() {
    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Hero strip */}
            <div
                className="relative py-20 overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
                }}
            >
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `repeating-linear-gradient(-45deg, #C9A84C 0, #C9A84C 1px, transparent 0, transparent 50%)`,
                        backgroundSize: "20px 20px",
                    }}
                />
                <div className="relative container-narrow text-center px-4">
                    <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Reserve</p>
                    <h1 className="section-title mb-4">
                        Book Your <span className="gold-gradient-text italic">Experience</span>
                    </h1>
                    <p className="section-subtitle max-w-lg mx-auto">
                        Fill out the form below and we'll confirm your reservation within 2 hours. For urgent bookings, WhatsApp us directly.
                    </p>
                </div>
            </div>

            {/* Main content */}
            <div className="section-padding">
                <div className="container-wide">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <div className="mb-8">
                                <h2 className="font-serif text-2xl text-white mb-2">Reservation Details</h2>
                                <p className="text-white/40 text-sm">Fields marked with * are required.</p>
                            </div>
                            <ReservationForm />
                        </div>

                        {/* Sidebar info */}
                        <div className="space-y-6">
                            <div className="bg-charcoal border border-white/5 p-6">
                                <h3 className="font-serif text-lg text-gold-400 mb-4">Contact Us Directly</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start gap-3">
                                        <MapPin size={14} className="text-gold-600 mt-1 flex-shrink-0" />
                                        <p className="text-white/60 text-sm leading-relaxed">
                                            V94W+P6Q, University Rd, Government Station, Nsukka 410111, Enugu, Nigeria
                                        </p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Clock size={14} className="text-gold-600 flex-shrink-0" />
                                        <p className="text-white/60 text-sm">Daily: 9:00 AM – 9:00 PM</p>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <MessageCircle size={14} className="text-gold-600 flex-shrink-0" />
                                        <a
                                            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-gold-500 text-sm hover:text-gold-400 transition-colors"
                                        >
                                            WhatsApp Us
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-charcoal border border-white/5 p-6">
                                <h3 className="font-serif text-lg text-gold-400 mb-4">Booking Policy</h3>
                                <ul className="space-y-3 text-white/50 text-sm">
                                    {[
                                        "Confirmations sent within 2 hours",
                                        "Cancel 24hrs before — no charge",
                                        "Large groups (20+) require deposit",
                                        "We accommodate dietary needs",
                                        "Private dining available on request",
                                    ].map((item) => (
                                        <li key={item} className="flex items-start gap-2">
                                            <span className="w-1 h-1 rounded-full bg-gold-600 mt-2 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-gold-600/10 border border-gold-600/20 p-6">
                                <p className="text-gold-400 text-sm font-medium mb-2">Prefer to call?</p>
                                <p className="text-white/60 text-xs leading-relaxed">
                                    Send us a WhatsApp message and our team will respond promptly to confirm your booking.
                                </p>
                                <a
                                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hello! I'd like to make a reservation.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary mt-4 text-xs w-full justify-center gap-2"
                                >
                                    <MessageCircle size={12} />
                                    Open WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
