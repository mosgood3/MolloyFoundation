import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { ADMIN_EMAIL } from "@/lib/admin";

const PAGE_SIZE = 20;

// Strip characters that have special meaning in PostgREST filter syntax
function sanitizeSearch(input: string): string {
  return input.replace(/[,.()"'\\%_*]/g, "").trim();
}

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

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const tab = searchParams.get("tab") ?? "teams";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const search = sanitizeSearch(searchParams.get("search") ?? "");
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  if (tab === "teams") {
    let query = supabaseAdmin
      .from("teams_2026")
      .select(
        "id, team_name, division, team_email, team_phone, player1, player2, player3, player4, player1shirt, player2shirt, player3shirt, player4shirt, player1email, player2email, player3email, player4email, created_at",
        { count: "exact" }
      );

    if (search) {
      query = query.or(
        `team_name.ilike.%${search}%,player1.ilike.%${search}%,player2.ilike.%${search}%,player3.ilike.%${search}%,player4.ilike.%${search}%,team_email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin teams query error:", error.message);
      return Response.json({ error: "Failed to load data" }, { status: 500 });
    }

    return Response.json({ data: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  }

  if (tab === "singles") {
    let query = supabaseAdmin
      .from("singles_2026")
      .select("id, player_name, player_shirt, division, email, phone, created_at", {
        count: "exact",
      });

    if (search) {
      query = query.or(
        `player_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin singles query error:", error.message);
      return Response.json({ error: "Failed to load data" }, { status: 500 });
    }

    return Response.json({ data: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  }

  if (tab === "donations") {
    let query = supabaseAdmin
      .from("donations_2026")
      .select("id, amount, donor_name, donor_email, source, created_at", {
        count: "exact",
      });

    if (search) {
      query = query.or(
        `donor_name.ilike.%${search}%,donor_email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin donations query error:", error.message);
      return Response.json({ error: "Failed to load data" }, { status: 500 });
    }

    return Response.json({ data: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  }

  if (tab === "waivers") {
    let query = supabaseAdmin
      .from("waivers_2026")
      .select(
        "id, player_name, player_email, team_name, registration_type, signed, signed_name, signed_at, created_at",
        { count: "exact" }
      );

    if (search) {
      query = query.or(
        `player_name.ilike.%${search}%,player_email.ilike.%${search}%,team_name.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin waivers query error:", error.message);
      return Response.json({ error: "Failed to load data" }, { status: 500 });
    }

    return Response.json({ data: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  }

  if (tab === "volunteers") {
    let query = supabaseAdmin
      .from("volunteers_2026")
      .select("id, name, email, phone, interests, created_at", {
        count: "exact",
      });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,interests.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Admin volunteers query error:", error.message);
      return Response.json({ error: "Failed to load data" }, { status: 500 });
    }

    return Response.json({ data: data ?? [], total: count ?? 0, page, pageSize: PAGE_SIZE });
  }

  if (tab === "stats") {
    const [teamsRes, singlesRes, donationsRes, waiversTotalRes, waiversSignedRes, volunteersRes] = await Promise.all([
      supabaseAdmin.from("teams_2026").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("singles_2026").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("donations_2026").select("amount"),
      supabaseAdmin.from("waivers_2026").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("waivers_2026").select("id", { count: "exact", head: true }).eq("signed", true),
      supabaseAdmin.from("volunteers_2026").select("id", { count: "exact", head: true }),
    ]);

    const totalDonations = (donationsRes.data ?? []).reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    return Response.json({
      teams: teamsRes.count ?? 0,
      singles: singlesRes.count ?? 0,
      totalDonations,
      waiversSigned: waiversSignedRes.count ?? 0,
      waiversTotal: waiversTotalRes.count ?? 0,
      volunteers: volunteersRes.count ?? 0,
    });
  }

  return Response.json({ error: "Invalid tab" }, { status: 400 });
}
