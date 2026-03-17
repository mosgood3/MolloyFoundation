// components/proceeds.tsx
import { getTotalRaised, get2026Total, getTopDonors } from "@/actions/proceeds";
import DonateWidget from "./donate-widget";

export default async function Proceeds() {
  let lastYearTotal = 0;
  let thisYearTotal = 0;
  let topDonors: Awaited<ReturnType<typeof getTopDonors>> = [];

  try {
    [lastYearTotal, thisYearTotal, topDonors] = await Promise.all([
      getTotalRaised(),
      get2026Total(),
      getTopDonors(10),
    ]);
  } catch (err) {
    console.error("Failed to load proceeds:", err);
  }

  const charities = [
    {
      title: "The Matthew C. Molloy Memorial Scholarship",
      description:
        "Awarded annually to a Rocky Hill High School graduate who embodies Matt's spirit of competition and character.",
      href: null,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
        </svg>
      ),
    },
    {
      title: "Special Olympics",
      description:
        "Year-round sports training & competition for people with intellectual disabilities, promoting inclusion, courage, and community spirit.",
      href: "https://www.specialolympics.org/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 0 1-2.032 1.077 6.003 6.003 0 0 1-4.516 0 6.003 6.003 0 0 1-2.032-1.077" />
        </svg>
      ),
    },
    {
      title: "Hole in the Wall Gang Camp",
      description:
        "Free, life-changing camp programs for kids facing serious illness — founded by Paul Newman to bring healing and happiness.",
      href: "https://www.holeinthewallgang.org/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
    },
    {
      title: "Do It For The Love",
      description:
        "Connecting cancer survivors, caregivers & advocates with resources, events & community through music, hope, and shared experiences.",
      href: "https://doitforthelove.org/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="proceeds" className="relative bg-slate-50 border-t border-slate-100 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-32 -left-20 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-40 -right-20 w-[400px] h-[400px] bg-amber-100/25 rounded-full blur-[100px]" />

      {/* ── Donation hero ── */}
      <div className="relative py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 2026 Total */}
          <div className="text-center mb-6">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-4">
              2026 Donations
            </p>
            <p className="text-7xl sm:text-9xl font-black text-slate-800 leading-none">
              ${thisYearTotal.toLocaleString()}
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="h-px w-16 bg-amber-500/40" />
              <span className="text-slate-400 font-medium text-xs uppercase tracking-[0.25em]">
                Raised so far
              </span>
              <span className="h-px w-16 bg-amber-500/40" />
            </div>
          </div>

          {/* Last year note */}
          {lastYearTotal > 0 && (
            <p className="text-center text-gray-500 text-sm mb-14">
              We raised <span className="text-slate-800 font-semibold">${lastYearTotal.toLocaleString()}</span> across
              all previous tournaments. Help us beat that this year.
            </p>
          )}

          <DonateWidget />

          {/* Top donors */}
          {topDonors.length > 0 && (
            <div className="mt-16 max-w-2xl mx-auto">
              <p className="text-center text-slate-400 text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                2026 Donor Wall
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {topDonors.map((d, i) => (
                  <div
                    key={`${d.donor_name}-${i}`}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 border transition ${
                      i === 0
                        ? "bg-amber-50 border-amber-300 text-amber-700"
                        : i < 3
                        ? "bg-white border-slate-200 text-slate-700"
                        : "bg-white border-slate-100 text-slate-500"
                    }`}
                  >
                    {i === 0 && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium text-sm">{d.donor_name}</span>
                    <span className="text-xs opacity-60">${d.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Charities ── */}
      <div className="relative border-t border-slate-100 bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              Our Impact
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-5">
              Where the Proceeds Go
            </h2>
            <p className="text-lg text-gray-500 leading-relaxed">
              All tournament proceeds are donated to causes that reflect Matthew&apos;s
              spirit and values. Together, we&apos;re making a difference in his name.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {charities.map((c) => {
              const Tag = c.href ? "a" : "div";
              const linkProps = c.href
                ? { href: c.href, target: "_blank" as const, rel: "noopener noreferrer" }
                : {};
              return (
                <Tag
                  key={c.title}
                  {...linkProps}
                  className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-amber-200"
                >
                  {/* Top accent bar */}
                  <div className="h-1 bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:bg-amber-100 transition-colors">
                      {c.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-amber-600 transition-colors mb-2">
                      {c.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-grow">
                      {c.description}
                    </p>
                    {c.href && (
                      <div className="mt-5 pt-4 border-t border-slate-100 inline-flex items-center text-amber-600 text-sm font-semibold group-hover:text-amber-700">
                        Learn more
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </Tag>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
