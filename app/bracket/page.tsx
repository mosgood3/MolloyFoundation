import Header from "@/components/header";
import Footer from "@/components/footer";
import BracketView from "@/components/bracket-view";
import { supabase } from "@/lib/supabase";
import type { BracketGame, TeamLite } from "@/lib/bracket-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bracket — Molloy Madness",
  description:
    "Live bracket for the 2026 Molloy Madness 3v3 charity basketball tournament.",
};

export default async function BracketPage() {
  const [gamesRes, teamsRes] = await Promise.all([
    supabase
      .from("bracket_games_2026")
      .select(
        "game_number, round_label, bracket_side, display_order, court, hoop, team1_source, team2_source, team1_id, team2_id, winner_id, is_if_necessary, updated_at"
      )
      .order("game_number", { ascending: true }),
    supabase
      .from("teams_2026")
      .select("id, team_name, division")
      .order("team_name", { ascending: true }),
  ]);

  const games = (gamesRes.data ?? []) as BracketGame[];
  const teams = (teamsRes.data ?? []) as TeamLite[];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <div className="pt-32 pb-8 border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-600 font-semibold uppercase tracking-widest text-sm mb-3">
              2026 Tournament
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800">
              Bracket
            </h1>
            <p className="mt-4 text-slate-500 text-sm">
              Competitive Division · Double Elimination
            </p>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {games.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              Bracket has not been published yet. Check back closer to game day.
            </div>
          ) : (
            <BracketView games={games} teams={teams} readOnly />
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
