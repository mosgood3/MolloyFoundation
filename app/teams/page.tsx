import Header from "@/components/header";
import Footer from "@/components/footer";
import TeamsClient from "@/components/teamsclient";
import { getTeams, getFreeAgents } from "@/actions/teams";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Teams — Molloy Madness",
  description: "View all registered teams for the Molloy Madness 3v3 charity basketball tournament.",
};

export default async function TeamsPage() {
  const [{ teams: initialTeams, total: initialTotal }, freeAgents] =
    await Promise.all([getTeams(1), getFreeAgents()]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        {/* Hero band */}
        <div className="pt-32 pb-12 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              2026 Tournament
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800">
              Registered Teams
            </h1>
          </div>
        </div>

        <TeamsClient
          initialTeams={initialTeams}
          initialTotal={initialTotal}
          freeAgents={freeAgents}
          showToggle
        />
      </main>
      <Footer />
    </>
  );
}
