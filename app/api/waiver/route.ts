import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getIP } from "@/lib/get-ip";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  if (!rateLimit(`waiver-get:${getIP(req)}`, 30)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }
  const token = req.nextUrl.searchParams.get("token");
  if (!token || !UUID_RE.test(token)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("waivers_2026")
    .select("player_name, team_name, registration_type, signed, signed_at")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Waiver not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

const signSchema = z.object({
  token: z.string().uuid(),
  signed_name: z.string().min(1).max(200),
  guardian_name: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(`waiver:${getIP(req)}`, 10)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = signSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Token and signature name required" },
      { status: 400 }
    );
  }

  const { token, signed_name, guardian_name } = parsed.data;

  const { data: existing } = await supabaseAdmin
    .from("waivers_2026")
    .select("signed")
    .eq("token", token)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Waiver not found" }, { status: 404 });
  }
  if (existing.signed) {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const { error } = await supabaseAdmin
    .from("waivers_2026")
    .update({
      signed: true,
      signed_name: signed_name.trim(),
      signed_at: new Date().toISOString(),
      ...(guardian_name && { guardian_name: guardian_name.trim() }),
    })
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
