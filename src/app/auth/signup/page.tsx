"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const signupSchema = z
  .object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(signupSchema) });

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setGoogleLoading(false);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: data.full_name, email: data.email, password: data.password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setServerError(result.error ?? "Signup failed. Please try again.");
      } else {
        showToast("Welcome! Your account has been created 🎉", "success");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3" aria-label="Jroyal Grills – Home">
            <Image
              src="/logo.png"
              alt="Jroyal Grills"
              width={150}
              height={60}
              className="object-contain h-14 w-auto"
              priority
            />
          </Link>
        </div>

        <div className="bg-charcoal border border-white/5 p-8">
          <h1 className="font-serif text-xl text-white mb-1">Create Account</h1>
          <p className="text-white/40 text-xs mb-7">Join us for an exclusive dining experience</p>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-white/10 text-white/70 hover:border-white/20 hover:text-white text-sm font-medium transition-all duration-200 mb-6"
            id="google-signup"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="label-dark">Full Name</label>
              <input
                id="full_name"
                type="text"
                {...register("full_name")}
                className="input-dark"
                placeholder="e.g. Adaeze Okonkwo"
                autoComplete="name"
              />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label-dark">Email Address</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className="input-dark"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label-dark">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="input-dark pr-10"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm_password" className="label-dark">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showCPw ? "text" : "password"}
                  {...register("confirm_password")}
                  className="input-dark pr-10"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCPw(!showCPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>

            {serverError && (
              <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2"
              id="signup-submit"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-white/40 text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-gold-500 hover:text-gold-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Jroyal Grills
        </p>
      </motion.div>
    </div>
  );
}
