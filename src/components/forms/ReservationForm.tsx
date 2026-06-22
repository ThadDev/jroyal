"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reservationSchema, type ReservationInput } from "@/lib/schema";
import { AVAILABLE_TIMES, SERVICE_LABELS } from "@/lib/utils";
import { CheckCircle, MessageCircle, Loader2 } from "lucide-react";

const SERVICES = Object.entries(SERVICE_LABELS) as [string, string][];
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function ReservationForm() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<ReservationInput>({
        resolver: zodResolver(reservationSchema),
        defaultValues: { service: "restaurant", guests: 2 },
    });

    const selectedService = watch("service");

    // Get tomorrow's date as min selectable
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    const onSubmit = async (data: ReservationInput) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error ?? "Something went wrong. Please try again.");
            }
            setSubmitted(true);
            reset();
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-charcoal border border-gold-700/30 p-10 text-center space-y-6">
                <div className="w-16 h-16 border border-gold-500/40 flex items-center justify-center mx-auto">
                    <CheckCircle size={28} className="text-gold-500" />
                </div>
                <div>
                    <h3 className="font-serif text-2xl text-white mb-2">Reservation Received!</h3>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto">
                        Thank you! We've received your booking request and will send a confirmation to your email shortly.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button onClick={() => setSubmitted(false)} className="btn-outline text-xs">
                        Make Another Reservation
                    </button>
                    <a
                        href={`https://wa.me/${WHATSAPP}?text=Hi! I just made a reservation at Jroyal Grills. I'd like to confirm the details.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs gap-2"
                    >
                        <MessageCircle size={14} />
                        Follow Up on WhatsApp
                    </a>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" id="reservation-form" noValidate>
            {/* Service Selection */}
            <div>
                <label className="label-dark">Service Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SERVICES.map(([value, label]) => (
                        <label
                            key={value}
                            className={`flex items-center gap-2 p-3 border cursor-pointer text-xs font-medium transition-all duration-200 ${selectedService === value
                                    ? "border-gold-500 bg-gold-500/10 text-gold-400"
                                    : "border-white/10 text-white/50 hover:border-white/20"
                                }`}
                        >
                            <input type="radio" value={value} {...register("service")} className="sr-only" />
                            {label}
                        </label>
                    ))}
                </div>
                {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service.message}</p>}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="label-dark">Date *</label>
                    <input
                        id="date"
                        type="date"
                        min={minDate}
                        {...register("date")}
                        className="input-dark"
                        aria-invalid={!!errors.date}
                    />
                    {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date.message}</p>}
                </div>
                <div>
                    <label htmlFor="time" className="label-dark">Time *</label>
                    <select id="time" {...register("time")} className="input-dark">
                        <option value="">Select a time</option>
                        {AVAILABLE_TIMES.map((t) => {
                            const [h, m] = t.split(":");
                            const hr = parseInt(h);
                            const ampm = hr >= 12 ? "PM" : "AM";
                            const label = `${hr % 12 || 12}:${m} ${ampm}`;
                            return <option key={t} value={t}>{label}</option>;
                        })}
                    </select>
                    {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time.message}</p>}
                </div>
            </div>

            {/* Guests */}
            <div>
                <label htmlFor="guests" className="label-dark">Number of Guests *</label>
                <input
                    id="guests"
                    type="number"
                    min={1}
                    max={500}
                    {...register("guests", { valueAsNumber: true })}
                    className="input-dark"
                    placeholder="e.g. 4"
                />
                {errors.guests && <p className="text-red-400 text-xs mt-1">{errors.guests.message}</p>}
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="name" className="label-dark">Full Name *</label>
                    <input id="name" type="text" {...register("name")} className="input-dark" placeholder="John Doe" />
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="label-dark">Email Address *</label>
                    <input id="email" type="email" {...register("email")} className="input-dark" placeholder="john@example.com" />
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
            </div>

            <div>
                <label htmlFor="phone" className="label-dark">Phone / WhatsApp *</label>
                <input id="phone" type="tel" {...register("phone")} className="input-dark" placeholder="+234 800 000 0000" />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <label htmlFor="special_requests" className="label-dark">Special Requests (Optional)</label>
                <textarea
                    id="special_requests"
                    {...register("special_requests")}
                    rows={3}
                    className="input-dark resize-none"
                    placeholder="Dietary requirements, accessibility needs, special decorations..."
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm">{error}</div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 justify-center py-4"
                    id="submit-reservation"
                >
                    {loading ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Confirm Reservation"
                    )}
                </button>
                <a
                    href={`https://wa.me/${WHATSAPP}?text=Hi! I'd like to make a reservation at Jroyal Grills.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex-1 justify-center py-4 gap-2"
                    id="whatsapp-booking"
                >
                    <MessageCircle size={14} />
                    Book via WhatsApp
                </a>
            </div>
        </form>
    );
}
