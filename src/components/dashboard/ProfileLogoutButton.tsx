"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { LogOut } from "lucide-react";

export default function ProfileLogoutButton() {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        showToast("Signed out. See you next time! 👋", "info");
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.875rem",
                borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.2)",
                background: "rgba(239,68,68,0.06)",
                color: loading ? "rgba(239,68,68,0.5)" : "#EF4444",
                fontFamily: "Inter,sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
            }}
        >
            <LogOut size={15} />
            {loading ? "Signing out…" : "Log Out"}
        </button>
    );
}
