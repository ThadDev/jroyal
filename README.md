# Mama Onyinye LandMark

A production-ready luxury restaurant website with admin dashboard.

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase + Resend credentials
3. Run `supabase/schema.sql` in your Supabase SQL Editor
4. Run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (luxury gold/black theme)
- **Framer Motion** (animations)
- **Supabase** (PostgreSQL + Auth + Storage)
- **Resend** (email confirmations)

## Admin Access

Visit `/admin/login` and sign in with your Supabase admin credentials.
Ensure your profile row has `role = 'admin'` in the `profiles` table.

## Deploy

Deploy to Vercel — set environment variables in the Vercel dashboard.
