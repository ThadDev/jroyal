"use client";

/**
 * BranchContext
 * ─────────────
 * Provides the currently selected branch to all client components.
 *
 * SEO strategy:
 *  - SSR always renders the DEFAULT_BRANCH (Nsukka/Landmark) which is the
 *    canonical location and is fully indexed by search engines.
 *  - On client mount we hydrate from localStorage silently.
 *  - If no branch has been saved yet, showSelector → true so the
 *    LocationSelector overlay appears.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  BRANCH_STORAGE_KEY,
  BRANCHES,
  BranchId,
  Branch,
  DEFAULT_BRANCH,
  DEFAULT_BRANCH_ID,
} from "@/lib/branches";

// ─── Types ────────────────────────────────────────────────────────────────

interface BranchContextValue {
  /** The currently active branch data object */
  branch: Branch;
  /** true while we haven't yet resolved localStorage (SSR + 1st frame) */
  isLoading: boolean;
  /** true when the location selector overlay should be visible */
  showSelector: boolean;
  /** Select a branch and persist it */
  selectBranch: (id: BranchId) => void;
  /** Clear the saved branch → selector reappears */
  resetBranch: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────

const BranchContext = createContext<BranchContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────

export function BranchProvider({ children }: { children: React.ReactNode }) {
  // Start with the default branch so SSR output matches the initial client
  // render — no hydration mismatch.
  const [branch, setBranch] = useState<Branch>(DEFAULT_BRANCH);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  // Hydrate from localStorage on first client render only
  useEffect(() => {
    try {
      const saved = localStorage.getItem(BRANCH_STORAGE_KEY) as BranchId | null;
      if (saved && BRANCHES[saved]) {
        setBranch(BRANCHES[saved]);
        setShowSelector(false);
      } else {
        // No saved preference → show the selector
        setShowSelector(true);
      }
    } catch {
      // localStorage unavailable (e.g. private mode restriction)
      setShowSelector(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectBranch = useCallback((id: BranchId) => {
    const selected = BRANCHES[id] ?? BRANCHES[DEFAULT_BRANCH_ID];
    setBranch(selected);
    setShowSelector(false);
    try {
      localStorage.setItem(BRANCH_STORAGE_KEY, id);
    } catch {
      /* noop */
    }
  }, []);

  const resetBranch = useCallback(() => {
    try {
      localStorage.removeItem(BRANCH_STORAGE_KEY);
    } catch {
      /* noop */
    }
    setShowSelector(true);
  }, []);

  return (
    <BranchContext.Provider
      value={{ branch, isLoading, showSelector, selectBranch, resetBranch }}
    >
      {children}
    </BranchContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useBranch(): BranchContextValue {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useBranch must be used inside <BranchProvider>");
  }
  return ctx;
}
