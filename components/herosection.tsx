import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/Home.png')" }}
      />
      {/* Light overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-900/25 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-3/5 space-y-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="h-px w-12 bg-amber-500/50" />
              <span className="text-amber-400 font-semibold tracking-[0.2em] uppercase text-sm">
                May 16, 2026 &middot; Windsor, CT
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9]">
              4th Annual{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">
                Molloy Madness
              </span>
            </h1>

            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0">
              3v3 charity basketball tournament in honor of Matthew Molloy.
              Every dollar goes to scholarships and charities that carry on his legacy.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-amber-500 text-white font-extrabold text-lg rounded-xl hover:bg-amber-600 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/25"
              >
                Register
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <a
                href="#proceeds"
                className="inline-flex items-center gap-2.5 px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-lg rounded-xl hover:bg-white/20 transition-all"
              >
                Donate
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </a>
            </div>

          </div>

          <div className="lg:w-2/5 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-amber-500/10 rounded-full blur-3xl" />
              <Image
                src="/add2.png"
                alt="Molloy Madness"
                width={420}
                height={420}
                className="relative drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
