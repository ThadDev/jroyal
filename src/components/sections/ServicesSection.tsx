"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Utensils, CalendarDays, ChefHat, Users, TreePine, Sparkles } from "lucide-react";

const services = [
    {
        icon: Utensils,
        title: "Restaurant",
        description:
            "Savour expertly crafted dishes celebrating Nigerian flavours and continental cuisine in an elegant setting.",
        href: "/menu",
        color: "from-gold-700/10 to-transparent",
    },
    {
        icon: CalendarDays,
        title: "Events",
        description:
            "From corporate gatherings to milestone celebrations, we create unforgettable experiences tailored to you.",
        href: "/events",
        color: "from-gold-700/10 to-transparent",
    },
    {
        icon: ChefHat,
        title: "Catering",
        description:
            "Our culinary team brings the Jroyal Grills experience to your venue with impeccable food and service.",
        href: "/events",
        color: "from-gold-700/10 to-transparent",
    },
    {
        icon: Users,
        title: "Private Dining",
        description:
            "Exclusive spaces for intimate gatherings, business dinners, and special occasions requiring privacy and elegance.",
        href: "/events",
        color: "from-gold-700/10 to-transparent",
    },
    {
        icon: TreePine,
        title: "Outdoor Catering",
        description:
            "Exceptional catering experiences in open-air settings, blending nature with our signature culinary excellence.",
        href: "/events",
        color: "from-gold-700/10 to-transparent",
    },
    {
        icon: Sparkles,
        title: "Special Events",
        description:
            "Weddings, birthdays, anniversaries — let us craft your perfect day with meticulous attention to every detail.",
        href: "/events",
        color: "from-gold-700/10 to-transparent",
    },
];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ServicesSection() {
    return (
        <section className="section-padding bg-charcoal border-y border-white/5" id="services">
            <div className="container-wide">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4"
                    >
                        What We Offer
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="section-title mb-4"
                    >
                        A World of Culinary<br />
                        <span className="gold-gradient-text italic">Experiences</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="section-subtitle max-w-xl mx-auto"
                    >
                        From intimate dinners to grand celebrations, every occasion is met with our signature warmth and excellence.
                    </motion.p>
                </div>

                {/* Services Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1"
                >
                    {services.map((service) => {
                        const Icon = service.icon;
                        return (
                            <motion.div key={service.title} variants={cardVariants}>
                                <Link
                                    href={service.href}
                                    className="group relative block bg-obsidian border border-white/5 p-8 overflow-hidden transition-all duration-500
                  hover:border-royal-600/30"
                                    id={`service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    {/* Hover gradient */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                    {/* Gold corner accent */}
                                    <div className="absolute top-0 left-0 w-12 h-px bg-royal-600/0 group-hover:bg-royal-600/60 transition-all duration-500" />
                                    <div className="absolute top-0 left-0 h-12 w-px bg-royal-600/0 group-hover:bg-royal-600/60 transition-all duration-500" />

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className="w-12 h-12 border border-gold-700/30 flex items-center justify-center mb-6 group-hover:border-gold-500/50 transition-colors duration-300">
                                            <Icon size={20} className="text-gold-600 group-hover:text-gold-400 transition-colors duration-300" />
                                        </div>

                                        <h3 className="font-serif text-xl font-semibold text-white mb-3 group-hover:text-gold-400 transition-colors duration-300">
                                            {service.title}
                                        </h3>
                                        <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                                            {service.description}
                                        </p>

                                        <div className="mt-6 flex items-center gap-2 text-gold-700 text-xs tracking-wider uppercase font-medium group-hover:text-gold-500 transition-colors duration-300">
                                            <span>Learn More</span>
                                            <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
}
