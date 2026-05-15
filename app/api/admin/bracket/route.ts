import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabaseadmin";
import { ADMIN_EMAIL } from "@/lib/admin";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

const teamIdOrNull = z.union([z.number().int().positive(), z.null()]);

const updateSchema = z.object({
  action: z.literal("update"),
  game_number: z.number().int().min(1).max(37),
  team1_id: teamIdOrNull.optional(),
  team2_id: teamIdOrNull.optional(),
  winner_id: teamIdOrNull.optional(),
});

const resetSchema = z.object({
  action: z.literal("reset"),
  confirm: z.literal("RESET"),
});

const bodySchema = z.discriminatedUnion("action", [updateSchema, resetSchema]);

type GameState = {
  game_number: number;
  team1_source: string | null;
  team2_source: string | null;
  team1_id: number | null;
  team2_id: number | null;
  winner_id: number | null;
};

// Re-resolve dependent slots and propagate downstream until stable.
function propagate(gamesMap: Map<number, GameState>, startGameNumber: number) {
  const queue: number[] = [startGameNumber];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const refNum = queue.shift()!;
    if (visited.has(refNum)) continue;
    visited.add(refNum);

    const refGame = gamesMap.get(refNum);
    if (!refGame) continue;

    // For every game that references refNum in either slot, recompute that slot.
    for (const game of gamesMap.values()) {
      for (const slot of ["team1", "team2"] as const) {
        const src = game[`${slot}_source`];
        if (!src) continue;
        const m = src.match(/^(WOG|LOG):(\d+)$/);
        if (!m) continue;
        if (Number(m[2]) !== refNum) continue;

        let newId: number | null = null;
        if (
          refGame.winner_id !== null &&
          refGame.team1_id !== null &&
          refGame.team2_id !== null
        ) {
          newId =
            m[1] === "WOG"
              ? refGame.winner_id
              : refGame.winner_id === refGame.team1_id
                ? refGame.team2_id
                : refGame.team1_id;
        }

        const idKey = `${slot}_id` as const;
        if (game[idKey] !== newId) {
          game[idKey] = newId;
          // Clear winner if it no longer matches either assigned team.
          if (
            game.winner_id !== null &&
            game.winner_id !== game.team1_id &&
            game.winner_id !== game.team2_id
          ) {
            game.winner_id = null;
          }
          queue.push(game.game_number);
        }
      }
    }
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [gamesRes, teamsRes] = await Promise.all([
    supabaseAdmin
      .from("bracket_games_2026")
      .select(
        "game_number, round_label, bracket_side, display_order, court, hoop, team1_source, team2_source, team1_id, team2_id, winner_id, is_if_necessary, updated_at"
      )
      .order("game_number", { ascending: true }),
    supabaseAdmin
      .from("teams_2026")
      .select("id, team_name, division")
      .order("team_name", { ascending: true }),
  ]);

  if (gamesRes.error) {
    return Response.json({ error: gamesRes.error.message }, { status: 500 });
  }
  if (teamsRes.error) {
    return Response.json({ error: teamsRes.error.message }, { status: 500 });
  }

  return Response.json({
    games: gamesRes.data ?? [],
    teams: teamsRes.data ?? [],
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request body", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.action === "reset") {
    const { error } = await supabaseAdmin
      .from("bracket_games_2026")
      .update({ team1_id: null, team2_id: null, winner_id: null })
      .gte("game_number", 1);
    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  }

  const { game_number, team1_id, team2_id, winner_id } = parsed.data;

  // Load all games to support propagation.
  const { data: allGames, error: fetchErr } = await supabaseAdmin
    .from("bracket_games_2026")
    .select("game_number, team1_source, team2_source, team1_id, team2_id, winner_id");

  if (fetchErr) {
    return Response.json({ error: fetchErr.message }, { status: 500 });
  }
  if (!allGames) {
    return Response.json({ error: "Failed to load games" }, { status: 500 });
  }

  const gamesMap = new Map<number, GameState>();
  const original = new Map<number, GameState>();
  for (const g of allGames as GameState[]) {
    gamesMap.set(g.game_number, { ...g });
    original.set(g.game_number, { ...g });
  }

  const target = gamesMap.get(game_number);
  if (!target) {
    return Response.json({ error: "Game not found" }, { status: 404 });
  }

  // Apply the requested patch to the target.
  if (team1_id !== undefined) target.team1_id = team1_id;
  if (team2_id !== undefined) target.team2_id = team2_id;
  if (winner_id !== undefined) target.winner_id = winner_id;

  // Validate winner is one of the two assigned teams (or null).
  if (
    target.winner_id !== null &&
    target.winner_id !== target.team1_id &&
    target.winner_id !== target.team2_id
  ) {
    return Response.json(
      { error: "Winner must be one of the two assigned teams" },
      { status: 400 }
    );
  }

  // Auto-clear winner if teams changed and the previous winner no longer matches.
  if (
    target.winner_id !== null &&
    target.winner_id !== target.team1_id &&
    target.winner_id !== target.team2_id
  ) {
    target.winner_id = null;
  }

  // Cascade-propagate from the target through all downstream games.
  propagate(gamesMap, game_number);

  // Identify changed games and persist them.
  const changes: GameState[] = [];
  for (const [gn, g] of gamesMap) {
    const o = original.get(gn);
    if (!o) continue;
    if (
      g.team1_id !== o.team1_id ||
      g.team2_id !== o.team2_id ||
      g.winner_id !== o.winner_id
    ) {
      changes.push(g);
    }
  }

  for (const c of changes) {
    const { error } = await supabaseAdmin
      .from("bracket_games_2026")
      .update({
        team1_id: c.team1_id,
        team2_id: c.team2_id,
        winner_id: c.winner_id,
      })
      .eq("game_number", c.game_number);
    if (error) {
      return Response.json(
        { error: `Failed at game ${c.game_number}: ${error.message}` },
        { status: 500 }
      );
    }
  }

  return Response.json({ success: true, changed: changes.length });
}
