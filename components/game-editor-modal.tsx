"use client";

import { useState } from "react";
import type { BracketGame, TeamLite, TeamId } from "@/lib/bracket-config";

type Props = {
  game: BracketGame;
  teams: TeamLite[];
  onClose: (refresh: boolean) => void;
};

export default function GameEditorModal({ game, teams, onClose }: Props) {
  const [team1Id, setTeam1Id] = useState<TeamId | null>(game.team1_id);
  const [team2Id, setTeam2Id] = useState<TeamId | null>(game.team2_id);
  const [winnerId, setWinnerId] = useState<TeamId | null>(game.winner_id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const winnerDirty = winnerId !== game.winner_id;
  const hadWinner = game.winner_id != null;
  const winnerChanging = winnerDirty && hadWinner && winnerId !== null;

  // Winner must be one of the two selected teams.
  const winnerChoices = [team1Id, team2Id].filter(
    (id): id is TeamId => id !== null
  );
  const winnerInvalid = winnerId !== null && !winnerChoices.includes(winnerId);

  async function save() {
    setError(null);

    // If user changed teams, server will auto-clear winner if it no longer matches.
    if (winnerInvalid) {
      setError("Winner must be one of the two selected teams.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          game_number: game.game_number,
          team1_id: team1Id,
          team2_id: team2Id,
          winner_id: winnerInvalid ? null : winnerId,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Save failed");
      }
      onClose(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
      setSaving(false);
    }
  }

  async function clearGame() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          game_number: game.game_number,
          team1_id: null,
          team2_id: null,
          winner_id: null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Clear failed");
      }
      onClose(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Clear failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-md">
        <div className="flex items-baseline justify-between mb-5">
          <h3 className="text-lg font-extrabold text-slate-800">
            Game {game.game_number}
            {game.is_if_necessary && (
              <span className="ml-2 text-xs font-medium text-slate-400">
                (if necessary)
              </span>
            )}
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {game.round_label}
          </span>
        </div>

        <div className="space-y-4">
          <TeamSelect
            label="Team 1"
            value={team1Id}
            sourceHint={game.team1_source}
            teams={teams}
            excludeId={team2Id}
            onChange={(id) => {
              setTeam1Id(id);
              if (winnerId === team1Id && id !== team1Id) setWinnerId(null);
            }}
          />
          <TeamSelect
            label="Team 2"
            value={team2Id}
            sourceHint={game.team2_source}
            teams={teams}
            excludeId={team1Id}
            onChange={(id) => {
              setTeam2Id(id);
              if (winnerId === team2Id && id !== team2Id) setWinnerId(null);
            }}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Winner
            </label>
            <div className="grid grid-cols-2 gap-2">
              <WinnerButton
                selected={winnerId === team1Id && team1Id !== null}
                disabled={team1Id === null}
                onClick={() => setWinnerId(team1Id)}
                label={
                  team1Id
                    ? teams.find((t) => t.id === team1Id)?.team_name ?? "Team 1"
                    : "Team 1"
                }
              />
              <WinnerButton
                selected={winnerId === team2Id && team2Id !== null}
                disabled={team2Id === null}
                onClick={() => setWinnerId(team2Id)}
                label={
                  team2Id
                    ? teams.find((t) => t.id === team2Id)?.team_name ?? "Team 2"
                    : "Team 2"
                }
              />
            </div>
            {winnerId !== null && (
              <button
                type="button"
                onClick={() => setWinnerId(null)}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Clear winner
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {winnerChanging && !confirmingClear && (
          <div className="mt-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            You&apos;re changing a winner that was already recorded.
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => onClose(false)}
            disabled={saving}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || winnerInvalid}
            className="flex-1 py-2.5 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>

        {(game.team1_id || game.team2_id || game.winner_id) && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {confirmingClear ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingClear(false)}
                  disabled={saving}
                  className="flex-1 py-2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={clearGame}
                  disabled={saving}
                  className="flex-1 py-2 bg-red-50 text-red-700 font-semibold text-xs rounded-lg hover:bg-red-100 transition"
                >
                  Yes, clear game
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingClear(true)}
                className="w-full py-2 text-xs text-slate-500 hover:text-red-600 transition"
              >
                Clear this game (reset teams and winner)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamSelect({
  label,
  value,
  sourceHint,
  teams,
  excludeId,
  onChange,
}: {
  label: string;
  value: TeamId | null;
  sourceHint: string | null;
  teams: TeamLite[];
  excludeId: TeamId | null;
  onChange: (id: TeamId | null) => void;
}) {
  const placeholder = sourceHint
    ? `(${humanizeSource(sourceHint)})`
    : "Select team...";
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value == null ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
      >
        <option value="">{placeholder}</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id} disabled={t.id === excludeId}>
            {t.team_name} ({t.division})
          </option>
        ))}
      </select>
    </div>
  );
}

function WinnerButton({
  selected,
  disabled,
  onClick,
  label,
}: {
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 transition truncate ${
        disabled
          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
          : selected
            ? "bg-amber-500 text-white border-amber-500"
            : "bg-white text-slate-700 border-slate-200 hover:border-amber-300"
      }`}
    >
      {label}
    </button>
  );
}

function humanizeSource(src: string): string {
  const m = src.match(/^(WOG|LOG):(\d+)$/);
  if (!m) return src;
  return m[1] === "WOG" ? `Winner of #${m[2]}` : `Loser of #${m[2]}`;
}
