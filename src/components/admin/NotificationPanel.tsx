"use client";
import { useAdminSocket, type AdminEvent } from "@/hooks/useAdminSocket";
import { useState } from "react";
import { BellRing, Users, CalendarDays, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_ICONS = {
  new_signup:      { icon: Users, color: "#3b82f6", label: "New Signup" },
  new_reservation: { icon: CalendarDays, color: "#22c55e", label: "New Reservation" },
  new_order:       { icon: ShoppingCart, color: "#C9A84C", label: "New Order" },
};

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function AdminNotificationPanel() {
  const [events, setEvents] = useState<AdminEvent[]>([]);

  useAdminSocket((event) => {
    setEvents((prev) => [event, ...prev].slice(0, 20));
  });

  const clearAll = () => setEvents([]);

  return (
    <div className="bg-charcoal border border-white/5">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BellRing size={16} className="text-gold-500" />
          <h2 className="font-serif text-base text-white">Live Notifications</h2>
          {events.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-gold-500/20 text-gold-400 rounded-sm">
              {events.length}
            </span>
          )}
          <span className="flex items-center gap-1 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/30 text-xs">Live</span>
          </span>
        </div>
        {events.length > 0 && (
          <button onClick={clearAll} className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1 transition-colors">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {events.length === 0 ? (
            <div className="px-6 py-8 text-center text-white/20 text-sm">
              Waiting for live events…
            </div>
          ) : (
            events.map((evt, i) => {
              const meta = EVENT_ICONS[evt.type];
              const Icon = meta?.icon ?? BellRing;
              return (
                <motion.div
                  key={`${evt.timestamp}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3 px-6 py-3 border-b border-white/5 last:border-0"
                >
                  <div
                    style={{ background: `${meta?.color ?? "#C9A84C"}18`, border: `1px solid ${meta?.color ?? "#C9A84C"}30` }}
                    className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                  >
                    <Icon size={14} style={{ color: meta?.color ?? "#C9A84C" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/80">
                      {meta?.label ?? "Event"}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5 truncate">
                      {evt.payload.name ?? evt.payload.email ?? JSON.stringify(evt.payload)}
                    </p>
                  </div>
                  <span className="text-white/20 text-xs flex-shrink-0 mt-0.5">{timeAgo(evt.timestamp)}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
