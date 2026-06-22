"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
    {
        name: "Dr. Emeka Okonkwo",
        role: "University Lecturer",
        content:
            "Jroyal Grills is without question the finest dining experience in Nsukka. The ofe onugbu is extraordinary — it reminds me of home cooking elevated to an art form. The ambiance is equally impressive.",
        rating: 5,
    },
    {
        name: "Mrs. Chioma Adaeze",
        role: "Event Planner",
        content:
            "I've used their catering services for over five corporate events. Every single time, the professionalism and quality of food has been impeccable. My clients are always impressed. They are my go-to partner.",
        rating: 5,
    },
    {
        name: "Engr. Tunde Fashola",
        role: "Business Executive",
        content:
            "We held our annual general meeting dinner here and the private dining experience was exceptional. The service was flawless, the food extraordinary, and the setting perfectly suited our needs. Highly recommended.",
        rating: 5,
    },
    {
        name: "Adaeze Nwachukwu",
        role: "Food Blogger",
        content:
            "The jollof rice here is truly in a class of its own. I've eaten across Nigeria and this is exceptional. The outdoor seating area is perfect for a sunset dinner. A must-visit landmark in Enugu State.",
        rating: 5,
    },
];

export default function TestimonialsSection() {
    const [current, setCurrent] = useState(0);

    const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
    const next = () => setCurrent((c) => (c + 1) % testimonials.length);

    return (
        <section className="section-padding bg-charcoal border-y border-white/5 overflow-hidden" id="testimonials">
            <div className="container-narrow px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4"
                    >
                        Guest Experiences
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="section-title"
                    >
                        What Our Guests<br />
                        <span className="gold-gradient-text italic">Are Saying</span>
                    </motion.h2>
                </div>

                {/* Testimonial Card */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="bg-obsidian border border-white/5 p-8 sm:p-12 text-center"
                        >
                            <Quote size={32} className="text-gold-700/40 mx-auto mb-8" />
                            <p className="font-serif text-lg sm:text-xl text-white/80 leading-relaxed italic mb-8 max-w-2xl mx-auto">
                                &ldquo;{testimonials[current].content}&rdquo;
                            </p>
                            <div className="flex justify-center gap-1 mb-4">
                                {[...Array(testimonials[current].rating)].map((_, i) => (
                                    <Star key={i} size={14} className="fill-gold-500 text-gold-500" />
                                ))}
                            </div>
                            <p className="font-semibold text-white">{testimonials[current].name}</p>
                            <p className="text-white/40 text-sm mt-1">{testimonials[current].role}</p>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={prev}
                            className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                            aria-label="Previous testimonial"
                            id="testimonial-prev"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="flex gap-2">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-gold-500 w-6" : "bg-white/20"}`}
                                    aria-label={`Go to testimonial ${i + 1}`}
                                />
                            ))}
                        </div>
                        <button
                            onClick={next}
                            className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold-500 hover:text-gold-500 transition-all duration-200"
                            aria-label="Next testimonial"
                            id="testimonial-next"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
