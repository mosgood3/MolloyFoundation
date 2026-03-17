"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { tshirtSizes, divisions } from "@/utils/validators";
import type { RegistrationData } from "@/utils/validators";

const StripeCheckout = dynamic(() => import("./stripe-checkout"), {
  ssr: false,
  loading: () => (
    <div className="py-12 text-center text-slate-400">
      Loading payment form...
    </div>
  ),
});

type Mode = "team" | "singles" | null;
type Division = (typeof divisions)[number];
type Size = (typeof tshirtSizes)[number];

type Player = { name: string; size: Size | ""; email: string };

const EMPTY_PLAYER: Player = { name: "", size: "", email: "" };

export default function RegisterTeamForm() {
  // Step tracking
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<Mode>(null);

  // Team fields
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState<[Player, Player, Player]>([
    { ...EMPTY_PLAYER },
    { ...EMPTY_PLAYER },
    { ...EMPTY_PLAYER },
  ]);
  const [player4, setPlayer4] = useState<Player | null>(null);

  // Singles fields
  const [singlesPlayer, setSinglesPlayer] = useState<Player>({
    ...EMPTY_PLAYER,
  });

  // Shared fields
  const [division, setDivision] = useState<Division>("Competitive");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [singlesSubmitted, setSinglesSubmitted] = useState(false);

  const totalSteps = 4;
  const hasPlayer4 = player4 !== null && player4.name.trim().length > 0;
  const teamPrice = hasPlayer4 ? 160 : 120;
  const price = mode === "team" ? teamPrice : 40;

  function updatePlayer(idx: number, field: keyof Player, value: string) {
    setPlayers((prev) => {
      const copy = [...prev] as [Player, Player, Player];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function canAdvance(): boolean {
    setError("");
    if (step === 1) return mode !== null;
    if (step === 2) {
      if (mode === "team") {
        if (!teamName.trim()) {
          setError("Team name is required");
          return false;
        }
        for (let i = 0; i < 3; i++) {
          if (!players[i].name.trim()) {
            setError(`Player ${i + 1} name is required`);
            return false;
          }
          if (!players[i].size) {
            setError(`Player ${i + 1} shirt size is required`);
            return false;
          }
          if (
            !players[i].email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(players[i].email)
          ) {
            setError(`Player ${i + 1} email is required`);
            return false;
          }
        }
        if (player4 && player4.name.trim()) {
          if (!player4.size) {
            setError("Player 4 shirt size is required");
            return false;
          }
          if (
            !player4.email.trim() ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(player4.email)
          ) {
            setError("Player 4 email is required");
            return false;
          }
        }
      } else {
        if (!singlesPlayer.name.trim()) {
          setError("Your name is required");
          return false;
        }
        if (!singlesPlayer.size) {
          setError("Shirt size is required");
          return false;
        }
      }
      return true;
    }
    if (step === 3) {
      if (
        !email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        setError("Valid email is required");
        return false;
      }
      if (!/^[0-9]{10}$/.test(phone)) {
        setError("Phone must be 10 digits");
        return false;
      }
      return true;
    }
    return true;
  }

  function next() {
    if (canAdvance()) setStep((s) => Math.min(s + 1, totalSteps));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    if (!canAdvance()) return;
    setSubmitting(true);
    setError("");

    let body: RegistrationData;

    if (mode === "team") {
      const p4 = player4?.name.trim()
        ? {
            name: player4.name.trim(),
            size: player4.size as Size,
            email: player4.email.trim(),
          }
        : undefined;
      body = {
        mode: "team",
        team_name: teamName.trim(),
        players: players.map((p) => ({
          name: p.name.trim(),
          size: p.size as Size,
          email: p.email.trim(),
        })) as [
          { name: string; size: Size; email: string },
          { name: string; size: Size; email: string },
          { name: string; size: Size; email: string },
        ],
        player4: p4,
        division,
        team_email: email.trim(),
        team_phone: phone.trim(),
      };
    } else {
      body = {
        mode: "singles",
        player: {
          name: singlesPlayer.name.trim(),
          size: singlesPlayer.size as Size,
          email: email.trim(),
        },
        division,
        email: email.trim(),
        phone: phone.trim(),
      };
    }

    try {
      if (mode === "singles") {
        // Singles: no payment, just save to DB
        const res = await fetch("/api/singles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_name: singlesPlayer.name.trim(),
            player_shirt: singlesPlayer.size,
            division,
            email: email.trim(),
            phone: phone.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          setSubmitting(false);
          return;
        }
        setSinglesSubmitted(true);
      } else {
        // Teams: go through Stripe checkout
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          setSubmitting(false);
          return;
        }
        setClientSecret(data.clientSecret);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full py-3 px-4 bg-white border-2 border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-slate-400";
  const selectClass =
    "w-full py-3 px-4 bg-white border-2 border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition";

  if (singlesSubmitted) {
    return (
      <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden">
            {/* Green success banner */}
            <div className="bg-green-500 px-8 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-9 h-9 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                You&apos;re In!
              </h2>
              <p className="text-green-100 mt-2">
                We&apos;ve added you to the free agent list
              </p>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-slate-600 text-center">
                We&apos;ll reach out once we&apos;ve matched you with a team for the tournament.
              </p>

              {/* Email notice */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-blue-800">Check your email</p>
                  <p className="text-sm text-blue-700 mt-0.5">We&apos;ve sent you a waiver to sign before game day.</p>
                </div>
              </div>

              {/* Fee notice */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-amber-800">Registration fee</p>
                  <p className="text-sm text-amber-700 mt-0.5">Once matched, the fee is <span className="font-bold">$40 per player</span>.</p>
                </div>
              </div>

              <a
                href="/"
                className="block text-center py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition mt-2"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (clientSecret) {
    return (
      <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="relative w-full max-w-lg">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 md:p-10">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">
              Complete Payment
            </h2>
            <StripeCheckout clientSecret={clientSecret} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
      {/* Ambient blobs */}
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-lg">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-8 px-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  s < step
                    ? "bg-amber-500 text-white"
                    : s === step
                    ? "bg-amber-500 text-white ring-4 ring-amber-500/20"
                    : "bg-slate-300 text-slate-700 border border-slate-400"
                }`}
              >
                {s < step ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  s
                )}
              </div>
              {s < totalSteps && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded transition-colors duration-300 ${
                    s < step ? "bg-amber-500" : "bg-slate-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 md:p-10">
          {/* ── Step 1: Choose mode ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Register
                </h2>
                <p className="text-slate-500 mt-2">How are you playing?</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMode("team")}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                    mode === "team"
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-slate-300 hover:border-amber-300 bg-white hover:bg-amber-50/30"
                  }`}
                >
                  <div className="text-3xl mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-slate-800">Team</p>
                  <p className="text-sm text-slate-500 mt-1">
                    3 players $120 &middot; 4 players $160
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("singles")}
                  className={`relative p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                    mode === "singles"
                      ? "border-amber-500 bg-amber-50 shadow-md"
                      : "border-slate-300 hover:border-amber-300 bg-white hover:bg-amber-50/30"
                  }`}
                >
                  <div className="text-3xl mb-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </div>
                  <p className="font-bold text-slate-800">Singles</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Free agent &middot; We&apos;ll find you a team
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Player info ── */}
          {step === 2 && mode === "team" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Team Details
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  3 players required, 4th is optional
                </p>
              </div>

              <div>
                <label htmlFor="reg-team-name" className="block text-sm font-bold text-slate-800 mb-1.5">
                  Team Name
                </label>
                <input
                  id="reg-team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Butcher Boys of Grimsby"
                  className={inputClass}
                  maxLength={50}
                />
              </div>

              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="space-y-2 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Player {i + 1}
                      </label>
                      <input
                        type="text"
                        value={players[i].name}
                        onChange={(e) => updatePlayer(i, "name", e.target.value)}
                        placeholder="Full name"
                        className={inputClass}
                        maxLength={50}
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Shirt
                      </label>
                      <select
                        value={players[i].size}
                        onChange={(e) => updatePlayer(i, "size", e.target.value)}
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Size
                        </option>
                        {tshirtSizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={players[i].email}
                    onChange={(e) => updatePlayer(i, "email", e.target.value)}
                    placeholder="Email address"
                    className={inputClass}
                  />
                </div>
              ))}

              {player4 === null ? (
                <button
                  type="button"
                  onClick={() => setPlayer4({ ...EMPTY_PLAYER })}
                  className="text-sm text-amber-600 hover:text-amber-700 font-semibold transition"
                >
                  + Add 4th player
                </button>
              ) : (
                <div className="space-y-2 border-t border-slate-100 pt-5">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Player 4{" "}
                        <span className="text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={player4.name}
                        onChange={(e) =>
                          setPlayer4({ ...player4, name: e.target.value })
                        }
                        placeholder="Full name"
                        className={inputClass}
                        maxLength={50}
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Shirt
                      </label>
                      <select
                        value={player4.size}
                        onChange={(e) =>
                          setPlayer4({
                            ...player4,
                            size: e.target.value as Size | "",
                          })
                        }
                        className={selectClass}
                      >
                        <option value="" disabled>
                          Size
                        </option>
                        {tshirtSizes.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPlayer4(null)}
                      className="pb-3 text-slate-400 hover:text-red-500 transition"
                      aria-label="Remove player 4"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <input
                    type="email"
                    value={player4.email}
                    onChange={(e) =>
                      setPlayer4({ ...player4, email: e.target.value })
                    }
                    placeholder="Email address"
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && mode === "singles" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Your Info
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  We&apos;ll match you with a team
                </p>
              </div>

              <div>
                <label htmlFor="reg-singles-name" className="block text-sm font-bold text-slate-800 mb-1.5">
                  Full Name
                </label>
                <input
                  id="reg-singles-name"
                  type="text"
                  value={singlesPlayer.name}
                  onChange={(e) =>
                    setSinglesPlayer({ ...singlesPlayer, name: e.target.value })
                  }
                  placeholder="Your name"
                  className={inputClass}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1.5">
                  T-Shirt Size
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {tshirtSizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setSinglesPlayer({ ...singlesPlayer, size: s })
                      }
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        singlesPlayer.size === s
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Division + contact ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Details
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Division preference and contact info
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Division
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {divisions.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDivision(d)}
                      className={`py-3 rounded-xl font-semibold transition-all ${
                        division === d
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-bold text-slate-800 mb-1.5">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-sm font-bold text-slate-800 mb-1.5">
                  Phone
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-slate-200 border-2 border-r-0 border-slate-300 rounded-l-xl text-slate-700 font-bold">
                    +1
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                      )
                    }
                    placeholder="1234567890"
                    className={`${inputClass} rounded-l-none`}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  10 digits, no spaces or dashes
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  Review
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {mode === "team" ? "Confirm your details before checkout" : "Confirm your details before submitting"}
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {mode}
                  </span>
                </div>
                {mode === "team" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Team</span>
                      <span className="font-semibold text-slate-800">
                        {teamName}
                      </span>
                    </div>
                    {players.map((p, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-500">Player {i + 1}</span>
                        <span className="text-slate-800 text-right">
                          {p.name}{" "}
                          <span className="text-slate-400">({p.size})</span>
                          <br />
                          <span className="text-slate-400 text-xs">
                            {p.email}
                          </span>
                        </span>
                      </div>
                    ))}
                    {player4?.name.trim() && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Player 4</span>
                        <span className="text-slate-800 text-right">
                          {player4.name}{" "}
                          <span className="text-slate-400">
                            ({player4.size})
                          </span>
                          <br />
                          <span className="text-slate-400 text-xs">
                            {player4.email}
                          </span>
                        </span>
                      </div>
                    )}
                  </>
                )}
                {mode === "singles" && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Player</span>
                    <span className="text-slate-800">
                      {singlesPlayer.name}{" "}
                      <span className="text-slate-400">
                        ({singlesPlayer.size})
                      </span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Division</span>
                  <span className="text-slate-800">{division}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-800">{email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone</span>
                  <span className="text-slate-800">+1 {phone}</span>
                </div>
                {mode === "team" ? (
                  <div className="border-t border-slate-200 pt-3 flex justify-between font-bold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-amber-600 text-lg">${price}</span>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-3">
                    <p className="text-sm text-slate-600">
                      <span className="font-semibold text-slate-800">No payment needed right now.</span>{" "}
                      Once we match you with a team, the registration fee will be $40 per player.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-600 text-sm text-center mt-4">{error}</p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="px-6 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition"
              >
                Back
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={next}
                disabled={step === 1 && mode === null}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? (mode === "singles" ? "Submitting..." : "Loading checkout...")
                  : (mode === "singles" ? "Submit Registration" : `Pay $${price}`)}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
