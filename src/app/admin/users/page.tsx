import { createAdminClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Users – Admin Dashboard" };

export default async function AdminUsersPage() {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false });

  // Get emails from auth.users via admin API
  let emailMap: Record<string, string> = {};
  try {
    const { data: authUsers } = await supabase.auth.admin.listUsers({ perPage: 500 });
    emailMap = Object.fromEntries(authUsers?.users?.map((u) => [u.id, u.email ?? ""]) ?? []);
  } catch {}

  const users = (profiles ?? []).map((p) => ({
    id: p.id,
    full_name: p.full_name ?? "—",
    email: emailMap[p.id] ?? "—",
    role: p.role ?? "customer",
    created_at: p.created_at ? formatDate(p.created_at.split("T")[0]) : "—",
  }));

  return (
    <div className="p-8">
      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
