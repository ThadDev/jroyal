"use client";

/**
 * LocationSelector — Premium Fullscreen Branch Selector
 * Fits entirely within a single viewport — no scrolling required.
 *
 * Jroyal has two branches in Nsukka:
 *  • Jroyal Grills n Chops — Behind Flats, Nsukka
 *  • Jroyal Cafe           — Hilltop, Nsukka
 */

import { useState, useEffect, type FC } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Flame, Coffee, ArrowRight } from "lucide-react";
import { useBranch } from "@/context/BranchContext";
import { BRANCHES, BranchId } from "@/lib/branches";

// ─── Card data ─────────────────────────────────────────────────────────────

const CARDS: {
  id: BranchId;
  Icon: FC<{ size?: number; className?: string }>;
  tagline: string;
  accentColor: string;
  accentColorDim: string;
  badgeLabel: string;
  imageSrc: string;
  imageAlt: string;
}[] = [
    {
      id: "grills",
      Icon: Flame,
      tagline: "Smoky grills & bold Nigerian flavours",
      accentColor: "#D4A832",
      accentColorDim: "rgba(212,168,50,0.08)",
      badgeLabel: "Grills & Chops",
      imageSrc: "/grills.png",
      imageAlt: "Jroyal Grills n Chops",
    },
    {
      id: "cafe",
      Icon: Coffee,
      tagline: "Artisan drinks & hilltop views",
      accentColor: "#AB2330",
      accentColorDim: "rgba(171,35,48,0.08)",
      badgeLabel: "Café",
      imageSrc: "/cafe.png",
      imageAlt: "Jroyal Cafe",
    },
  ];

// ─── Component ─────────────────────────────────────────────────────────────

export default function LocationSelector() {
  const { showSelector, selectBranch } = useBranch();
  const [selecting, setSelecting] = useState<BranchId | null>(null);
  const [exiting, setExiting] = useState(false);

  // ── Lock body scroll while selector is visible ──────────────────────────
  useEffect(() => {
    if (showSelector) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSelector]);

  if (!showSelector) return null;

  const handleSelect = (id: BranchId) => {
    if (selecting) return;
    setSelecting(id);
    setTimeout(() => {
      setExiting(true);
      setTimeout(() => selectBranch(id), 400);
    }, 320);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="location-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] flex flex-col overflow-hidden"
          style={{ backgroundColor: "#080808" }}
          id="location-selector-overlay"
          aria-modal="true"
          role="dialog"
          aria-label="Select your Jroyal branch"
        >
          {/* Ambient glows */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                "radial-gradient(ellipse 40% 55% at 25% 60%, rgba(212,168,50,0.045) 0%, transparent 70%)",
                "radial-gradient(ellipse 40% 55% at 75% 60%, rgba(171,35,48,0.045) 0%, transparent 70%)",
              ].join(", "),
            }}
          />

          {/* Top shimmer line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] shimmer-gold opacity-50" />

          {/* ── HEADER ── */}
          <motion.header
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
            className="flex flex-col items-center text-center flex-shrink-0"
            style={{ padding: "clamp(14px, 3.5vh, 28px) 16px clamp(10px, 2vh, 18px)" }}
          >
            {/* Logo */}
            <Image
              src="/logo.png"
              alt="Jroyal"
              width={88}
              height={40}
              className="object-contain mb-3"
              style={{ opacity: 0.82 }}
              priority
            />

            {/* Headline */}
            <h1
              className="font-serif font-bold leading-none text-gold-500"
              style={{ fontSize: "clamp(1.45rem, 4vw, 2.6rem)", letterSpacing: "-0.01em" }}
            >
              Select Branch
            </h1>

            <p
              className="mt-1.5 tracking-wide"
              style={{
                fontSize: "clamp(0.6rem, 1.8vw, 0.72rem)",
                color: "rgba(255,255,255,0.36)",
                letterSpacing: "0.06em",
              }}
            >
              Two locations in Nsukka — pick the one that calls to you
            </p>

            {/* Gradient divider */}
            <div
              className="mt-3 w-32 sm:w-44 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D4A832 30%, #AB2330 70%, transparent)",
              }}
            />
          </motion.header>

          {/* ── CARDS — fill remaining height ── */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6 }}
            className="flex-1 grid grid-cols-1 md:grid-cols-2 min-h-0"
            style={{ gap: "clamp(6px, 1.5vw, 14px)", padding: "0 clamp(10px, 2.5vw, 20px) clamp(8px, 2vh, 16px)" }}
          >
            {CARDS.map((card, i) => {
              const branch = BRANCHES[card.id];
              const isSelected = selecting === card.id;
              const BranchIcon = card.Icon;

              return (
                <motion.button
                  key={card.id}
                  id={`location-card-${card.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 + i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.988 }}
                  onClick={() => handleSelect(card.id)}
                  className="group relative flex flex-col overflow-hidden text-left focus-visible:outline-none min-h-0 h-full"
                  style={{
                    borderRadius: "16px",
                    border: `1px solid ${
                      isSelected
                        ? card.accentColor + "60"
                        : "rgba(255,255,255,0.07)"
                    }`,
                    backgroundColor: "#111111",
                    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                    boxShadow: isSelected
                      ? `0 0 0 1px ${card.accentColor}30, 0 8px 32px rgba(0,0,0,0.5)`
                      : "0 4px 20px rgba(0,0,0,0.4)",
                  }}
                  aria-label={`Select ${branch.name}`}
                >
                  {/* Hover inner glow border */}
                  <div
                    className="absolute inset-0 rounded-[16px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 1px ${card.accentColor}30` }}
                  />

                  {/* ── Image area ── */}
                  <div
                    className="relative flex-shrink-0 overflow-hidden"
                    style={{
                      height: "clamp(130px, 38%, 220px)",
                      borderRadius: "16px 16px 0 0",
                    }}
                  >
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      priority
                      quality={85}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Bottom gradient fade into card body */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)",
                      }}
                    />

                    {/* Accent hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${card.accentColorDim} 0%, transparent 65%)`,
                      }}
                    />

                    {/* ── Category badge — integrated into image ── */}
                    <div className="absolute bottom-2.5 left-3">
                      <span
                        className="inline-flex items-center gap-1.5 uppercase font-semibold backdrop-blur-md"
                        style={{
                          fontSize: "clamp(0.5rem, 1.6vw, 0.6rem)",
                          letterSpacing: "0.2em",
                          color: card.accentColor,
                          backgroundColor: "rgba(8,8,8,0.7)",
                          border: `1px solid ${card.accentColor}50`,
                          borderRadius: "4px",
                          padding: "3px 8px 3px 6px",
                        }}
                      >
                        <BranchIcon size={8} />
                        {card.badgeLabel}
                      </span>
                    </div>

                    {/* Selected ring overlay */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: `inset 0 0 0 2px ${card.accentColor}70`,
                        }}
                      />
                    )}
                  </div>

                  {/* ── Card body ── */}
                  <div
                    className="flex flex-col flex-1 min-h-0"
                    style={{
                      padding: "clamp(10px, 2vh, 16px) clamp(12px, 2.5vw, 20px) clamp(10px, 2vh, 16px)",
                      backgroundColor: isSelected ? card.accentColorDim : "transparent",
                      transition: "background-color 0.3s ease",
                      gap: "clamp(6px, 1.5vh, 10px)",
                    }}
                  >
                    {/* Branch name + tagline */}
                    <div>
                      <h2
                        className="font-serif font-bold leading-tight"
                        style={{
                          fontSize: "clamp(0.95rem, 3vw, 1.4rem)",
                          color: "#F5F0E8",
                          marginBottom: "3px",
                        }}
                      >
                        {branch.name}
                      </h2>
                      <p
                        className="leading-snug"
                        style={{
                          fontSize: "clamp(0.62rem, 1.8vw, 0.72rem)",
                          color: "rgba(255,255,255,0.42)",
                        }}
                      >
                        {card.tagline}
                      </p>
                    </div>

                    {/* Location — visually subordinate but distinct */}
                    <p
                      className="flex items-center gap-1.5"
                      style={{
                        fontSize: "clamp(0.58rem, 1.6vw, 0.65rem)",
                        color: "rgba(255,255,255,0.3)",
                        lineHeight: 1.35,
                      }}
                    >
                      <MapPin
                        size={9}
                        className="flex-shrink-0"
                        style={{ color: card.accentColor, opacity: 0.8 }}
                      />
                      {branch.address}
                    </p>

                    {/* ── SELECT CTA ── */}
                    <div
                      className="flex items-center justify-between mt-auto"
                      style={{
                        paddingTop: "clamp(6px, 1.2vh, 10px)",
                        borderTop: `1px solid ${card.accentColor}18`,
                      }}
                    >
                      <span
                        className="font-semibold uppercase tracking-[0.2em]"
                        style={{
                          fontSize: "clamp(0.58rem, 1.7vw, 0.68rem)",
                          color: isSelected ? "#F5F0E8" : card.accentColor,
                          transition: "color 0.25s ease",
                        }}
                      >
                        {isSelected ? "Confirmed ✓" : "Select"}
                      </span>

                      {!isSelected && (
                        <span
                          className="flex items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            border: `1px solid ${card.accentColor}50`,
                            color: card.accentColor,
                            flexShrink: 0,
                          }}
                        >
                          <ArrowRight size={11} />
                        </span>
                      )}

                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center justify-center"
                          style={{
                            width: "26px",
                            height: "26px",
                            borderRadius: "50%",
                            backgroundColor: card.accentColor,
                            color: "#080808",
                            flexShrink: 0,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </motion.span>
                      )}
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
            transition={{ delay: 0.75, duration: 0.5 }}
            className="text-center flex-shrink-0"
            style={{
              fontSize: "clamp(0.48rem, 1.3vw, 0.58rem)",
              color: "rgba(255,255,255,0.14)",
              padding: "0 16px clamp(6px, 1.5vh, 12px)",
            }}
          >
            Preference saved locally — change anytime from the menu.
          </motion.p>

          {/* Bottom shimmer line */}
          <div className="absolute bottom-0 left-0 right-0 h-px shimmer-gold opacity-15" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
