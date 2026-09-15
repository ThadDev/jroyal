# Jroyal Web Application — Full Product Audit Report

**Prepared by:** Senior Product Tester / Project Manager (AI Audit)
**Date:** 7 August 2026
**Codebase Location:** `c:\Users\USER\Desktop\jroyal`
**Runtime:** Node.js (custom `server.js` entry) · Next.js 16 · React 19
**Status:** Active Development · Dev server running

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Feature Inventory](#4-feature-inventory)
5. [Route Map](#5-route-map)
6. [Data Model](#6-data-model)
7. [Security Assessment](#7-security-assessment)
8. [Performance Assessment](#8-performance-assessment)
9. [UX & Design Review](#9-ux--design-review)
10. [Code Quality & Maintainability](#10-code-quality--maintainability)
11. [Identified Issues & Gaps (Loopholes)](#11-identified-issues--gaps-loopholes)
12. [Recommendations & Priority Matrix](#12-recommendations--priority-matrix)
13. [Summary Scorecard](#13-summary-scorecard)

---

## 1. Project Overview

**Jroyal** is a premium restaurant web application for two physical dining establishments in Nsukka, Enugu State, Nigeria:

| Branch | Location | Character |
|---|---|---|
| **Jroyal Grills n Chops** | Behind Flats, Nsukka | Smoky grills, Nigerian cuisine, evening dining |
| **Cafe by Jroyal** | Hilltop, Nsukka | Artisan drinks, light bites, café culture |

The product serves **two distinct audiences**:

- **Public / Customers** — discover the brand, view the menu, make table reservations, place online orders, and read blog content.
- **Admin / Staff** — manage reservations, orders, gallery, blog posts, and users through a password-protected back-office dashboard.

The application is a **full-stack Next.js monolith** — the frontend, backend API routes, auth logic, email delivery, real-time notifications, and admin panel all live within the same codebase.

---

## 2. Technology Stack

### Core Framework
| Layer | Technology | Version |
|---|---|---|
| Framework | **Next.js** (App Router) | `^16.1.6` |
| UI Library | **React** | `^19.0.0` |
| Language | **TypeScript** | `^5` |
| Styling | **Tailwind CSS** | `^3.4.1` |
| Fonts | **next/font/google** (Playfair Display + Inter) | Built-in |

### Backend & Data
| Layer | Technology | Notes |
|---|---|---|
| Database | **Supabase** (PostgreSQL) | Hosted BaaS · Row-Level Security |
| Auth | **Supabase Auth** + `@supabase/ssr` | Cookie-based sessions, OAuth-ready |
| File Storage | Supabase Storage (via remote image patterns) | Images served from `*.supabase.co` |
| Email | **Resend** | Transactional only (no marketing) |
| Real-time | **Socket.IO** (`socket.io` + `socket.io-client`) | Admin dashboard live notifications |

### Push Notifications
| Layer | Technology |
|---|---|
| Push delivery | **Firebase Cloud Messaging (FCM)** |
| Service worker | `firebase-messaging-sw.js` in `/public` |
| Admin SDK | `firebase-admin ^13.9.0` |

### UI & Animation
| Library | Purpose |
|---|---|
| `framer-motion ^11` | Page + section animations |
| `lucide-react ^0.469` | Icon set |
| `nextjs-toploader` | Page load progress bar |

### Form Handling & Validation
| Library | Purpose |
|---|---|
| `react-hook-form ^7` | Form state management |
| `zod ^3` | Schema validation (client + server) |
| `@hookform/resolvers` | Zod ↔ RHF bridge |

### Dev Tools
| Tool | Purpose |
|---|---|
| ESLint + `eslint-config-next` | Linting |
| PostCSS + Autoprefixer | CSS processing |
| `papaparse` | CSV parsing (menu import?) |

---

## 3. Application Architecture

```
jroyal/
├── server.js               ← Custom Node.js entry (Socket.IO + Next.js proxy)
├── next.config.ts          ← Image optimisation, compression, cache headers
├── public/                 ← Static assets (hero.jpg, grills.png, cafe.png, videos, sw)
└── src/
    ├── app/
    │   ├── layout.tsx      ← Root layout (fonts, metadata, providers, JSON-LD)
    │   ├── globals.css     ← Design tokens + Tailwind layers
    │   ├── (public)/       ← Customer-facing pages (route group)
    │   ├── admin/          ← Back-office (role-gated)
    │   ├── dashboard/      ← Authenticated customer area
    │   ├── auth/           ← Login / signup / OAuth callback
    │   └── api/            ← Server-side API routes
    ├── components/
    │   ├── sections/       ← Landing page sections
    │   ├── ui/             ← Shared UI primitives
    │   ├── admin/          ← Admin-specific components
    │   ├── layout/         ← Navbar, Footer, etc.
    │   └── forms/          ← Form components
    ├── context/            ← React context providers
    ├── hooks/              ← Custom React hooks
    ├── lib/                ← Utilities, Supabase clients, email, schema
    └── types/              ← Shared TypeScript interfaces
```

### Key Architectural Decisions

- **Branch Context Pattern** — A `BranchContext` (React Context + localStorage) allows the entire UI to dynamically adapt content, copy, and video based on the selected branch. This is a well-thought-out pattern.
- **Server vs Client split** — Admin dashboard pages are mostly Server Components with `force-dynamic`, pulling data directly from Supabase via the admin client (service role key). Good for security.
- **Custom server entry (`server.js`)** — Necessary to run Socket.IO alongside Next.js. This trades simplicity for real-time capability but prevents deployment on Vercel (Edge) without modification.
- **Middleware auth guard** — All `/admin/*` and `/dashboard/*` routes are protected via `middleware.ts` which checks Supabase session and role.

---

## 4. Feature Inventory

### Public-Facing Features

| Feature | Status | Notes |
|---|---|---|
| Landing page (8 sections) | ✅ Complete | Hero, About, Services, Menu, Gallery, Testimonials, CTA, Map |
| Branch selector (location overlay) | ✅ Complete | Persisted to localStorage, animated, mobile-optimised |
| Dynamic branch content | ✅ Complete | All copy, video, taglines, maps adapt per branch |
| Menu page | ✅ Complete | Category filter, add-ons, cart |
| Online ordering (cart → order) | ✅ Complete | User must be logged in |
| Table reservations | ✅ Complete | Form → Supabase → email confirmation |
| Gallery page | ✅ Complete | Category-filtered, DB-driven |
| Blog | ✅ Complete | Published/draft system |
| Events page | ✅ Complete | Static content |
| Contact page | ✅ Complete |  |
| WhatsApp floating button | ✅ Complete | Branch-aware phone number |
| PWA / Push notifications | ⚠️ Partial | Service worker present, FCM configured, opt-in UI unclear |
| SEO (metadata, JSON-LD, sitemap, robots) | ✅ Complete | Structured data for restaurant schema |

### Customer Dashboard (Auth-Gated)

| Feature | Status |
|---|---|
| Profile management | ✅ |
| Order history | ✅ |
| Active order tracking | ✅ |
| Cart | ✅ |

### Admin Back-Office

| Feature | Status | Notes |
|---|---|---|
| Dashboard with live stats | ✅ | Pending reservations, orders, confirmed today, users |
| Real-time notification panel | ✅ | Socket.IO — new reservations appear instantly |
| Reservation management (CRUD) | ✅ | Status updates (confirm/cancel) |
| Order management | ✅ | |
| Meal/menu management | ✅ | Add, edit, toggle availability |
| Add-ons management | ✅ | |
| Gallery management | ✅ | Upload, categorise, reorder |
| Blog management | ✅ | Rich text content |
| User management | ✅ | |
| Admin register | ✅ | Currently unprotected (see Security) |

---

## 5. Route Map

### Public Routes `/(public)/`
```
/                   Home (landing page)
/menu               Menu & ordering
/reservations       Table reservation form
/events             Events & catering info
/gallery            Photo gallery
/blog               Blog listing
/blog/[slug]        Blog post
/contact            Contact page
```

### Auth Routes `/auth/`
```
/auth/login         Customer login
/auth/signup        Customer sign up
/auth/callback      OAuth callback
```

### Dashboard Routes `/dashboard/` *(auth required)*
```
/dashboard          Overview
/dashboard/menu     Browse menu
/dashboard/cart     Cart
/dashboard/order    Place order
/dashboard/orders   Order history
/dashboard/profile  Profile
```

### Admin Routes `/admin/` *(admin role required)*
```
/admin              Dashboard + stats
/admin/login        Admin login
/admin/register     Admin register ⚠️ Unprotected
/admin/reservations Reservation management
/admin/orders       Order management
/admin/meals        Menu management
/admin/addons       Add-on management
/admin/gallery      Gallery management
/admin/blog         Blog management
/admin/users        User management
/admin/offline      Offline fallback
```

### API Routes `/api/`
```
POST /api/reservations      Create reservation
POST /api/auth/signup       User registration + welcome email
POST /api/notifications/*   Push notification delivery
```

---

## 6. Data Model

The application uses **Supabase (PostgreSQL)** with the following inferred tables:

| Table | Key Fields | Notes |
|---|---|---|
| `profiles` | `id`, `role`, `full_name`, `phone`, `avatar_url` | RLS — users see own row; admins see all |
| `reservations` | `id`, `name`, `email`, `phone`, `date`, `time`, `guests`, `service`, `status`, `confirmation_sent` | Status: pending / confirmed / cancelled |
| `orders` | `id`, `user_id`, `status`, `total_amount`, `items` (JSONB), `customer_*` | Status: pending / processing / completed / cancelled |
| `meals` | `id`, `title`, `description`, `basePrice`, `image`, `category`, `available` | 7 categories |
| `add_ons` | `id`, `name`, `price`, `category` | Categories: proteins / swallows / extras |
| `gallery` | `id`, `url`, `caption`, `category`, `sort_order` | 5 categories |
| `blog_posts` | `id`, `title`, `slug`, `content`, `cover_image`, `published`, `author_id` | Draft/publish toggle |
| `notifications` | `id`, `user_id`, `title`, `body`, `type`, `is_read`, `metadata` | 6 notification types |
| `push_tokens` | `id`, `user_id`, `token`, `device` | FCM tokens |

**Validation:** All inputs validated with Zod on both client (react-hook-form) and server (API routes). ✅

**Prices:** Stored as integers in Naira — no floating point rounding issues. ✅

---

## 7. Security Assessment

### ✅ What Is Done Well

- **Middleware auth guard** on all admin and dashboard routes — checks Supabase session and role before serving any page.
- **Server-side role check** — admin routes check `profiles.role === "admin"` in the DB, not just from a client-supplied claim.
- **Zod validation on API routes** — `POST /api/reservations` validates all input server-side before touching the DB.
- **Admin client separation** — a separate `createAdminClient()` using the Supabase service role key is used only in server contexts (never in client components).
- **Email addresses** come from the DB record, not from the client request body — prevents email spoofing on reservation confirmations.

### ⚠️ Issues Found

#### CRITICAL — Admin Register Page is Fully Public
```
/admin/register  →  middleware.ts line 18: if (isAdminRegisterPage) return supabaseResponse;
```
The admin registration page is **explicitly skipped in middleware**. Anyone who discovers `/admin/register` can create an admin account with no authentication, no invite token, and no rate limiting. This is the single most serious security vulnerability in the application.

**Risk:** Full admin access to all restaurant data, user PII, and operational controls.

#### HIGH — No Rate Limiting on Public API
`POST /api/reservations` has no rate limiting. A bad actor can flood the endpoint, filling the `reservations` table and triggering hundreds of emails (each costing from the Resend quota).

#### MEDIUM — Email Content Contains User-Supplied Data Without Sanitisation
In `email.ts`, `reservation.special_requests` and `reservation.name` are interpolated directly into HTML email strings. If a user submits `<script>...</script>` or HTML in these fields, it will render in the email client of the recipient. This is an HTML injection risk in emails.

#### MEDIUM — `admin/register` Route Has No Invite / Secret Code Gate
Even if the middleware skip was intentional during development, there is no invite code, admin-approve flow, or environment-variable secret required to complete admin registration.

#### LOW — localStorage Branch Preference Has No Expiry
`jroyal_selected_branch` is written to localStorage with no TTL. If the branch data changes significantly (e.g. a branch closes), returning users will keep stale preferences indefinitely.

#### LOW — Google Maps Embed URL Falls Back to Public Google Maps
Both branch `mapsEmbedUrl` values use public Google Maps search URLs as fallbacks. These are not authenticated embed URLs and may stop working or show cookie/consent banners depending on Google's policies.

---

## 8. Performance Assessment

### Recent Optimisations Applied (This Session)

| Optimisation | Status |
|---|---|
| next/font/google (eliminates render-blocking font CDN request) | ✅ Applied |
| Hero image → Next/Image with `priority` + AVIF/WebP | ✅ Applied |
| `<link rel="preload">` for hero.jpg in `<head>` | ✅ Applied |
| `images.formats: [avif, webp]` in next.config | ✅ Applied |
| `compress: true` + cache headers in next.config | ✅ Applied |
| `qualities: [75, 85]` declared | ✅ Applied |
| 7 below-fold sections → `next/dynamic` (code split) | ✅ Applied |
| Gallery images: explicit `loading="lazy"`, `quality=75` | ✅ Applied |
| About video: `preload="none"` | ✅ Applied |
| Deleted `placeholder-grills.png` (946KB) + `placeholder-cafe.png` (804KB) | ✅ Applied |

### Remaining Performance Concerns

| Issue | Impact | Notes |
|---|---|---|
| `about-story-web.mp4` (2.15MB) + `cafe-video.mp4` (2.69MB) in `/public` | **High** | Videos are uncompressed. Should be re-encoded at lower bitrate (H.264, CRF 28, 720p max). `preload="none"` mitigates but doesn't fix this. |
| `logo.png` is 55KB | **Low** | Could be served as SVG or compressed WebP |
| `reservation.jpg` is 309KB | **Medium** | Should be optimised; large for a decorative asset |
| `hero.jpg` is 165KB | **Acceptable** | Now served as AVIF (~60-80% smaller in practice) |
| Home page render time: ~1.6s | **Medium** | Dominated by Supabase DB calls from admin client in layout and server components |
| Socket.IO server prevents Vercel/Edge deployment | **Deployment Risk** | Custom `server.js` means the app can only be deployed on Node.js VPS/container hosting |
| No ISR (Incremental Static Regeneration) on menu/gallery | **Medium** | These pages are fully dynamic but their data rarely changes — caching would help significantly |

---

## 9. UX & Design Review

### Strengths

- **Premium, cohesive design language** — dark obsidian background, gold (#D4A832) and royal red (#AB2330) accents, Playfair Display serif headings. Feels intentional and upscale.
- **Branch selector overlay** — elegant first-time UX, persisted to localStorage, body scroll locked, mobile-optimised.
- **Framer Motion animations** — smooth, well-calibrated. `whileInView` with `once: true` on all sections avoids re-triggering.
- **Responsive design** — grid layouts adapt cleanly from 360px mobile up to large desktop.
- **WhatsApp button** — branch-aware phone number, sensible pre-filled message. Real-world utility for Nigerian market.

### Issues Found

| Issue | Severity | Detail |
|---|---|---|
| `<p>` inside `<h1>` in HeroSection | **Medium** | Line 73: `<p className="...">Fine Dining, Perfected!</p>` is inside an `<h1>`. This is invalid HTML — block elements inside headings. Should be a `<span>` with `block` display. |
| Testimonials are hardcoded | **Medium** | 4 testimonials are static strings in the component. No admin management UI exists for them — they cannot be updated without a code deploy. |
| Gallery preview uses external Pinterest URLs | **Medium** | 6 gallery images on the homepage are hotlinked from Pinterest CDN. Pinterest can remove/rotate these at any time. These should be actual restaurant photos. |
| No loading skeleton on dashboard pages | **Low** | When the dashboard loads order history or cart, there is no skeleton UI — just a blank screen until data arrives. |
| Menu page has no "empty cart" CTA | **Low** | If the cart is empty and the user navigates to `/dashboard/cart`, the empty state UX is unclear. |
| No 404 image fallback in gallery | **Low** | If a Supabase image URL breaks, the `<img>` renders broken. No `onError` fallback. |
| `Testimonial.image` field defined in types but never used | **Low** | The `Testimonial` interface has an `image` field but testimonials display no avatars. |

---

## 10. Code Quality & Maintainability

### Strengths

- **Consistent TypeScript** — strict types throughout; shared interfaces in `src/types/index.ts`; Zod schemas co-located in `src/lib/schema.ts`.
- **Centralised branch config** — `src/lib/branches.ts` is a single source of truth for all per-branch data. Adding a third branch requires only one file edit.
- **Email service abstraction** — `src/lib/email.ts` cleanly separates email logic. Easy to swap Resend for another provider.
- **Context pattern** — `BranchContext`, `ToastContext` follow clean provider patterns.
- **`optimizePackageImports`** in next.config for `lucide-react` and `framer-motion` — reduces bundle size.

### Weaknesses

| Issue | Detail |
|---|---|
| `"use client"` overuse | `HeroSection` is `"use client"` only because it uses `useScroll`/`useTransform`. The text content could be server-rendered with the parallax as a separate client child component. |
| Catch-all `catch {}` blocks | Several API routes and the middleware have empty catch blocks that silently swallow errors, making debugging in production very difficult. |
| No API rate limiting middleware | The `POST /api/reservations` endpoint has no throttling library (e.g. `upstash/ratelimit`). |
| `Record<string, any>` in notification type | `AppNotification.metadata` typed as `Record<string, any>` — should be typed more specifically. |
| Admin page uses `Record<string, string | number | boolean | null>` for reservation rows | This bypasses the `Reservation` type defined in `@/types`. The Supabase query should be typed with a generated schema. |
| No Supabase type generation | `supabase gen types typescript` is not configured — no auto-generated DB types, leading to manual `as Reservation` casts. |
| `server.js` is undocumented | The custom server entry point has no comments or README explaining the Socket.IO setup or how to run in production. |

---

## 11. Identified Issues & Gaps (Loopholes)

> Consolidated and ranked by severity.

### 🔴 Critical

1. **`/admin/register` is publicly accessible** — middleware explicitly skips this route. Any visitor can self-register as an admin. Must be fixed before going to production.

### 🟠 High

2. **No rate limiting on reservation API** — unlimited POST requests accepted. Risk of spam, DB flooding, and email quota exhaustion.
3. **Video assets not compressed** — 2.15MB + 2.69MB videos served raw to every visitor who scrolls to the About section. On a 3G connection (~1MB/s), this alone takes 4+ seconds to download.
4. **No Supabase type generation** — manual type casting creates a class of silent type-mismatch bugs that only surface at runtime.

### 🟡 Medium

5. **Invalid HTML: `<p>` inside `<h1>`** — affects accessibility, SEO parsers, and browser rendering behaviour.
6. **Pinterest-hotlinked gallery images** — external dependency with no SLA; images can disappear or change at any time.
7. **Testimonials cannot be updated without a code deploy** — hardcoded in the component. Should be moved to the database or at minimum to a CMS config file.
8. **Email HTML injection** — `special_requests` and `name` are interpolated raw into HTML email strings. Should be escaped.
9. **`/admin/register` has no invite system** — even if the middleware skip is "by design" during onboarding, there is no invite token, no admin approval step, and no way to disable it post-launch.
10. **Google Maps embed fallback URLs** — uses generic Google Maps search URLs, not dedicated embed API URLs. Subject to Google policy changes.

### 🟢 Low

11. **Testimonial image field is dead code** — typed but never rendered.
12. **Logo served as PNG (55KB)** — should be SVG or compressed WebP.
13. **`reservation.jpg` (309KB)** — heavy decorative asset, not optimised.
14. **No ISR on menu / gallery pages** — fully dynamic renders for data that changes infrequently.
15. **Branch preference has no TTL** — stale selection can persist indefinitely.
16. **No skeleton loading states** in dashboard.
17. **Socket.IO prevents Vercel deployment** — limits hosting options to VPS/containers.
18. **`catch {}` empty blocks** in several API routes — errors silently swallowed.

---

## 12. Recommendations & Priority Matrix

| # | Recommendation | Priority | Effort |
|---|---|---|---|
| 1 | **Lock down `/admin/register`** — require an env-variable invite token or remove the route and use a seeded admin account | 🔴 Critical | Low |
| 2 | **Add rate limiting** to `POST /api/reservations` — use Upstash Rate Limit or a simple in-memory token bucket | 🟠 High | Medium |
| 3 | **Re-encode videos** — target H.264, 720p, CRF 28 (~300-500KB per video). Saves 4MB per page visit | 🟠 High | Medium |
| 4 | **Run `supabase gen types`** and replace manual casts | 🟠 High | Low |
| 5 | **Fix `<p>` inside `<h1>`** — replace with `<span className="block ...">` | 🟡 Medium | Low |
| 6 | **Replace Pinterest gallery images** with actual restaurant photos hosted on Supabase Storage | 🟡 Medium | Medium |
| 7 | **Move testimonials to database** or at minimum to `src/lib/data/testimonials.ts` | 🟡 Medium | Low |
| 8 | **Sanitise email HTML** — run name/special_requests through a simple escape function before interpolating | 🟡 Medium | Low |
| 9 | **Add ISR to menu and gallery pages** — `revalidate = 3600` on the `fetch` calls | 🟢 Low | Low |
| 10 | **Document `server.js`** and add a production deployment guide | 🟢 Low | Low |
| 11 | **Add skeleton UI** to dashboard pages | 🟢 Low | Medium |
| 12 | **Optimise logo** — convert to SVG or WebP | 🟢 Low | Low |

---

## 13. Summary Scorecard

| Category | Score | Notes |
|---|---|---|
| **Feature Completeness** | 8 / 10 | Solid feature set; testimonials and gallery images are incomplete |
| **Security** | 5 / 10 | Open admin register route is a critical failure; otherwise sound |
| **Performance** | 7 / 10 | Good after recent optimisations; videos remain a bottleneck |
| **Code Quality** | 7 / 10 | Well-structured and typed; some rough edges in error handling |
| **UX / Design** | 8.5 / 10 | Premium, cohesive, and mobile-friendly; minor HTML validity issues |
| **SEO** | 9 / 10 | Strong — JSON-LD, sitemap, robots, OpenGraph, per-branch metadata |
| **Maintainability** | 7 / 10 | Branch config centralisation is excellent; no Supabase type generation |
| **Deployment Readiness** | 5 / 10 | Security gap + uncompressed videos + custom server block Vercel |

### Overall Rating: **6.8 / 10**

The application is a well-designed, feature-rich restaurant platform that demonstrates strong architectural thinking — particularly the branch context system and the separation of admin and customer concerns. The primary blockers before production launch are the **open admin registration page** (critical security risk) and the **uncompressed video assets** (significant performance impact). Addressing the Critical and High severity items above would bring this to production-ready quality.

---

*Audit conducted via static code analysis. No dynamic/runtime penetration testing was performed.*
