"use client";
import { useEffect } from "react";

/**
 * Drops the `light` class from <html> whenever a non-dashboard page mounts.
 * This ensures the public and admin pages always render in dark mode,
 * regardless of any theme preference saved in localStorage.
 */
export default function ThemeReset() {
    useEffect(() => {
        document.documentElement.classList.remove("light");
    }, []);
    return null;
}
