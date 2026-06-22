import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
    title: "Events, Catering & Private Dining",
    description:
        "Plan your next event with Jroyal Grills. Corporate events, weddings, outside catering, and exclusive private dining in Nsukka, Nigeria.",
};

const services = [
    {
        title: "Corporate Events",
        description:
            "From board meetings to product launches and appreciation dinners — we provide the perfect setting and impeccable catering to make your corporate event a success.",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        features: ["Custom menus", "AV equipment available", "Dedicated event coordinator", "Up to 200 guests"],
    },
    {
        title: "Weddings & Celebrations",
        description:
            "Your most special moments deserve a setting as beautiful as the occasion. We handle every detail, from décor to the final toast.",
        image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
        features: ["Bespoke menu design", "Floral arrangements", "Photography space", "Cake service included"],
    },
    {
        title: "Outside Catering",
        description:
            "We bring the full Jroyal Grills experience to your location. Our mobile catering team delivers professional service wherever you need us.",
        image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80",
        features: ["Staffed service", "Equipment provided", "Customisable menu", "Citywide coverage"],
    },
    {
        title: "Private Dining",
        description:
            "Our exclusive private dining suite offers an intimate, curated experience for discerning guests who value privacy and personalised attention.",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80",
        features: ["Private room for 2–20", "Personalised menu", "Dedicated waiter", "Wine pairing available"],
    },
];

export default function EventsPage() {
    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Header */}
            <div className="section-padding pb-0 text-center">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">Celebrate With Us</p>
                <h1 className="section-title mb-4">
                    Events, Catering &<span className="block gold-gradient-text italic">Private Dining</span>
                </h1>
                <p className="section-subtitle max-w-xl mx-auto">
                    From intimate dinners to grand celebrations, we transform every gathering into an extraordinary memory.
                </p>
            </div>

            {/* Services */}
            <div className="section-padding">
                <div className="container-wide space-y-24">
                    {services.map((service, i) => (
                        <div
                            key={service.title}
                            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                        >
                            {/* Image */}
                            <div className={`relative h-80 lg:h-[480px] ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                                <Image
                                    src={service.image}
                                    alt={service.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/30 to-transparent" />
                                <div
                                    className={`absolute -bottom-4 ${i % 2 === 0 ? "-right-4" : "-left-4"} w-24 h-24 border-b-2 ${i % 2 === 0 ? "border-r-2" : "border-l-2"} border-gold-600/30`}
                                />
                            </div>

                            {/* Text */}
                            <div className={i % 2 === 1 ? "lg:order-1" : ""}>
                                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-3">{`0${i + 1}`}</p>
                                <h2 className="font-serif text-3xl lg:text-4xl font-bold text-white mb-4">{service.title}</h2>
                                <p className="text-white/60 leading-relaxed mb-8">{service.description}</p>
                                <ul className="space-y-3 mb-8">
                                    {service.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3 text-sm text-white/60">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/reservations" className="btn-primary">
                                    Enquire Now
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <CTABanner
                title="Let's Plan Your Event"
                subtitle="Speak with our event coordinator to begin crafting your perfect occasion."
                primaryLabel="Make an Enquiry"
                primaryHref="/reservations"
                secondaryLabel="Call Us on WhatsApp"
                secondaryHref={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
            />
        </div>
    );
}
