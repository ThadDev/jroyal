"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "dark",
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Read saved preference
        const saved = localStorage.getItem("jroyal-theme") as Theme | null;
        if (saved === "light" || saved === "dark") {
            setThemeState(saved);
            applyTheme(saved);
        }
        setMounted(true);
    }, []);

    const applyTheme = (t: Theme) => {
        if (t === "light") {
            document.documentElement.classList.add("light");
        } else {
            document.documentElement.classList.remove("light");
        }
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        applyTheme(t);
        localStorage.setItem("jroyal-theme", t);
    };

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    if (!mounted) return <>{children}</>;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
