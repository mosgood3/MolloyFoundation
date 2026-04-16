"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaBasketballBall } from "react-icons/fa";
import { TEAMS_PAGE_ENABLED } from "@/lib/constants";

const links = [
  { href: "/#about", label: "About" },
  ...(TEAMS_PAGE_ENABLED ? [{ href: "/teams", label: "Teams" }] : []),
  { href: "/volunteer", label: "Volunteer" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(true);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        open || solid
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={() => setOpen(false)}
        >
          <FaBasketballBall
            className={`text-xl ${
              solid || open ? "text-amber-500" : "text-amber-400"
            } group-hover:rotate-45 transition-transform duration-300`}
          />
          <span
            className={`font-extrabold text-xl md:text-2xl tracking-tight ${
              solid || open ? "text-slate-800" : "text-white"
            }`}
          >
            Molloy Madness
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => {
            const cls = `px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              solid
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`;
            return l.href.includes("#") ? (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a key={l.href} href={l.href} className={cls}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} className={cls}>
                {l.label}
              </Link>
            );
          })}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          <Link
            href="/register"
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors border ${
              solid
                ? "border-amber-500 text-amber-600 hover:bg-amber-50"
                : "border-white/60 text-white hover:bg-white/10"
            }`}
          >
            Register
          </Link>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/#proceeds"
            className="ml-1 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
          >
            Donate
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`lg:hidden relative w-8 h-8 flex items-center justify-center ${
            solid || open ? "text-slate-800" : "text-white"
          }`}
          aria-label="Toggle menu"
        >
          <span className="sr-only">Menu</span>
          <span
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded transition-all duration-200 ${
              open ? "-rotate-45" : "translate-y-1.5"
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="px-4 pb-5 pt-1 space-y-1">
          {links.map((l) => {
            const cls = "block px-3 py-2.5 rounded-lg text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors";
            return l.href.includes("#") ? (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className={cls}>
                {l.label}
              </a>
            ) : (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={cls}>
                {l.label}
              </Link>
            );
          })}
          <div className="h-px bg-slate-100 my-2" />
          <div className="flex gap-2 pt-1">
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex-1 text-center px-4 py-2.5 border border-amber-500 text-amber-600 rounded-lg font-bold text-sm hover:bg-amber-50 transition-colors"
            >
              Register
            </Link>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/#proceeds"
              onClick={() => setOpen(false)}
              className="flex-1 text-center px-4 py-2.5 bg-amber-500 text-white rounded-lg font-bold text-sm hover:bg-amber-600 transition-colors"
            >
              Donate
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
