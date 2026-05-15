export type BracketSide = "winners" | "losers" | "finals";

export type TeamId = number;

export type BracketGame = {
  game_number: number;
  round_label: string;
  bracket_side: BracketSide;
  display_order: number;
  court: number | null;
  hoop: number | null;
  team1_source: string | null;
  team2_source: string | null;
  team1_id: TeamId | null;
  team2_id: TeamId | null;
  winner_id: TeamId | null;
  is_if_necessary: boolean;
  updated_at: string;
};

export type TeamLite = {
  id: TeamId;
  team_name: string;
  division: string;
};

export const WINNERS_ROUNDS = [
  "Round 1",
  "Round 2",
  "Round 3",
  "Round 4",
  "Semifinals",
] as const;

export const LOSERS_ROUNDS = [
  "Losers Round 1",
  "Losers Round 2",
  "Losers Round 3",
  "Losers Round 4",
  "Losers Round 5",
  "Losers Round 6",
  "Losers Round 7",
] as const;

export const FINALS_ROUND = "Finals" as const;

// Parse a source string like "WOG:5" or "LOG:12" — returns { type, gameNumber } or null.
export function parseSource(
  source: string | null
): { type: "WOG" | "LOG"; gameNumber: number } | null {
  if (!source) return null;
  const m = source.match(/^(WOG|LOG):(\d+)$/);
  if (!m) return null;
  return { type: m[1] as "WOG" | "LOG", gameNumber: Number(m[2]) };
}

// Given the source ref and the upstream game, return the resolved team id (or null).
export function resolveSource(
  source: string | null,
  games: BracketGame[]
): TeamId | null {
  const parsed = parseSource(source);
  if (!parsed) return null;
  const upstream = games.find((g) => g.game_number === parsed.gameNumber);
  if (!upstream || upstream.winner_id == null || upstream.team1_id == null || upstream.team2_id == null) {
    return null;
  }
  if (parsed.type === "WOG") return upstream.winner_id;
  // LOG = loser of game = the other team
  return upstream.winner_id === upstream.team1_id ? upstream.team2_id : upstream.team1_id;
}

// Format court/hoop badge. Shows "Court X · Hoop Y" if both set, "Court X" if only court.
export function formatCourtHoop(
  court: number | null,
  hoop: number | null
): string | null {
  if (court == null) return null;
  if (hoop == null) return `Court ${court}`;
  return `Court ${court} · Hoop ${hoop}`;
}
