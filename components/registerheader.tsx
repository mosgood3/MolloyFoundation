import Link from "next/link";
import { FaBasketballBall } from "react-icons/fa";

export default function RegisterHeader() {
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 font-bold text-xl md:text-2xl flex lg:justify-start justify-center items-center">
        <Link
          href="/"
          aria-label="Go to homepage"
          className="flex items-center space-x-2"
        >
          <FaBasketballBall className="text-3xl md:text-4xl text-amber-600" />
          <span className="font-bold text-white text-xl md:text-2xl drop-shadow-sm">
            Molloy Madness
          </span>
        </Link>
      </div>
    </header>
  );
}
