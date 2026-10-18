"use client";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const isLight = theme === "light";

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundColor: isLight ? "#FFF1D2" : "#080810",
                backgroundImage: isLight
                    ? `radial-gradient(ellipse at 10% 10%, rgba(246,168,28,0.06) 0%, transparent 40%),
             radial-gradient(ellipse at 90% 90%, rgba(246,168,28,0.04) 0%, transparent 40%)`
                    : `radial-gradient(ellipse at 10% 10%, rgba(246,168,28,0.07) 0%, transparent 40%),
             radial-gradient(ellipse at 90% 90%, rgba(100,70,200,0.05) 0%, transparent 40%),
             radial-gradient(ellipse at 50% 50%, rgba(10,10,25,1) 0%, transparent 100%)`,
                position: "relative",
                overflowX: "hidden",
                transition: "background-color 0.3s ease",
            }}
        >
            {children}
        </div>
    );
}
