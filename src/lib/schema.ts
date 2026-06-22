import { z } from "zod";

// ── Meal ──────────────────────────────────────────────────────
export const mealSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    description: z.string().optional().default(""),
    basePrice: z.number().int().min(0, "Price cannot be negative"),
    image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    category: z.enum([
        "rice",
        "pastries",
        "soup",
        "drinks",
        "main_course",
        "native_dishes",
        "grilled_and_protein",
    ]),
    available: z.boolean().default(true),
});

export type MealInput = z.infer<typeof mealSchema>;

// ── AddOn ─────────────────────────────────────────────────────
export const addOnSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    price: z.number().int().min(0, "Price cannot be negative"),
    category: z.enum(["proteins", "swallows", "extras"]),
});

export type AddOnInput = z.infer<typeof addOnSchema>;


export const reservationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().min(10, "Please enter a valid phone number"),
    date: z.string().min(1, "Please select a date"),
    time: z.string().min(1, "Please select a time"),
    guests: z
        .number()
        .min(1, "At least 1 guest required")
        .max(500, "Maximum 500 guests"),
    service: z.enum([
        "restaurant",
        "events",
        "catering",
        "private_dining",
        "outdoor_catering",
    ]),
    special_requests: z.string().optional(),
});

export const blogPostSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z
        .string()
        .min(3)
        .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    cover_image: z.string().url().optional().or(z.literal("")),
    published: z.boolean().default(false),
});

export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
