import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { BranchProvider } from "@/context/BranchContext";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import LocationSelector from "@/components/ui/LocationSelector";
import NextTopLoader from "nextjs-toploader";

/**
 * Root metadata — Jroyal Grills, Nsukka.
 */
export const metadata: Metadata = {
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL ?? "https://jroyalgrills.com"
    ),
    title: {
        default: "Jroyal Grills – Premium Grills & Fine Dining | Nsukka, Nigeria",
        template: "%s | Jroyal Grills",
    },
    description:
        "Jroyal Grills offers premium grilling, exceptional Nigerian cuisine, private events, and outside catering in Nsukka, Enugu State, Nigeria. Opposite Flat Gate, Behind Flat, Nsukka.",
    keywords: [
        "Jroyal Grills",
        "Jroyal Grills Nsukka",
        "restaurant Nsukka",
        "grills Nsukka",
        "fine dining Nsukka",
        "Nigerian cuisine Nsukka",
        "event catering Nsukka",
        "private dining Nsukka",
        "outdoor catering Nigeria",
        "luxury restaurant Nsukka",
        "best restaurant Nsukka",
        "Nigerian grills",
        "Enugu State restaurant",
        "Jroyal",
    ],
    openGraph: {
        type: "website",
        locale: "en_NG",
        url: "/",
        siteName: "Jroyal Grills",
        title: "Jroyal Grills – Premium Grills & Fine Dining | Nsukka, Nigeria",
        description:
            "Premium grilling, exceptional Nigerian cuisine, and unforgettable events. Jroyal Grills — Nsukka's premier dining destination.",
        images: [
            {
                url: "/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Jroyal Grills – Premium Grills & Fine Dining",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Jroyal Grills – Premium Grills & Fine Dining",
        description:
            "Nsukka's premier grilling destination · Fine Dining · Events · Catering",
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL ?? "https://jroyalgrills.com",
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                {/*
                 * JSON-LD Structured Data — Jroyal Grills restaurant
                 */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Restaurant",
                            "@id": "https://jroyalgrills.com/#restaurant",
                            name: "Jroyal Grills",
                            alternateName: "Jroyal Grills N Chops",
                            description:
                                "Nsukka's premier grilling and dining destination. Premium grills, Nigerian & continental cuisine, events, and outside catering.",
                            address: {
                                "@type": "PostalAddress",
                                streetAddress: "Opposite Flat Gate, Behind Flat",
                                addressLocality: "Nsukka",
                                postalCode: "410001",
                                addressRegion: "Enugu",
                                addressCountry: "NG",
                            },
                            openingHoursSpecification: [
                                {
                                    "@type": "OpeningHoursSpecification",
                                    dayOfWeek: [
                                        "Tuesday",
                                        "Wednesday",
                                        "Thursday",
                                        "Friday",
                                        "Saturday",
                                        "Sunday",
                                    ],
                                    opens: "10:00",
                                    closes: "23:00",
                                },
                                {
                                    "@type": "OpeningHoursSpecification",
                                    dayOfWeek: ["Monday"],
                                    opens: "16:00",
                                    closes: "23:00",
                                },
                            ],
                            servesCuisine: [
                                "Nigerian",
                                "African",
                                "Continental",
                                "Grills",
                            ],
                            priceRange: "$$",
                            telephone: "+2347059666459",
                            url: "https://jroyalgrills.com",
                            hasMenu: "https://jroyalgrills.com/menu",
                            acceptsReservations: "True",
                        }),
                    }}
                />
            </head>
            <body>
                <NextTopLoader
                    color="#D4A832"
                    initialPosition={0.08}
                    crawlSpeed={200}
                    height={3}
                    crawl={true}
                    showSpinner={false}
                    easing="ease"
                    speed={200}
                    shadow="0 0 10px #D4A832,0 0 5px #D4A832"
                />
                <BranchProvider>
                    {/* Location selector — shown once on first visit */}
                    <LocationSelector />
                    <ToastProvider>
                        {children}
                        <WhatsAppButton />
                    </ToastProvider>
                </BranchProvider>
            </body>
        </html>
    );
}
