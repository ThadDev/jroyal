// ============================================================
// Jroyal Grills – Shared Type Definitions
// ============================================================

// ── Auth / User ──────────────────────────────────────────────
export type UserRole = "admin" | "staff" | "customer";

export interface Profile {
    id: string;
    role: UserRole;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

// ── Reservations ─────────────────────────────────────────────
export type ServiceType =
    | "restaurant"
    | "events"
    | "catering"
    | "private_dining"
    | "outdoor_catering";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface Reservation {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    guests: number;
    service: ServiceType;
    special_requests: string | null;
    status: ReservationStatus;
    confirmation_sent: boolean;
    created_at: string;
    updated_at: string;
}

// ── Meals ─────────────────────────────────────────────────────
export type MealCategory =
    | "rice"
    | "pastries"
    | "soup"
    | "drinks"
    | "main_course"
    | "native_dishes"
    | "grilled_and_protein";

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
    rice: "Rice Dishes",
    pastries: "Pastries & Snacks",
    soup: "Soups",
    drinks: "Drinks",
    main_course: "Main Course",
    native_dishes: "Native Dishes",
    grilled_and_protein: "Grills & Proteins",
};

export interface Meal {
    id: string;
    title: string;
    description: string;
    basePrice: number;      // Always a whole number in Naira — never a formatted string
    image: string;
    category: MealCategory;
    available: boolean;
    createdAt: string;
    updatedAt: string;
}

// ── Add-Ons ───────────────────────────────────────────────────
export type AddOnCategory = "proteins" | "swallows" | "extras";

export const ADDON_CATEGORY_LABELS: Record<AddOnCategory, string> = {
    proteins: "Proteins",
    swallows: "Swallows",
    extras: "Extras",
};

export interface AddOn {
    id: string;
    name: string;
    price: number;          // 0 for free items (e.g. Eba, Fufu)
    category: AddOnCategory;
}

// ── Cart ──────────────────────────────────────────────────────

/** A single chosen add-on within one cart line item */
export interface SelectedAddOn {
    addOnId: string;
    name: string;           // denormalized — captured at add-time so cart is self-contained
    price: number;          // denormalized — captured at add-time
    quantity: number;
}

/**
 * One line in the cart. Key: `cartItemId` (uuid) — NOT mealId.
 * The same meal can appear more than once if the user adds it with
 * different add-on combinations.
 */
export interface CartItem {
    cartItemId: string;         // unique per line; use crypto.randomUUID()
    mealId: string;
    mealTitle: string;
    basePrice: number;
    image: string;
    selectedAddOns: SelectedAddOn[];
    quantity: number;
    totalPrice: number;         // (basePrice + Σ addOn.price*addOn.qty) * quantity — computed
}

// ── Blog ─────────────────────────────────────────────────────
export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string | null;
    cover_image: string | null;
    published: boolean;
    author_id: string | null;
    created_at: string;
    updated_at: string;
}

// ── Gallery ──────────────────────────────────────────────────
export type GalleryCategory = "general" | "food" | "events" | "ambiance" | "team";

export interface GalleryImage {
    id: string;
    url: string;
    caption: string | null;
    category: GalleryCategory;
    sort_order: number;
    created_at: string;
}

// ── UI Helpers ───────────────────────────────────────────────
export interface NavLink {
    href: string;
    label: string;
}

export interface ServiceCard {
    icon: string;
    title: string;
    description: string;
    href: string;
}

export interface Testimonial {
    name: string;
    role: string;
    content: string;
    rating: number;
    image?: string;
}

// ── Orders ───────────────────────────────────────────────────
export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";

export interface Order {
    id: string;
    user_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    status: OrderStatus;
    total_amount: number;
    items: CartItem[]; // Can be stored as JSONB in Supabase
    created_at: string;
    updated_at: string;
}

// ── Notifications ────────────────────────────────────────────
export type NotificationType = "order" | "reservation" | "signup" | "payment" | "cancellation" | "system";

export interface AppNotification {
    id: string;
    user_id: string | null; // null for broadcast/admin-only if we define a specific user_id for admin. Or we can just use user_id = admin's id
    title: string;
    body: string;
    type: NotificationType;
    is_read: boolean;
    metadata: Record<string, any>;
    created_at: string;
}

export interface PushToken {
    id: string;
    user_id: string;
    token: string;
    device: string | null;
    created_at: string;
}
