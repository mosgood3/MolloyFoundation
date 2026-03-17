"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const StripeCheckout = dynamic(() => import("./stripe-checkout"), {
  ssr: false,
  loading: () => (
    <div className="py-12 text-center text-slate-400">
      Loading payment form...
    </div>
  ),
});

const PRESETS = [25, 50, 100, 250] as const;
const DEFAULT_AMOUNT = 50;

export default function DonateWidget() {
  const [amount, setAmount] = useState<number | "">(DEFAULT_AMOUNT);
  const [donorName, setDonorName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const selected = typeof amount === "number" ? amount : 0;

  async function handleDonate() {
    const value = typeof amount === "number" ? amount : 0;
    if (value < 1) {
      setError("Minimum donation is $1");
      return;
    }
    if (value > 10000) {
      setError("Maximum donation is $10,000");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: value,
          ...(donorName.trim() && { donor_name: donorName.trim() }),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (clientSecret) {
    return (
      <div className="max-w-5xl mx-auto" id="donate-checkout">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
          <h3 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">
            Complete Your Donation
          </h3>
          <StripeCheckout clientSecret={clientSecret} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left: Impact messaging */}
          <div className="p-8 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight mb-4">
              Honor Matt&apos;s Legacy
            </h3>
            <p className="text-gray-500 leading-relaxed">
              100% of every dollar goes directly to scholarships and charities
              in Matt&apos;s name. No admin fees, no overhead — just impact.
            </p>
          </div>

          {/* Right: Donation form */}
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-5">
              Select an amount
            </p>

            <div className="relative mb-5">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-3xl">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter amount"
                value={amount === "" ? "" : amount}
                onChange={(e) => {
                  setError("");
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(val === "" ? "" : parseInt(val, 10));
                }}
                className="w-full pl-14 pr-4 py-5 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-3xl font-bold placeholder:text-slate-300 placeholder:font-normal focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setAmount(p);
                    setError("");
                  }}
                  className={`py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    selected === p
                      ? "bg-amber-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  ${p}
                </button>
              ))}
            </div>

            {/* Donor name */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition"
              />
              <p className="text-slate-400 text-xs mt-1.5">
                Add your name to appear on our donor wall.
              </p>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
            )}

            <button
              onClick={handleDonate}
              disabled={loading || selected < 1}
              className="w-full py-5 bg-amber-500 text-white font-extrabold text-xl rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                "Loading checkout..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                  </svg>
                  {selected >= 5 ? `Donate $${selected}` : "Donate"}
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
