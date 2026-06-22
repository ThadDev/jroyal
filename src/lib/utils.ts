export type { Reservation, BlogPost, GalleryImage, Profile } from "@/types";

export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(" ");
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function formatTime(time: string): string {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
}

export function estimateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export const SERVICE_LABELS: Record<string, string> = {
    restaurant: "Restaurant Dining",
    events: "Events",
    catering: "Catering",
    private_dining: "Private Dining",
    outdoor_catering: "Outdoor Catering",
};

export const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export const AVAILABLE_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];
