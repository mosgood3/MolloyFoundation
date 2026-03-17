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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 to-white p-6">
        <div className="w-full max-w-md bg-white bg-opacity-80 backdrop-blur-sm rounded-3xl shadow-xl p-10 text-center space-y-6 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800">
            Registration Successful
          </h1>
          <p className="text-gray-600 text-base leading-relaxed">
            Thank you for registering! Your team has been received and will
            appear on the homepage shortly.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-left">
            <p className="text-sm text-blue-800 font-semibold mb-1">
              Check your email!
            </p>
            <p className="text-sm text-blue-700">
              Each player has been sent a waiver to sign before game day. The
              team captain also received a summary with all waiver links.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            If you have any questions, please contact{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="font-medium text-green-600 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-green-500 text-white font-medium rounded-full hover:bg-green-600 transition-all"
          >
            Return Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
