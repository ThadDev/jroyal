/**
 * Centralized Branch Configuration
 * ─────────────────────────────────
 * Single source of truth for all per-branch data.
 * Add future branches here — components pick them up automatically.
 */

export type BranchId = "nsukka" | "enugu";

export interface Branch {
  /** Internal identifier */
  id: BranchId;
  /** Full brand name, e.g. "Jroyal Grills" */
  name: string;
  /** Short qualifier, e.g. "Nsukka" */
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
  nsukka: {
    id: "nsukka",
    name: "Jroyal Grills",
    shortName: "Nsukka",
    city: "Nsukka",
    address:
      "Opposite Flat Gate, Behind Flat, Nsukka, 410001, Enugu State, Nigeria",
    phone: "+234 705 966 6459",
    // NEXT_PUBLIC_ vars are inlined at build time — safe to reference here
    whatsapp:
      (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "") ||
      "2347059666459",
    mapsEmbedUrl:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
      "https://maps.google.com/maps?q=Opposite+Flat+Gate+Behind+Flat+Nsukka+Enugu+Nigeria&output=embed",
    mapsDirectionsUrl:
      "https://maps.google.com/maps?q=Opposite+Flat+Gate+Behind+Flat+Nsukka+Enugu+Nigeria",
    tagline:
      "Premium grills, Nigerian & continental cuisine in the heart of Nsukka. A destination for exceptional dining, unforgettable events, and warm hospitality.",
    heroLocationLine: "Behind Flat Gate, Nsukka • Open from 4PM daily",
    heroEstLabel: "Est. Nsukka, Nigeria",
    aboutShortName: "Jroyal",
    aboutParagraphs: [
      "Jroyal Grills was born from a passion for crafting extraordinary grilled meats and sharing the rich, vibrant flavours of Nigerian cuisine. What started as a bold culinary vision has grown into one of Nsukka's most celebrated dining destinations.",
      "Nestled in the heart of Nsukka, we have served thousands of guests — from intimate family gatherings to grand corporate events — always with the same warmth, excellence, and authenticity that defines us.",
      "Our expert grill masters draw inspiration from across Nigeria and the continent, crafting menus that honour tradition while embracing bold, contemporary flavours.",
    ],
    aboutStatLabel: "Years of culinary excellence in Nsukka",
    footerBlurb:
      "A premium grilling destination celebrating the finest in Nigerian cuisine and continental flavours, in the heart of Nsukka.",
    ctaBannerTitle: "Ready to Experience Jroyal Grills?",
    seoDescription:
      "Experience exceptional grills, private events, and outside catering at Jroyal Grills — Nsukka's premier restaurant. Opposite Flat Gate, Behind Flat, Nsukka.",
  },

  enugu: {
    id: "enugu",
    name: "Jroyal Grills",
    shortName: "Enugu",
    city: "Enugu",
    address: "Enugu, Enugu State, Nigeria",
    phone: "+234 705 966 6459",
    whatsapp: "2347059666459",
    mapsEmbedUrl:
      "https://maps.google.com/maps?q=Jroyal+Grills+Enugu+Nigeria&output=embed",
    mapsDirectionsUrl:
      "https://maps.google.com/maps?q=Jroyal+Grills+Enugu+Nigeria",
    tagline:
      "The same legendary grills and flavours that made Jroyal Grills famous, now in Enugu. Fine dining, events, and warm Nigerian hospitality.",
    heroLocationLine: "Enugu • Open from 4PM daily",
    heroEstLabel: "Est. Enugu, Nigeria",
    aboutShortName: "Jroyal",
    aboutParagraphs: [
      "Jroyal Grills brings the same legendary flavours and premium grilling experience to Enugu. Our Enugu location is a testament to our mission: making exceptional Nigerian cuisine and grills accessible across the nation.",
      "We serve discerning guests who demand the finest — from intimate lunches to vibrant dinner gatherings — all wrapped in the warm, authentic hospitality that defines the Jroyal experience.",
      "Our culinary team draws from a rich tradition of Nigerian and continental cooking, delivering menus that honour heritage while embracing the contemporary palate.",
    ],
    aboutStatLabel: "Years of culinary excellence",
    footerBlurb:
      "A premium grilling destination celebrating the finest in Nigerian cuisine and continental flavours in Enugu.",
    ctaBannerTitle: "Ready to Experience Jroyal Grills?",
    seoDescription:
      "Experience exceptional grills, private events, and outside catering at Jroyal Grills Enugu — fine dining and warm Nigerian hospitality.",
  },
};

/** Default branch rendered on SSR (best for SEO — canonical location) */
export const DEFAULT_BRANCH_ID: BranchId = "nsukka";
export const DEFAULT_BRANCH: Branch = BRANCHES[DEFAULT_BRANCH_ID];

/** localStorage key */
export const BRANCH_STORAGE_KEY = "jroyal_selected_branch";
