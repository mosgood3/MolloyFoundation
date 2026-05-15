"use client";

import { useCallback, useEffect, useState } from "react";
import type { BracketGame, TeamLite } from "@/lib/bracket-config";
import BracketView from "./bracket-view";

export default function AdminBracketPanel() {
  const [games, setGames] = useState<BracketGame[]>([]);
  const [teams, setTeams] = useState<TeamLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bracket");
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to load bracket");
      }
      const json = await res.json();
      setGames(json.games ?? []);
      setTeams(json.teams ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load bracket");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleReset() {
    if (resetInput !== "RESET") return;
    setResetting(true);
    try {
      const res = await fetch("/api/admin/bracket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", confirm: "RESET" }),
      });
      if (!res.ok) throw new Error("Reset failed");
      await fetchData();
      setShowResetModal(false);
      setResetInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading bracket...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold mb-1">Could not load bracket</p>
        <p className="text-sm">{error}</p>
        <p className="text-xs mt-3 text-red-600">
          If the table doesn&apos;t exist yet, run{" "}
          <code>scripts/sql/01-bracket-games-schema.sql</code> and{" "}
          <code>scripts/sql/02-bracket-games-seed-2026.sql</code> in the Supabase SQL editor.
        </p>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
        <p className="font-semibold mb-1">Bracket not seeded</p>
        <p className="text-sm">
          Run <code>scripts/sql/02-bracket-games-seed-2026.sql</code> in the Supabase SQL
          editor to populate the 37-game shell.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Click any game card to assign teams and pick a winner.
        </p>
        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="text-xs font-semibold text-red-600 hover:text-red-700 transition"
        >
          Reset bracket
        </button>
      </div>

      <BracketView games={games} teams={teams} onUpdate={fetchData} />

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-extrabold text-slate-800 mb-1">Reset bracket</h3>
            <p className="text-sm text-slate-500 mb-4">
              This clears every team assignment and winner across all 37 games. This
              cannot be undone.
            </p>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Type <strong>RESET</strong> to confirm
            </label>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent mb-5"
              placeholder="RESET"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetInput("");
                }}
                disabled={resetting}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetInput !== "RESET" || resetting}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold text-sm rounded-xl hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
