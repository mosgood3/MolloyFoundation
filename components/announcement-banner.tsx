"use client";

import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

// Hide banner after registration closes (end of day 2026-05-10, local time).
const HIDE_AFTER = new Date("2026-05-11T00:00:00");

export default function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (Date.now() >= HIDE_AFTER.getTime()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const measure = () => {
      const h = visible && ref.current ? ref.current.offsetHeight : 0;
      root.style.setProperty("--banner-height", `${h}px`);
    };
    measure();
    if (!visible) return;
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Site announcement"
      className="fixed inset-x-0 top-0 z-[60] bg-amber-500 text-white shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
        <p className="flex-1 text-center text-sm sm:text-base md:text-lg font-bold leading-snug">
          Register by <span className="underline">May 1</span> for a T-shirt
          <span className="mx-2 opacity-60">·</span>
          <span className="font-semibold opacity-95">Registration closes May 10</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 p-2 rounded-md hover:bg-white/15 active:scale-95 transition"
        >
          <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
}
