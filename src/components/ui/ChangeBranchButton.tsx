"use client";

import { MapPin } from "lucide-react";
import { useBranch } from "@/context/BranchContext";

interface Props {
  /** Visual variant for placement context */
  variant?: "navbar" | "footer";
}

/**
 * ChangeBranchButton
 * ──────────────────
 * Tiny "Change Location" trigger that resets the saved branch and re-shows
 * the LocationSelector overlay. Place in Navbar and Footer.
 */
export default function ChangeBranchButton({ variant = "footer" }: Props) {
  const { resetBranch, branch } = useBranch();

  const isNavbar = variant === "navbar";

  return (
    <button
      id="change-branch-btn"
      onClick={resetBranch}
      aria-label="Change restaurant location"
      className={
        isNavbar
          ? "flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-gold-500 transition-colors duration-200 font-light"
          : "flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-white/25 hover:text-gold-500 transition-colors duration-200 font-light"
      }
    >
      <MapPin size={10} className="flex-shrink-0" />
      <span>{branch.city} · Change</span>
    </button>
  );
}
