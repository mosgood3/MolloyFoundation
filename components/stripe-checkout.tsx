"use client";

import { useEffect, useState } from "react";
import type { Stripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    stripePromise = import("@stripe/stripe-js/pure").then((mod) =>
      mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    );
  }
  return stripePromise;
}

export default function StripeCheckout({
  clientSecret,
}: {
  clientSecret: string;
}) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getStripe()
      .then((s) => setStripe(s))
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="text-red-600 text-sm text-center py-8">
        Failed to load payment form. Please disable ad blockers and refresh.
      </p>
    );
  }

  if (!stripe) {
    return (
      <div className="py-12 text-center text-slate-400">
        Loading payment form...
      </div>
    );
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripe} options={{ clientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
