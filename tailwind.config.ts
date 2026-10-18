import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    300: "#FBCF6A",
                    400: "#F9BC44",
                    500: "#F6A81C",
                    600: "#D48C10",
                    700: "#A36809",
                },
                royal: {
                    300: "#D95A67",
                    400: "#C23545",
                    500: "#AB2330",
                    600: "#8E1C27",
                    700: "#6B1320",
                },
                obsidian: {
                    DEFAULT: "#0A0A0A",
                    50: "#1A1A1A",
                    100: "#141414",
                    200: "#0F0F0F",
                },
                charcoal: {
                    DEFAULT: "#1A1A1A",
                    50: "#2A2A2A",
                    100: "#222222",
                    200: "#1C1C1C",
                },
                cream: {
                    DEFAULT: "#F5F0E8",
                    50: "#FAF7F2",
                    100: "#F5F0E8",
                    200: "#EDE5D5",
                },
            },
            fontFamily: {
                serif: ["Playfair Display", "Georgia", "serif"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "fade-in": "fadeIn 0.8s ease-in-out forwards",
                "slide-up": "slideUp 0.6s ease-out forwards",
                "slide-down": "slideDown 0.6s ease-out forwards",
                "scale-in": "scaleIn 0.5s ease-out forwards",
                shimmer: "shimmer 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: "0" },
                    to: { opacity: "1" },
                },
                slideUp: {
                    from: { opacity: "0", transform: "translateY(30px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                slideDown: {
                    from: { opacity: "0", transform: "translateY(-30px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    from: { opacity: "0", transform: "scale(0.95)" },
                    to: { opacity: "1", transform: "scale(1)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            backgroundImage: {
                "gold-gradient":
                    "linear-gradient(135deg, #F6A81C 0%, #FBCF6A 50%, #F6A81C 100%)",
                "gold-royal-gradient":
                    "linear-gradient(135deg, #F6A81C 0%, #F9BC44 40%, #AB2330 100%)",
                "dark-gradient":
                    "linear-gradient(180deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
                "hero-overlay":
                    "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)",
                "light-gradient":
                    "linear-gradient(180deg, #FFF1D2 0%, #FFE8B0 50%, #FFF1D2 100%)",
            },
            spacing: {
                "18": "4.5rem",
                "88": "22rem",
                "128": "32rem",
            },
        },
    },
    plugins: [],
};

export default config;
