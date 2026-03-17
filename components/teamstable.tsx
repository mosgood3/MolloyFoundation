import type { Team } from "@/actions/teams";

export function TeamsTable({ teams }: { teams: Team[] }) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        <p className="text-slate-500 text-lg font-medium">No teams registered yet.</p>
        <p className="text-slate-400 text-sm mt-1">Be the first to sign up!</p>
      </div>
    );
  }

  const headers = ["Team Name", "Player 1", "Player 2", "Player 3", "Player 4"];

  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teams.map((team, i) => (
              <tr
                key={`${team.team_name}-${i}`}
                className={`border-b border-slate-100 last:border-b-0 transition-colors hover:bg-amber-50/50 ${
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <td className="px-6 py-4">
                  <span className="font-bold text-slate-800">{team.team_name}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{team.player1}</td>
                <td className="px-6 py-4 text-gray-600">{team.player2}</td>
                <td className="px-6 py-4 text-gray-600">{team.player3}</td>
                <td className="px-6 py-4 text-gray-600">
                  {team.player4 || <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="block sm:hidden space-y-3">
        {teams.map((team) => {
          const players = [team.player1, team.player2, team.player3, team.player4].filter(Boolean) as string[];
          return (
            <div
              key={team.team_name}
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-amber-300 hover:shadow-sm transition-all"
            >
              <p className="text-lg font-bold text-slate-800 mb-4">{team.team_name}</p>
              <div className="space-y-2.5">
                {players.map((player, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 text-sm">{player}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
