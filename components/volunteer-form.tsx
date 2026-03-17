"use client";

import { useState } from "react";
import { CONTACT_EMAIL } from "@/lib/constants";

const INTERESTS = [
  { id: "Scorekeeping", label: "Scorekeeping", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "Refereeing", label: "Refereeing", icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" },
  { id: "Event Setup", label: "Event Setup", icon: "M11.42 15.17l-5.66-5.66a2 2 0 010-2.83l.71-.71a2 2 0 012.83 0l2.12 2.12 2.12-2.12a2 2 0 012.83 0l.71.71a2 2 0 010 2.83l-5.66 5.66z M20.71 7.04a1 1 0 00-1.42 0L12 14.34l-7.29-7.3a1 1 0 00-1.42 1.42l8 8a1 1 0 001.42 0l8-8a1 1 0 000-1.42z" },
  { id: "First Aid", label: "First Aid", icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" },
  { id: "Wherever Needed", label: "Wherever Needed", icon: "M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" },
] as const;

type Interest = (typeof INTERESTS)[number]["id"];

export default function VolunteerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interests, setInterests] = useState<Interest[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function toggleInterest(id: Interest) {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("Name is required"); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Valid email is required"); return;
    }
    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Phone must be 10 digits"); return;
    }
    if (interests.length === 0) {
      setError("Select at least one area you can help with"); return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone,
          interests,
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

  const inputClass =
    "w-full py-3 px-4 bg-white border-2 border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-slate-400";

  if (submitted) {
    return (
      <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />
        <div className="relative w-full max-w-md">
          <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden">
            {/* Success banner */}
            <div className="bg-amber-500 px-8 py-8 text-center">
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
                Thank You!
              </h2>
              <p className="text-amber-100 mt-2">
                We&apos;ve received your volunteer signup
              </p>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-slate-600 text-center">
                We&apos;ll be in touch with more details as the tournament approaches.
              </p>

              {/* Email notice */}
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-blue-800">Check your email</p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    We&apos;ve sent a confirmation with your volunteer details.
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-500 text-center">
                Questions?{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>

              <a
                href="/"
                className="block text-center py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
      <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />

      <div className="relative w-full max-w-lg">
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800">
              Volunteer
            </h2>
            <p className="text-slate-500 mt-2">
              Help make Molloy Madness a success
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="vol-name" className="block text-sm font-bold text-slate-800 mb-1.5">
                Full Name
              </label>
              <input
                id="vol-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputClass}
                maxLength={200}
              />
            </div>

            <div>
              <label htmlFor="vol-email" className="block text-sm font-bold text-slate-800 mb-1.5">
                Email
              </label>
              <input
                id="vol-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="vol-phone" className="block text-sm font-bold text-slate-800 mb-1.5">
                Phone
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 bg-slate-200 border-2 border-r-0 border-slate-300 rounded-l-xl text-slate-700 font-bold">
                  +1
                </span>
                <input
                  id="vol-phone"
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
              <p className="mt-1 text-xs text-slate-500">
                10 digits, no spaces or dashes
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-3">
                I can help with...
              </label>
              <div className="grid grid-cols-1 gap-2">
                {INTERESTS.map((item) => {
                  const selected = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-left font-semibold text-sm transition-all ${
                        selected
                          ? "bg-amber-500 text-white shadow-md"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-5 h-5 flex-shrink-0 ${
                          selected ? "text-white" : "text-amber-500"
                        }`}
                        fill={item.id === "Wherever Needed" ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke={item.id === "Wherever Needed" ? "none" : "currentColor"}
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d={item.icon}
                        />
                      </svg>
                      {item.label}
                      {selected && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 ml-auto"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-500 text-white font-bold text-lg rounded-xl hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
            >
              {submitting ? "Submitting..." : "Sign Up to Volunteer"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
