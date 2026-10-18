import type { Metadata } from "next";
import ProfileClient from "@/components/dashboard/ProfileClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Profile – Jroyal Grills" };

export default function ProfilePage() {
  return <ProfileClient />;
}
