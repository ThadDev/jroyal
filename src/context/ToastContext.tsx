"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: { border: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.08)", icon: "#22c55e" },
  error:   { border: "rgba(239,68,68,0.3)",  bg: "rgba(239,68,68,0.08)",  icon: "#ef4444" },
  warning: { border: "rgba(234,179,8,0.3)",  bg: "rgba(234,179,8,0.08)",  icon: "#eab308" },
  info:    { border: "rgba(59,130,246,0.3)",  bg: "rgba(59,130,246,0.08)", icon: "#3b82f6" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete timers.current[id];
    }, 5000);
  }, []);

  const dismiss = (id: string) => {
    clearTimeout(timers.current[id]);
    delete timers.current[id];
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Portal — fixed top-right */}
      <div
        style={{
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          maxWidth: "20rem",
          width: "100%",
          pointerEvents: "none",
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            const colors = COLORS[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{   opacity: 0, x: 60,  scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  background: `rgba(10,10,10,0.92)`,
                  border: `1px solid ${colors.border}`,
                  borderLeft: `3px solid ${colors.icon}`,
                  backdropFilter: "blur(12px)",
                  borderRadius: "2px",
                  padding: "0.875rem 1rem",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.625rem",
                  pointerEvents: "auto",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <Icon size={16} style={{ color: colors.icon, flexShrink: 0, marginTop: "1px" }} />
                <p style={{ color: "#F5F0E8", fontSize: "0.8125rem", lineHeight: 1.5, flex: 1, margin: 0 }}>
                  {toast.message}
                </p>
                <button
                  onClick={() => dismiss(toast.id)}
                  style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
