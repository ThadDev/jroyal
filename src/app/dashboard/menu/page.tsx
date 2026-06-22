import type { Metadata } from "next";
import { Suspense } from "react";
import MenuClient from "@/components/dashboard/MenuClient";

export const metadata: Metadata = {
    title: "Full Menu – Jroyal Grills",
    description: "Browse our full menu of authentic Nigerian cuisine, grills, soups, pastries and more.",
};

function MenuFallback() {
    return (
        <div style={{ paddingTop: "70px", minHeight: "100vh" }}>
            <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-6">
                <div className="h-10 w-48 bg-white/5 rounded-full animate-pulse" />
                <div className="h-12 w-full bg-white/5 rounded-full animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-[100px] bg-white/5 rounded-2xl animate-pulse border border-white/5" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<MenuFallback />}>
            <MenuClient />
        </Suspense>
    );
}
