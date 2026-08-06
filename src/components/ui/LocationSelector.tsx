"use client";

/**
 * LocationSelector — Premium Fullscreen Branch Selector
 * Fits entirely within a single viewport — no scrolling required.
 *
 * Jroyal has two branches in Nsukka:
 *  • Jroyal Grills n Chops — Behind Flats, Nsukka
 *  • Jroyal Cafe           — Hilltop, Nsukka
 */

import { useState, type FC } from "react";
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
      accentColorDim: "rgba(212,168,50,0.10)",
      badgeLabel: "Grills & Chops",
      imageSrc: "/grills.png",
      imageAlt: "Jroyal Grills n Chops",
    },
    {
      id: "cafe",
      Icon: Coffee,
      tagline: "Artisan drinks & hilltop views",
      accentColor: "#AB2330",
      accentColorDim: "rgba(171,35,48,0.10)",
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
          // h-screen + overflow-hidden = exactly one viewport, no scroll
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
                "radial-gradient(ellipse 45% 50% at 25% 50%, rgba(212,168,50,0.05) 0%, transparent 70%)",
                "radial-gradient(ellipse 45% 50% at 75% 50%, rgba(171,35,48,0.05) 0%, transparent 70%)",
              ].join(", "),
            }}
          />

          {/* Top shimmer */}
          <div className="absolute top-0 left-0 right-0 h-[2px] shimmer-gold opacity-60" />

          {/* ── HEADER ── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6 }}
            className="flex flex-col items-center text-center px-4 pt-8 pb-5 flex-shrink-0"
          >

            {/* Logo — secondary, smaller */}
            <Image
              src="/logo.png"
              alt="Jroyal"
              width={100}
              height={45}
              className="object-contain opacity-70 mb-4"
              priority
            />
            {/* Headline — biggest, first thing eyes land on */}
            <h1
              className="font-serif font-bold leading-tight mb-1 text-gold-500"
              style={{
                fontSize: "clamp(1.8rem, 4.5vw, 3rem)",

              }}
            >
              Select Branch
            </h1>

            <p
              className="text-xs tracking-wide mb-4"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              Two locations in Nsukka — pick the one that calls to you
            </p>



            {/* Divider */}
            <div
              className="mt-5 w-48 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #D4A832 35%, #AB2330 65%, transparent)",
              }}
            />
          </motion.div>

          {/* ── CARDS — fill remaining height ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.65 }}
            className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4 min-h-0"
          >
            {CARDS.map((card, i) => {
              const branch = BRANCHES[card.id];
              const isSelected = selecting === card.id;
              const BranchIcon = card.Icon;

              return (
                <motion.button
                  key={card.id}
                  id={`location-card-${card.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.1, duration: 0.55 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleSelect(card.id)}
                  className="group relative flex flex-col overflow-hidden text-left focus-visible:outline-none h-full"
                  style={{
                    border: `1px solid ${isSelected
                      ? card.accentColor + "88"
                      : "rgba(255,255,255,0.08)"
                      }`,
                    transition: "border-color 0.3s ease",
                    backgroundColor: "#111111",
                  }}
                  aria-label={`Select ${branch.name}`}
                >
                  {/* Hover border highlight */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${card.accentColor}44`,
                    }}
                  />

                  {/* ── Image — top 55% of card ── */}
                  <div className="relative flex-shrink-0" style={{ height: "52%" }}>
                    <Image
                      src={card.imageSrc}
                      alt={card.imageAlt}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Bottom fade */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
                      }}
                    />
                    {/* Colour accent fade on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                      style={{
                        background: `linear-gradient(135deg, ${card.accentColorDim} 0%, transparent 60%)`,
                      }}
                    />
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[9px] tracking-[0.28em] uppercase font-semibold px-2.5 py-1 backdrop-blur-sm"
                        style={{
                          color: card.accentColor,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          border: `1px solid ${card.accentColor}44`,
                        }}
                      >
                        <BranchIcon size={8} />
                        {card.badgeLabel}
                      </span>
                    </div>
                    {/* Selected ring */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: `inset 0 0 0 2px ${card.accentColor}88`,
                        }}
                      />
                    )}
                  </div>

                  {/* ── Card body — bottom 45% ── */}
                  <div
                    className="flex flex-col flex-1 px-5 py-4 gap-3 min-h-0"
                    style={{
                      backgroundColor: isSelected
                        ? card.accentColorDim
                        : "transparent",
                      transition: "background-color 0.3s ease",
                    }}
                  >
                    {/* Name + tagline */}
                    <div className="flex-1 min-h-0">
                      <h2
                        className="font-serif font-bold leading-tight mb-1"
                        style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", color: "#F5F0E8" }}
                      >
                        {branch.name}
                      </h2>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {card.tagline}
                      </p>
                    </div>

                    {/* Address */}
                    <p
                      className="text-[11px] flex items-start gap-1.5"
                      style={{ color: "rgba(255,255,255,0.28)" }}
                    >
                      <MapPin
                        size={10}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: card.accentColor }}
                      />
                      {branch.address}
                    </p>

                    {/* SELECT button */}
                    <div
                      className="flex items-center justify-between py-2.5 px-4 transition-all duration-300"
                      style={{
                        backgroundColor: isSelected
                          ? card.accentColor
                          : "transparent",
                        border: `1.5px solid ${card.accentColor}`,
                        color: isSelected ? "#080808" : card.accentColor,
                      }}
                    >
                      <span
                        className="text-xs font-bold tracking-[0.18em] uppercase"
                      >
                        {isSelected ? "Confirmed ✓" : "Select"}
                      </span>
                      {!isSelected && (
                        <ArrowRight
                          size={13}
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        />
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
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-[10px] pb-3 flex-shrink-0"
            style={{ color: "rgba(255,255,255,0.15)" }}
          >
            Your preference is saved locally — change it anytime from the menu.
          </motion.p>

          {/* Bottom shimmer */}
          <div className="absolute bottom-0 left-0 right-0 h-px shimmer-gold opacity-20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
