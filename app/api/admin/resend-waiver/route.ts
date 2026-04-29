import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { ADMIN_EMAIL } from "@/lib/admin";
import { sendWaiverReminderEmail } from "@/lib/email";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string" || !id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  const { data: waiver, error } = await supabaseAdmin
    .from("waivers_2026")
    .select("token, player_name, player_email, signed")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Resend waiver lookup error:", error.message);
    return Response.json({ error: "Lookup failed" }, { status: 500 });
  }
  if (!waiver) {
    return Response.json({ error: "Waiver not found" }, { status: 404 });
  }
  if (waiver.signed) {
    return Response.json({ error: "Waiver already signed" }, { status: 400 });
  }
  if (!waiver.player_email) {
    return Response.json({ error: "No email on file for this player" }, { status: 400 });
  }

  try {
    await sendWaiverReminderEmail(waiver.player_email, waiver.player_name, waiver.token);
  } catch (e) {
    console.error("Resend waiver email failed:", e);
    return Response.json({ error: "Email send failed" }, { status: 500 });
  }

  return Response.json({ success: true });
}
