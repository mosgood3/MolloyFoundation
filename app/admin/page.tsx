import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ADMIN_EMAIL } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Molloy Madness",
};

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
