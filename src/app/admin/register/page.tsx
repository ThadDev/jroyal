"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import { ShieldCheck, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";

const adminRegisterSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
    admin_code: z.string().min(1, "Admin code is required"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof adminRegisterSchema>;

export default function AdminRegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(adminRegisterSchema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          password: data.password,
          admin_code: data.admin_code,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Registration failed.");
        return;
      }

      // Sign in the newly created admin
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError("Admin created but sign-in failed. Please go to admin login.");
        return;
      }

      showToast("Admin account created successfully! 🛡️", "success");
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12"
      style={{ backgroundImage: "radial-gradient(ellipse at center, #1A1A1A 0%, #0A0A0A 70%)" }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 border border-gold-600/30 bg-gold-600/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-gold-500" />
          </div>
          <h1 className="font-serif text-2xl text-white">Admin Registration</h1>
          <p className="text-gold-700 text-xs tracking-[0.3em] uppercase mt-1">Jroyal Grills</p>
        </div>

        <div className="bg-charcoal border border-white/5 p-8">
          <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20">
            <Lock size={12} className="text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-300/80 text-xs">Requires a valid admin secret code</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="full_name" className="label-dark">Full Name</label>
              <input id="full_name" type="text" {...register("full_name")} className="input-dark" placeholder="Admin name" autoComplete="name" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label-dark">Email Address</label>
              <input id="email" type="email" {...register("email")} className="input-dark" placeholder="admin@jroyalgrills.com" autoComplete="email" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label-dark">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? "text" : "password"} {...register("password")} className="input-dark pr-10" placeholder="Min. 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" aria-label="Toggle password visibility">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirm_password" className="label-dark">Confirm Password</label>
              <div className="relative">
                <input id="confirm_password" type={showCPw ? "text" : "password"} {...register("confirm_password")} className="input-dark pr-10" placeholder="Repeat password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowCPw(!showCPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors" aria-label="Toggle confirm password visibility">
                  {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            <div>
              <label htmlFor="admin_code" className="label-dark">Admin Secret Code</label>
              <input id="admin_code" type="password" {...register("admin_code")} className="input-dark" placeholder="Enter the admin secret code" autoComplete="off" />
              {errors.admin_code && <p className="text-red-400 text-xs mt-1">{errors.admin_code.message}</p>}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2" id="admin-register-submit">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating admin account…</> : "Create Admin Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-gold-500 hover:text-gold-400 transition-colors">Admin Login</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Jroyal Grills — Admin Only
        </p>
      </motion.div>
    </div>
  );
}
