"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";

type WaiverData = {
  player_name: string;
  team_name: string | null;
  registration_type: string;
  signed: boolean;
  signed_at: string | null;
};

const WAIVER_TEXT = `MOLLOY MADNESS 3v3 BASKETBALL TOURNAMENT — WAIVER AND RELEASE OF LIABILITY

MATTHEW C. MOLLOY FOUNDATION & DAY HILL DOME PARTNERS, LLC

By signing this waiver, I confirm that I am at least 14 years of age. If I am under 18, I confirm that my parent or legal guardian has reviewed this waiver and has given consent for my participation in the Molloy Madness 3v3 Basketball Tournament ("Event").

I, the undersigned participant, voluntarily agree to participate in the Event held at Day Hill Dome, 875 Day Hill Rd, Windsor, CT 06095, organized by the Matthew C. Molloy Foundation.

ASSUMPTION OF RISK: I am aware of the nature of, and possibility for injury with any sports activity, and I hereby assume responsibility for myself to participate. I understand that participation in this Event involves inherent risks, including but not limited to physical injury, and I voluntarily assume all such risks.

RELEASE AND WAIVER: I will not hold the Matthew C. Molloy Foundation, Day Hill Dome Partners, LLC (dba Day Hill Dome), and/or their officers, employees, volunteers, agents, or sponsors responsible in case of any accident or injury as a result of this participation. I hereby further agree to indemnify and hold harmless both parties from and against any and all loss, damage, claim, demand, liability, or expense by reason of any damage or injury to property or person which may be claimed to have arisen as a result of or in connection with participating in activities at the Event.

MEDICAL AUTHORIZATION: I grant Day Hill Dome Partners, LLC, the Matthew C. Molloy Foundation, and their staff permission to utilize any medical emergency services deemed necessary to treat injuries that I may incur while participating. I understand that neither organization provides insurance for program participants.

HEALTH ACKNOWLEDGEMENT: I agree, understand, and acknowledge, on my own behalf, that an inherent risk of exposure to COVID-19 and any other communicable or infectious disease exists in any public place where people are present.

MEDIA RELEASE: I grant permission to the Matthew C. Molloy Foundation and Day Hill Dome Partners, LLC to use photographs, video, or other media of my participation for promotional purposes.

I have read this waiver, fully understand its terms, and sign it freely and voluntarily.`;

export default function WaiverClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [waiver, setWaiver] = useState<WaiverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [signedName, setSignedName] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/waiver?token=${token}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setWaiver(data);
        if (data.signed) setSubmitted(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSign() {
    if (!signedName.trim()) {
      setError("Please type your full name");
      return;
    }
    if (isMinor && !guardianName.trim()) {
      setError("Please enter your parent or guardian's full name");
      return;
    }
    if (!agreed) {
      setError("You must agree to the waiver");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/waiver", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          signed_name: signedName.trim(),
          ...(isMinor && { guardian_name: guardianName.trim() }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading waiver...
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-800 text-xl font-bold mb-2">Waiver Not Found</p>
        <p className="text-gray-500 mb-6">This link may be invalid or expired.</p>
        <Link href="/" className="text-amber-600 hover:text-amber-700 font-medium">
          Return Home
        </Link>
      </div>
    );
  }

  if (submitted && waiver) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Waiver Signed</h1>
        <p className="text-gray-500 mb-1">
          Thank you, <span className="font-semibold text-slate-700">{waiver.player_name}</span>!
        </p>
        {waiver.team_name && (
          <p className="text-gray-400 text-sm">Team: {waiver.team_name}</p>
        )}
        <p className="text-gray-500 mt-6">See you on the court!</p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  if (!waiver) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
          Tournament Waiver
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
          Sign Your Waiver
        </h1>
        <p className="text-gray-500 mt-2">
          {waiver.player_name}
          {waiver.team_name && <span className="text-gray-400"> — {waiver.team_name}</span>}
        </p>
      </div>

      {/* Waiver text */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 max-h-80 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-600 leading-relaxed font-sans">
          {WAIVER_TEXT}
        </pre>
      </div>

      {/* Signature */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Type your full name to sign
          </label>
          <input
            type="text"
            value={signedName}
            onChange={(e) => { setSignedName(e.target.value); setError(""); }}
            placeholder={waiver.player_name}
            className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            maxLength={200}
          />
          {signedName.trim() && (
            <p className="mt-2 text-2xl font-serif italic text-slate-700">
              {signedName}
            </p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isMinor}
            onChange={(e) => { setIsMinor(e.target.checked); setError(""); }}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-600">
            I am under 18 years of age
          </span>
        </label>

        {isMinor && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Parent / Guardian full name
            </label>
            <input
              type="text"
              value={guardianName}
              onChange={(e) => { setGuardianName(e.target.value); setError(""); }}
              placeholder="Parent or guardian's full name"
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              maxLength={200}
            />
            <p className="mt-1.5 text-xs text-gray-400">
              By entering their name, your parent/guardian confirms they have reviewed this waiver and consent to your participation.
            </p>
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); setError(""); }}
            className="mt-1 w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-600">
            {isMinor
              ? "I have read the waiver above and agree to its terms. My parent or legal guardian has reviewed this waiver and consents to my participation."
              : "I have read the waiver above and agree to its terms. I confirm that I am at least 18 years of age."}
          </span>
        </label>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleSign}
          disabled={submitting}
          className="w-full py-4 bg-amber-500 text-white font-bold text-lg rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing..." : "Sign Waiver"}
        </button>

        <p className="text-center text-xs text-gray-400">
          Questions? Contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-amber-600 hover:text-amber-700">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
