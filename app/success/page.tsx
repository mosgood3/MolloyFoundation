import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CONTACT_EMAIL } from "@/lib/constants";

export const metadata = {
  title: "Registration Successful — Molloy Madness",
};

export default function SuccessPage() {
  return (
    <>
      <Header />
      <main className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-24">
        <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[100px]" />

        <div className="relative w-full max-w-md animate-[fadeIn_0.5s_ease-out]">
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
              <h1 className="text-3xl font-extrabold text-white">
                Registration Successful
              </h1>
              <p className="text-amber-100 mt-2">
                Your team has been received
              </p>
            </div>

            <div className="p-8 space-y-4">
              <p className="text-slate-600 text-center">
                Thank you for registering! Your team will appear on the
                homepage shortly.
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
                  <p className="text-sm font-bold text-blue-800">
                    Check your email
                  </p>
                  <p className="text-sm text-blue-700 mt-0.5">
                    Each player has been sent a waiver to sign before game
                    day. The team captain also received a summary with all
                    waiver links.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <p className="text-sm text-slate-500 text-center">
                Questions?{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-amber-600 font-semibold hover:underline"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>

              <Link
                href="/"
                className="block text-center py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
