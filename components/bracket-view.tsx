"use client";

import { useMemo, useState } from "react";
import {
  BracketGame,
  TeamLite,
  TeamId,
  WINNERS_ROUNDS,
  LOSERS_ROUNDS,
  FINALS_ROUND,
  formatCourtHoop,
} from "@/lib/bracket-config";
import GameEditorModal from "./game-editor-modal";

type Props = {
  games: BracketGame[];
  teams: TeamLite[];
  readOnly?: boolean;
  onUpdate?: () => Promise<void> | void;
};

export default function BracketView({ games, teams, readOnly = false, onUpdate }: Props) {
  const [editing, setEditing] = useState<BracketGame | null>(null);

  const teamById = useMemo(() => {
    const map = new Map<TeamId, TeamLite>();
    for (const t of teams) map.set(t.id, t);
    return map;
  }, [teams]);

  const byRound = useMemo(() => {
    const map = new Map<string, BracketGame[]>();
    for (const g of games) {
      const arr = map.get(g.round_label) ?? [];
      arr.push(g);
      map.set(g.round_label, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => a.display_order - b.display_order);
    }
    return map;
  }, [games]);

  function onCardClick(game: BracketGame) {
    if (readOnly) return;
    setEditing(game);
  }

  async function handleEditorClose(refresh: boolean) {
    setEditing(null);
    if (refresh && onUpdate) {
      await onUpdate();
    }
  }

  return (
    <div className="space-y-8">
      {/* Winners bracket */}
      <BracketSection title="Winners Bracket">
        <div className="flex gap-6 overflow-x-auto pb-3">
          {WINNERS_ROUNDS.map((round) => (
            <RoundColumn
              key={round}
              title={round}
              games={byRound.get(round) ?? []}
              teamById={teamById}
              onCardClick={onCardClick}
              readOnly={readOnly}
            />
          ))}
          <RoundColumn
            title={FINALS_ROUND}
            games={byRound.get(FINALS_ROUND) ?? []}
            teamById={teamById}
            onCardClick={onCardClick}
            readOnly={readOnly}
          />
        </div>
      </BracketSection>

      {/* Losers bracket */}
      <BracketSection title="Losers Bracket">
        <div className="flex gap-6 overflow-x-auto pb-3">
          {LOSERS_ROUNDS.map((round) => (
            <RoundColumn
              key={round}
              title={round}
              games={byRound.get(round) ?? []}
              teamById={teamById}
              onCardClick={onCardClick}
              readOnly={readOnly}
            />
          ))}
        </div>
      </BracketSection>

      {!readOnly && editing && (
        <GameEditorModal
          game={editing}
          teams={teams}
          onClose={handleEditorClose}
        />
      )}
    </div>
  );
}

function BracketSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function RoundColumn({
  title,
  games,
  teamById,
  onCardClick,
  readOnly,
}: {
  title: string;
  games: BracketGame[];
  teamById: Map<TeamId, TeamLite>;
  onCardClick: (g: BracketGame) => void;
  readOnly: boolean;
}) {
  return (
    <div className="shrink-0 w-56 sm:w-64">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 text-center">
        {title}
      </h3>
      <div className="space-y-3">
        {games.length === 0 && (
          <div className="text-xs text-slate-300 italic text-center py-6">
            (no games)
          </div>
        )}
        {games.map((g) => (
          <GameCard
            key={g.game_number}
            game={g}
            teamById={teamById}
            onClick={() => onCardClick(g)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}

function GameCard({
  game,
  teamById,
  onClick,
  readOnly,
}: {
  game: BracketGame;
  teamById: Map<TeamId, TeamLite>;
  onClick: () => void;
  readOnly: boolean;
}) {
  const team1 = game.team1_id ? teamById.get(game.team1_id) : null;
  const team2 = game.team2_id ? teamById.get(game.team2_id) : null;
  const winnerIsTeam1 = !!game.winner_id && game.winner_id === game.team1_id;
  const winnerIsTeam2 = !!game.winner_id && game.winner_id === game.team2_id;
  const ch = formatCourtHoop(game.court, game.hoop);

  const clickable = !readOnly;
  const wrapperClass = `relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm ${
    clickable ? "cursor-pointer hover:border-amber-400 hover:shadow transition" : ""
  } ${game.is_if_necessary ? "border-dashed" : ""}`;

  const content = (
    <>
      {/* Header row: game # + court/hoop */}
      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {game.is_if_necessary ? "* " : ""}Game {game.game_number}
        </span>
        {ch && (
          <span className="text-[10px] font-medium text-slate-400">{ch}</span>
        )}
      </div>
      <TeamRow
        team={team1}
        sourceHint={game.team1_source}
        isWinner={winnerIsTeam1}
        dimmed={!!game.winner_id && !winnerIsTeam1}
      />
      <div className="h-px bg-slate-100" />
      <TeamRow
        team={team2}
        sourceHint={game.team2_source}
        isWinner={winnerIsTeam2}
        dimmed={!!game.winner_id && !winnerIsTeam2}
      />
    </>
  );

  if (!clickable) {
    return <div className={wrapperClass}>{content}</div>;
  }
  return (
    <button type="button" onClick={onClick} className={`${wrapperClass} w-full text-left`}>
      {content}
    </button>
  );
}

function TeamRow({
  team,
  sourceHint,
  isWinner,
  dimmed,
}: {
  team: TeamLite | null | undefined;
  sourceHint: string | null;
  isWinner: boolean;
  dimmed: boolean;
}) {
  const label = team?.team_name ?? (sourceHint ? humanizeSource(sourceHint) : "—");
  return (
    <div
      className={`px-3 py-2 text-sm flex items-center justify-between ${
        isWinner
          ? "bg-amber-50 font-bold text-slate-800"
          : dimmed
            ? "text-slate-400"
            : "text-slate-700"
      }`}
    >
      <span className="truncate">{label}</span>
      {isWinner && (
        <span className="text-amber-600 text-[10px] font-bold ml-2 shrink-0">
          WIN
        </span>
      )}
    </div>
  );
}

function humanizeSource(src: string): string {
  const m = src.match(/^(WOG|LOG):(\d+)$/);
  if (!m) return src;
  return m[1] === "WOG" ? `Winner of #${m[2]}` : `Loser of #${m[2]}`;
}
