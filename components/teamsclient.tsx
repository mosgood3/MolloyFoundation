"use client";

import { useState, useMemo } from "react";
import { TEAMS_PAGE_SIZE, CONTACT_EMAIL } from "@/lib/constants";
import { useTeams } from "@/actions/useteams";
import { TeamsTable } from "@/components/teamstable";
import { PaginationControls } from "@/components/paginationcontrols";
import type { Team, FreeAgent } from "@/actions/teams";

type View = "teams" | "freeagents";

type Props = {
  initialTeams: Team[];
  initialTotal: number;
  freeAgents?: FreeAgent[];
  showToggle?: boolean;
};

export default function TeamsClient({
  initialTeams,
  initialTotal,
  freeAgents = [],
  showToggle = false,
}: Props) {
  const [view, setView] = useState<View>("teams");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { teams, total, loading, error } = useTeams(
    page,
    TEAMS_PAGE_SIZE,
    initialTeams,
    initialTotal
  );

  const totalPages = Math.ceil(total / TEAMS_PAGE_SIZE);

  const query = search.toLowerCase().trim();

  const filteredTeams = useMemo(() => {
    if (!query) return teams;
    return teams.filter(
      (t) =>
        t.team_name.toLowerCase().includes(query) ||
        t.player1.toLowerCase().includes(query) ||
        t.player2.toLowerCase().includes(query) ||
        t.player3.toLowerCase().includes(query) ||
        (t.player4 && t.player4.toLowerCase().includes(query))
    );
  }, [teams, query]);

  const filteredAgents = useMemo(() => {
    if (!query) return freeAgents;
    return freeAgents.filter(
      (a) =>
        a.player_name.toLowerCase().includes(query) ||
        a.division.toLowerCase().includes(query)
    );
  }, [freeAgents, query]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Toggle */}
      {showToggle ? (
        <div className="flex justify-center">
          <div className="inline-flex bg-slate-200 rounded-xl p-1 gap-1 border border-slate-300">
            <button
              onClick={() => {
                setView("teams");
                setPage(1);
                setSearch("");
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${
                view === "teams"
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              Registered Teams
            </button>
            <button
              onClick={() => {
                setView("freeagents");
                setSearch("");
              }}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                view === "freeagents"
                  ? "bg-amber-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              Looking for a Team
              {freeAgents.length > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-amber-600 text-xs font-bold">
                  {freeAgents.length}
                </span>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              view === "teams"
                ? "Search teams or players..."
                : "Search players..."
            }
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Teams view */}
      {view === "teams" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-gray-500 text-sm">
              <span className="text-slate-800 font-semibold">{total}</span>{" "}
              team{total !== 1 ? "s" : ""} registered
              {query && (
                <span className="text-amber-600 font-medium">
                  {" "}
                  &middot; {filteredTeams.length} matching
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-amber-500">
                <svg
                  className="w-5 h-5 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </div>
            </div>
          )}

          <TeamsTable teams={filteredTeams} />

          {!query && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              loading={loading}
              onPrevious={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          )}
        </>
      )}

      {/* Free agents view */}
      {view === "freeagents" && (
        <>
          <p className="text-gray-500 text-sm">
            <span className="text-slate-800 font-semibold">
              {freeAgents.length}
            </span>{" "}
            player{freeAgents.length !== 1 ? "s" : ""} looking for a team
            {query && (
              <span className="text-amber-600 font-medium">
                {" "}
                &middot; {filteredAgents.length} matching
              </span>
            )}
          </p>

          {filteredAgents.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 mx-auto text-slate-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <p className="text-slate-500 text-lg font-medium">
                {query
                  ? "No players match your search."
                  : "No free agents registered yet."}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Register as a single player and we&apos;ll find you a team!
              </p>
            </div>
          ) : (
            <div className="w-full">
              {/* Desktop Table */}
              <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Player
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Division
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAgents.map((agent, i) => (
                      <tr
                        key={i}
                        className={`border-b border-slate-100 last:border-b-0 transition-colors hover:bg-amber-50/50 ${
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800">
                            {agent.player_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                            {agent.division}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="block sm:hidden space-y-3">
                {filteredAgents.map((agent, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-amber-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {agent.player_name.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-bold text-slate-800">
                          {agent.player_name}
                        </span>
                      </div>
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        {agent.division}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact banner */}
          <div className="bg-amber-500 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold">
                Want to team up with any of these players?
              </p>
              <p className="text-amber-100 text-sm mt-0.5">
                Reach out and we&apos;ll help coordinate a team for the
                tournament.
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-600 font-bold text-sm rounded-xl hover:bg-amber-50 transition whitespace-nowrap shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Contact Us
            </a>
          </div>
        </>
      )}
    </div>
  );
}
