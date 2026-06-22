"use client";

/**
 * LocationSelector — Premium Fullscreen Branch Selector
 * ───────────────────────────────────────────────────────
 * Renders as a fixed overlay above all content until the user selects
 * a branch. Uses only existing design-system classes + Framer Motion.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowRight, Star } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { BRANCHES, BranchId } from "@/lib/branches";

// ─── Card data ────────────────────────────────────────────────────────────

const CARDS: {
  id: BranchId;
  city: string;
  emoji: string;
  tagline: string;
}[] = [
  {
    id: "nsukka",
    city: "Nsukka",
    emoji: "🏛️",
    tagline: "Our original landmark destination",
  },
  {
    id: "enugu",
    city: "Enugu",
    emoji: "✨",
    tagline: "Premium dining in Enugu GRA",
  },
];

// ─── Component ────────────────────────────────────────────────────────────

export default function LocationSelector() {
  const { showSelector, selectBranch } = useBranch();
  const [selecting, setSelecting] = useState<BranchId | null>(null);
  const [exiting, setExiting] = useState(false);

  if (!showSelector) return null;

  const handleSelect = (id: BranchId) => {
    if (selecting) return; // prevent double-tap
    setSelecting(id);
    // Let the card "confirm" animation play, then fade out the overlay
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => selectBranch(id), 450);
    }, 300);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="location-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-y-auto"
          style={{ backgroundColor: "#0A0A0A" }}
          id="location-selector-overlay"
          aria-modal="true"
          role="dialog"
          aria-label="Select your Jroyal Grills location"
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 60%, rgba(201,168,76,0.07) 0%, transparent 70%)",
            }}
          />

          {/* Top decorative line */}
          <div className="absolute top-0 left-0 right-0 h-px shimmer-gold opacity-40" />

          {/* Content wrapper */}
          <div className="relative z-10 flex flex-col items-center px-4 py-16 w-full max-w-5xl mx-auto">
            {/* Stars + label */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="h-px w-10 bg-gold-700/50" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={9} className="fill-gold-500 text-gold-500" />
                ))}
              </div>
              <span className="text-gold-500 text-[10px] tracking-[0.35em] uppercase font-light">
                Select Your Location
              </span>
              <div className="h-px w-10 bg-gold-700/50" />
            </motion.div>

            {/* Brand heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.9 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white text-center leading-[1.1] mb-3"
            >
              Mama{" "}
              <span className="gold-gradient-text italic">Onyinye</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.7 }}
              className="text-white/40 text-sm tracking-widest uppercase mb-14 text-center"
            >
              Fine Dining &amp; Events
            </motion.p>

            {/* Branch cards */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl"
            >
              {CARDS.map((card, i) => {
                const branch = BRANCHES[card.id];
                const isSelected = selecting === card.id;

                return (
                  <motion.button
                    key={card.id}
                    id={`location-card-${card.id}`}
                    onClick={() => handleSelect(card.id)}
                    whileHover={{ scale: 1.025, y: -3 }}
                    whileTap={{ scale: 0.975 }}
                    animate={
                      isSelected
                        ? { scale: 1.04, borderColor: "rgba(201,168,76,0.9)" }
                        : {}
                    }
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                    className="group relative text-left cursor-pointer focus-visible:outline-none"
                    aria-label={`Select ${branch.name} in ${branch.city}`}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {/* Card body */}
                    <div
                      className="relative h-full border transition-all duration-300 p-8 flex flex-col gap-6 overflow-hidden"
                      style={{
                        backgroundColor: "#1A1A1A",
                        borderColor: isSelected
                          ? "rgba(201,168,76,0.7)"
                          : "rgba(201,168,76,0.15)",
                      }}
                    >
                      {/* Hover glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)",
                        }}
                      />

                      {/* Selection confirmed ring */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            boxShadow: "inset 0 0 0 2px rgba(201,168,76,0.6)",
                          }}
                        />
                      )}

                      {/* Top: icon + city */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-3xl mb-3 block">{card.emoji}</span>
                          <p className="text-gold-500 text-[10px] tracking-[0.3em] uppercase font-light mb-1">
                            {card.city}, Nigeria
                          </p>
                          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                            {branch.shortName}
                          </h2>
                        </div>

                        {/* Arrow */}
                        <div
                          className="w-10 h-10 border flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:border-gold-500 group-hover:text-gold-500 mt-1"
                          style={{
                            borderColor: "rgba(201,168,76,0.25)",
                            color: "rgba(255,255,255,0.3)",
                          }}
                        >
                          <ArrowRight
                            size={16}
                            className="group-hover:translate-x-0.5 transition-transform duration-200"
                          />
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className="h-px w-full transition-all duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(201,168,76,0.3), transparent)",
                          opacity: 0.5,
                        }}
                      />

                      {/* Bottom: name + address */}
                      <div>
                        <p className="text-white/80 text-sm font-medium mb-2">
                          {branch.name}
                        </p>
                        <p className="text-white/35 text-xs leading-relaxed flex items-start gap-1.5">
                          <MapPin size={11} className="text-gold-700 mt-0.5 flex-shrink-0" />
                          {branch.address}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Footnote */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="mt-10 text-white/20 text-xs text-center tracking-wide"
            >
              Your preference is saved locally. You can change it anytime.
            </motion.p>
          </div>

          {/* Bottom decorative line */}
          <div className="absolute bottom-0 left-0 right-0 h-px shimmer-gold opacity-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
