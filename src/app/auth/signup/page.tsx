"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/context/ToastContext";
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

// ── shared style tokens ──────────────────────────────────────
const S = {
  bg: "#0D0D0D",
  inputBg: "rgba(255,255,255,0.05)",
  inputBorder: "rgba(255,255,255,0.10)",
  inputBorderFocus: "#AB2330",
  text: "#F5F0E8",
  muted: "rgba(255,255,255,0.40)",
  red: "#AB2330",
};

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function OAuthButton({ id, onClick, loading, icon, label, disabled }: {
  id: string; onClick?: () => void; loading?: boolean;
  icon: React.ReactNode; label: string; disabled?: boolean;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        padding: "13px 16px",
        borderRadius: "10px",
        background: S.inputBg,
        border: `1px solid ${S.inputBorder}`,
        color: S.text,
        fontFamily: "Inter,sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = S.inputBorder; }}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {label}
    </button>
  );
}

function StyledInput({ id, type, placeholder, autoComplete, register, focused, onFocus, onBlur }: {
  id: string; type: string; placeholder: string; autoComplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any; focused: boolean; onFocus: () => void; onBlur: () => void;
}) {
  return (
    <input
      id={id}
      type={type}
      {...register}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        width: "100%",
        padding: "13px 14px",
        borderRadius: "10px",
        background: S.inputBg,
        border: `1px solid ${focused ? S.inputBorderFocus : S.inputBorder}`,
        color: S.text,
        fontFamily: "Inter,sans-serif",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box" as const,
      }}
    />
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [focused, setFocused] = useState<Record<string, boolean>>({});

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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

  const fo = (field: string) => ({ onFocus: () => setFocused(p => ({ ...p, [field]: true })), onBlur: () => setFocused(p => ({ ...p, [field]: false })) });

  const errStyle: React.CSSProperties = { fontFamily: "Inter,sans-serif", fontSize: "11px", color: "#f87171", margin: "-2px 0 0" };

  return (
    <div style={{ minHeight: "100svh", background: S.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <Image src="/logo.png" alt="Jroyal Grills" width={120} height={48} style={{ objectFit: "contain", height: "48px", width: "auto" }} priority />
          </div>

          <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: "28px", fontWeight: 700, color: S.text, lineHeight: 1.2, margin: "0 0 8px" }}>
            Jollof, grills,treats, hot to your door.
          </h1>
          <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: S.muted, margin: 0 }}>Sign up to get started in seconds.</p>
        </div>

        {/* OAuth */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <OAuthButton id="google-signup" onClick={handleGoogleLogin} loading={googleLoading} icon={<GoogleIcon />} label="Continue with Google" />
          <OAuthButton id="apple-signup" icon={<AppleIcon />} label="Continue with Apple" disabled />
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
          <span style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.22)" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Full Name */}
          <StyledInput id="full_name" type="text" placeholder="Enter your name" autoComplete="name" register={register("full_name")} focused={!!focused.full_name} {...fo("full_name")} />
          {errors.full_name && <p style={errStyle}>{errors.full_name.message}</p>}

          {/* Email */}
          <StyledInput id="email" type="email" placeholder="Enter your personal or work email" autoComplete="email" register={register("email")} focused={!!focused.email} {...fo("email")} />
          {errors.email && <p style={errStyle}>{errors.email.message}</p>}

          {/* Password */}
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPw ? "text" : "password"}
              {...register("password")}
              placeholder="Create a password (min. 8 chars)"
              autoComplete="new-password"
              {...fo("password")}
              style={{ width: "100%", padding: "13px 40px 13px 14px", borderRadius: "10px", background: S.inputBg, border: `1px solid ${focused.password ? S.inputBorderFocus : S.inputBorder}`, color: S.text, fontFamily: "Inter,sans-serif", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle password" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex", alignItems: "center" }}>
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && <p style={errStyle}>{errors.password.message}</p>}

          {/* Confirm Password */}
          <div style={{ position: "relative" }}>
            <input
              id="confirm_password"
              type={showCPw ? "text" : "password"}
              {...register("confirm_password")}
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...fo("confirm_password")}
              style={{ width: "100%", padding: "13px 40px 13px 14px", borderRadius: "10px", background: S.inputBg, border: `1px solid ${focused.confirm_password ? S.inputBorderFocus : S.inputBorder}`, color: S.text, fontFamily: "Inter,sans-serif", fontSize: "14px", outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" }}
            />
            <button type="button" onClick={() => setShowCPw(!showCPw)} aria-label="Toggle confirm password" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: S.muted, display: "flex", alignItems: "center" }}>
              {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.confirm_password && <p style={errStyle}>{errors.confirm_password.message}</p>}

          {serverError && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(171,35,48,0.12)", border: "1px solid rgba(171,35,48,0.30)", color: "#f87171", fontFamily: "Inter,sans-serif", fontSize: "13px" }}>
              {serverError}
            </div>
          )}

          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            style={{ marginTop: "4px", width: "100%", padding: "14px", borderRadius: "10px", background: S.red, color: "#ffffff", fontFamily: "Inter,sans-serif", fontSize: "15px", fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1, transition: "opacity 0.2s" }}
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : "Get Started"}
          </button>
        </form>

        {/* Footer */}
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "13px", color: S.muted, textAlign: "center", marginTop: "20px" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: S.red, fontWeight: 600, textDecoration: "none" }}>Log In</Link>
        </p>
        <p style={{ fontFamily: "Inter,sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.15)", textAlign: "center", marginTop: "10px" }}>
          By continuing you agree to our{" "}
          <Link href="/terms" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "underline" }}>ToS</Link>{" & "}
          <Link href="/privacy" style={{ color: "rgba(255,255,255,0.25)", textDecoration: "underline" }}>PP</Link>
        </p>
      </motion.div>
    </div>
  );
}
