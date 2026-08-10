/**
 * Centralized Branch Configuration
 * ─────────────────────────────────
 * Single source of truth for all per-branch data.
 * Jroyal has two branches, both in Nsukka, Enugu State, Nigeria.
 */

export type BranchId = "grills" | "cafe";

export interface Branch {
  /** Internal identifier */
  id: BranchId;
  /** Full brand name, e.g. "Jroyal Grills n Chops" */
  name: string;
  /** Short qualifier shown on card heading */
  shortName: string;
  /** City label */
  city: string;
  /** Full street address shown in UI + SEO */
  address: string;
  /** Human-readable phone number */
  phone: string;
  /** Digits-only number for wa.me links (no + or spaces) */
  whatsapp: string;
  /** Google Maps iframe embed URL */
  mapsEmbedUrl: string;
  /** Google Maps directions URL (opens in new tab) */
  mapsDirectionsUrl: string;
  /** Hero subtitle paragraph */
  tagline: string;
  /** Small location line under hero tagline */
  heroLocationLine: string;
  /** Established label shown in hero pre-title */
  heroEstLabel: string;
  /** "About" section h2 qualifier */
  aboutShortName: string;
  /** Three about paragraphs for AboutSection */
  aboutParagraphs: [string, string, string];
  /** Floating stat card text in AboutSection */
  aboutStatLabel: string;
  /** Footer brand blurb */
  footerBlurb: string;
  /** CTABanner headline on the home page */
  ctaBannerTitle: string;
  /** Per-branch SEO description used in metadata */
  seoDescription: string;
}

// ─── Branch definitions ────────────────────────────────────────────────────

export const BRANCHES: Record<BranchId, Branch> = {
  grills: {
    id: "grills",
    name: "Jroyal Grills n Chops",
    shortName: "Grills n Chops",
    city: "Nsukka",
    address: "Behind Flats, Nsukka, Enugu State, Nigeria",
    phone: "+234 705 966 6459",
    whatsapp:
      (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "") ||
      "2347059666459",
    mapsEmbedUrl:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
      "https://maps.google.com/maps?q=jroyal+nsukka&output=embed&ftid=0x1044e7896dd9098d:0x46821b79fa456ed8",
    mapsDirectionsUrl:
      "https://www.google.com/maps/place/jroyal+nsukka/data=!4m2!3m1!1s0x1044e7896dd9098d:0x46821b79fa456ed8",
    tagline:
      "Premium grills, smoky chops, and bold Nigerian flavours right behind Flats Nsukka. A destination for sizzling plates, unforgettable evenings, and warm hospitality.",
    heroLocationLine: "Behind Flats, Nsukka • Open from 4PM daily",
    heroEstLabel: "Est. Nsukka, Nigeria",
    aboutShortName: "Grills n Chops",
    aboutParagraphs: [
      "Jroyal Grills n Chops was born from a deep passion for exceptional grilled meats and the rich, vibrant flavours of Nigerian cuisine. What started as a bold culinary vision has grown into one of Nsukka's most celebrated dining spots.",
      "Nestled behind Flats in the heart of Nsukka, we have served thousands of guests — from intimate hangouts to grand celebrations — always with the same warmth, excellence, and authenticity that defines us.",
      "Our expert grill masters draw inspiration from across Nigeria and the continent, crafting bold, smoky menus that honour tradition while embracing contemporary flavours.",
    ],
    aboutStatLabel: "Years of grilling excellence in Nsukka",
    footerBlurb:
      "A premium grilling destination celebrating the finest in Nigerian cuisine and continental flavours, behind Flats Nsukka.",
    ctaBannerTitle: "Ready to Experience Jroyal Grills n Chops?",
    seoDescription:
      "Experience exceptional grills, smoky chops, private events, and outside catering at Jroyal Grills n Chops — behind Flats, Nsukka.",
  },

  cafe: {
    id: "cafe",
    name: "Cafe by Jroyal",
    shortName: "Cafe",
    city: "Nsukka",
    address: "Hilltop, Nsukka, Enugu State, Nigeria",
    phone: "+234 705 966 6459",
    whatsapp: "2347059666459",
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=Hilltop+Nsukka+Enugu+Nigeria&output=embed",
    mapsDirectionsUrl:
      "https://maps.google.com/maps?q=Hilltop+Nsukka+Enugu+Nigeria",
    tagline:
      "A serene café experience with premium drinks, light bites, and breathtaking hilltop views. The perfect escape for relaxed dining and vibrant social moments in Nsukka.",
    heroLocationLine: "Hilltop, Nsukka • Open from 10AM daily",
    heroEstLabel: "Est. Nsukka, Nigeria",
    aboutShortName: "Jroyal Cafe",
    aboutParagraphs: [
      "Jroyal Cafe brings a refined café culture to the heights of Nsukka, offering premium drinks, artisan light bites, and a welcoming atmosphere that sets us apart.",
      "Perched at Hilltop, our café is a haven for those who appreciate quality and ambiance — whether catching up with friends, working remotely, or simply soaking in the view with a great cup of coffee.",
      "Every menu item is crafted with care, drawing from local ingredients and global café trends to deliver an experience that feels both familiar and extraordinary.",
    ],
    aboutStatLabel: "Years of café excellence in Nsukka",
    footerBlurb:
      "A premium café destination offering artisan drinks, light bites, and warm hospitality atop Hilltop, Nsukka.",
    ctaBannerTitle: "Ready to Visit Jroyal Cafe?",
    seoDescription:
      "Experience premium drinks, light bites, and a relaxed hilltop atmosphere at Jroyal Cafe — Hilltop, Nsukka.",
  },
};

/** Default branch rendered on SSR (best for SEO — canonical location) */
export const DEFAULT_BRANCH_ID: BranchId = "grills";
export const DEFAULT_BRANCH: Branch = BRANCHES[DEFAULT_BRANCH_ID];

/** localStorage key */
export const BRANCH_STORAGE_KEY = "jroyal_selected_branch";
