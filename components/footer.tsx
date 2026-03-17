import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/constants";
import { FaBasketballBall } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <FaBasketballBall className="text-2xl text-amber-500" />
              <span className="font-extrabold text-lg text-white tracking-tight">
                Molloy Madness
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The Matthew C. Molloy Memorial Foundation keeps Matt&apos;s spirit alive
              through sport, music, and community. 100% of proceeds go to charity.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-5">
              Quick Links
            </p>
            <div className="flex flex-col gap-3">
              {[
                { label: "Donate", href: "/#proceeds" },
                { label: "Register", href: "/register" },
                { label: "Teams", href: "/teams" },
                { label: "About Matt", href: "/#about" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-slate-400 hover:text-amber-400 text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-5">
              Get in Touch
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors"
            >
              {CONTACT_EMAIL}
            </a>
            <p className="text-slate-500 text-sm mt-3">
              Berlin, CT
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Matthew C. Molloy Foundation. All
            rights reserved.
          </p>
          <p className="text-slate-600 text-xs">
            Made with love for Matt.
          </p>
        </div>
      </div>
    </footer>
  );
}
