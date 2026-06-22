import AdminSidebar from "@/components/layout/AdminSidebar";
import PWAProvider from "@/components/admin/PWAProvider";
import type { Metadata, Viewport } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Jroyal Grills Admin Dashboard",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "MO Admin",
    },
};

export const viewport: Viewport = {
    themeColor: "#C9A84C",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-obsidian">
            <PWAProvider>
                <AdminSidebar />
                <main className="flex-1 overflow-auto pt-4 lg:pt-0">
                    {children}
                </main>
            </PWAProvider>
        </div>
    );
}
