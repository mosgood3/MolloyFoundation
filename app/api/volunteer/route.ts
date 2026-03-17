import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { sendVolunteerConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getIP } from "@/lib/get-ip";

const INTERESTS = [
  "Scorekeeping",
  "Refereeing",
  "Event Setup",
  "First Aid",
  "Wherever Needed",
] as const;

const volunteerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().regex(/^[0-9]{10}$/),
  interests: z.array(z.enum(INTERESTS)).min(1, "Select at least one area"),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(`volunteer:${getIP(req)}`, 5)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  try {
    const body = await req.json();

    const parsed = volunteerSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, interests } = parsed.data;
    const interestsStr = interests.join(", ");

    const { error } = await supabaseAdmin.from("volunteers_2026").insert({
      name,
      email,
      phone,
      interests: interestsStr,
    });

    if (error) {
      console.error("Volunteer insert error:", error.message);
      return Response.json({ error: "Signup failed. Please try again." }, { status: 500 });
    }

    // Send confirmation email
    try {
      await sendVolunteerConfirmationEmail(email, name, interestsStr);
      console.log("Volunteer confirmation email sent to:", email);
    } catch (emailErr) {
      console.error("Volunteer email failed:", emailErr);
    }

    return Response.json({ success: true });
  } catch (err: unknown) {
    console.error("Volunteer error:", err instanceof Error ? err.message : err);
    return Response.json({ error: "Signup failed. Please try again." }, { status: 500 });
  }
}
