import { NextRequest } from "next/server";
import Stripe from "stripe";
import { registrationSchema } from "@/utils/validators";
import { rateLimit } from "@/lib/rate-limit";
import { getIP } from "@/lib/get-ip";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
  });
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`checkout:${getIP(req)}`, 10)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Try again later." }),
      { status: 429 }
    );
  }
  try {
    const body = await req.json();

    const parsed = registrationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid registration data" }),
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Only team registration goes through Stripe checkout
    if (data.mode !== "team") {
      return new Response(
        JSON.stringify({ error: "Singles registration does not require payment" }),
        { status: 400 }
      );
    }

    const { team_name, players, player4, division, team_email, team_phone, promo_code } = data;
    const baseAmount = player4 ? 16000 : 12000;
    const normalizedCode = promo_code?.trim().toLowerCase() ?? "";
    const unitAmount = normalizedCode === "madnessunder18" ? 10000 : baseAmount;

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `Team Registration — ${team_name}` },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "registration",
        reg_mode: "team",
        team_name,
        division,
        team_email,
        team_phone,
        players: JSON.stringify(players),
        ...(player4 && { player4: JSON.stringify(player4) }),
      },
      return_url: `${req.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}&amount=${unitAmount / 100}`,
      customer_email: team_email,
    });

    return Response.json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again." }),
      { status: 500 }
    );
  }
}
