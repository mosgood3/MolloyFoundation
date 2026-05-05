import { NextRequest } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { getIP } from "@/lib/get-ip";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
  });
}

const donationSchema = z.object({
  amount: z.number().int().min(1).max(10000),
  donor_name: z.string().min(1).max(200).optional(),
});

export async function POST(req: NextRequest) {
  if (!rateLimit(`donate:${getIP(req)}`, 10)) {
    return new Response(JSON.stringify({ error: "Too many requests. Try again later." }), { status: 429 });
  }
  try {
    const body = await req.json();

    const parsed = donationSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid donation data", details: parsed.error.flatten() }),
        { status: 400 }
      );
    }

    const { amount, donor_name } = parsed.data;

    const fbp = typeof body.fbp === "string" ? body.fbp.slice(0, 250) : null;
    const fbc = typeof body.fbc === "string" ? body.fbc.slice(0, 250) : null;
    const ua = typeof body.user_agent === "string" ? body.user_agent.slice(0, 500) : null;
    const ip = getIP(req);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Donation — Molloy Madness",
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "donation",
        ...(donor_name && { donor_name }),
        ...(fbp && { fbp }),
        ...(fbc && { fbc }),
        ...(ua && { ua }),
        ...(ip !== "unknown" && { ip }),
      },
      return_url: `${req.nextUrl.origin}/donate/success?session_id={CHECKOUT_SESSION_ID}&amount=${amount}`,
    });

    return Response.json({ clientSecret: session.client_secret });
  } catch (err: unknown) {
    console.error("Stripe donation checkout error:", err instanceof Error ? err.message : err);
    return new Response(
      JSON.stringify({ error: "Payment processing failed. Please try again." }),
      { status: 500 }
    );
  }
}
