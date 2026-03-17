import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { tshirtSizes, divisions } from "@/utils/validators";
import { sendSinglesConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getIP } from "@/lib/get-ip";

const singlesSchema = z.object({
  player_name: z.string().min(1).max(200),
  player_shirt: z.enum(tshirtSizes),
  division: z.enum(divisions),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(`singles:${getIP(req)}`, 5)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  try {
    const body = await req.json();

    const parsed = singlesSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { player_name, player_shirt, division, email, phone } = parsed.data;

    // Check if email already registered
    const { data: existing } = await supabaseAdmin
      .from("singles_2026")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: "This email is already registered as a free agent." },
        { status: 409 }
      );
    }

    // Insert into singles table
    const { error } = await supabaseAdmin.from("singles_2026").insert({
      player_name,
      player_shirt,
      division,
      email,
      phone,
    });

    if (error) {
      console.error("Singles insert error:", error.message);
      return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
    }

    // Create waiver and send confirmation + waiver email
    try {
      const { data: waiver } = await supabaseAdmin
        .from("waivers_2026")
        .insert({
          player_name,
          player_email: email,
          registration_type: "singles",
        })
        .select("token")
        .single();

      if (waiver) {
        await sendSinglesConfirmationEmail(email, player_name, waiver.token);
        console.log("Singles confirmation + waiver email sent to:", email);
      }
    } catch (emailErr) {
      console.error("Singles email failed:", emailErr);
      // Don't fail the registration if the email fails
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("Singles registration error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
