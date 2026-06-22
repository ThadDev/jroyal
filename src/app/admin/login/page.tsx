"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schema";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

const isSupabaseConfigured =
    typeof window !== "undefined"
        ? true // client-side: assume configured, errors will surface on submit
        : false;

// Detect placeholder values at runtime on client
function useSupabaseStatus() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    return url.includes("your-project-id") || key === "your-anon-key" || !url || !key;
}

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const notConfigured = useSupabaseStatus();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        setError(null);
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });
        setLoading(false);
        if (authError) {
            setError("Invalid email or password. Please try again.");
            return;
        }
        router.push("/admin");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4"
            style={{
                backgroundImage: `radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 70%)`,
            }}
        >
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <Image
                            src="/logo.png"
                            alt="Jroyal Grills"
                            width={160}
                            height={64}
                            className="object-contain h-16 w-auto"
                            priority
                        />
                    </div>
                    <p className="text-gold-700 text-xs tracking-[0.3em] uppercase mt-1">Admin Dashboard</p>
                </div>

                {/* Supabase not configured warning */}
                {notConfigured && (
                    <div className="mb-6 border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 flex gap-3">
                        <AlertTriangle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-300 text-xs font-semibold mb-1">Supabase not configured</p>
                            <p className="text-yellow-200/60 text-xs leading-relaxed">
                                Fill in your real Supabase keys in <code className="text-yellow-300">.env.local</code>, then restart the dev server.
                            </p>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-charcoal border border-white/5 p-8">
                    <h2 className="font-serif text-lg text-white mb-6">Sign In</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="admin-login-form" noValidate>
                        <div>
                            <label htmlFor="email" className="label-dark">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                {...register("email")}
                                className="input-dark"
                                placeholder="admin@jroyalgrills.com"
                                autoComplete="email"
                            />
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="label-dark">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className="input-dark pr-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3"
                            id="admin-login-submit"
                        >
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Signing in…</> : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-white/20 text-xs mt-6">
                    © {new Date().getFullYear()} Jroyal Grills
                </p>
                <p className="text-center text-white/20 text-xs mt-2">
                    Need an admin account?{" "}
                    <a href="/admin/register" className="text-gold-700 hover:text-gold-500 transition-colors">Register</a>
                </p>
            </div>
        </div>
    );
}
