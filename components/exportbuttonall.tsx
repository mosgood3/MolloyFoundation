"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function ExportAllButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportCSV = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/teams?page=1&pageSize=10000");
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to fetch");

      const rows = json.teams as Array<{
        team_name: string;
        player1: string;
        player2: string;
        player3: string;
        player4: string | null;
      }>;

      if (!rows || rows.length === 0) throw new Error("No teams to export");

      const keys = ["team_name", "player1", "player2", "player3", "player4"];
      const header = keys.join(",") + "\n";

      const sanitizeCell = (value: unknown): string => {
        const cell = value == null ? "" : String(value);
        const escaped = cell.replace(/"/g, '""');
        if (/^[=+\-@\t\r]/.test(escaped)) {
          return `"'${escaped}"`;
        }
        return `"${escaped}"`;
      };

      const csvBody = rows
        .map((row) =>
          keys
            .map((k) => sanitizeCell(row[k as keyof typeof row]))
            .join(",")
        )
        .join("\n");

      const blob = new Blob([header + csvBody], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "teams-all.csv";
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to export CSV";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={exportCSV}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
    >
      <Download size={15} />
      {loading ? "Exporting..." : "Export CSV"}
      {error && <span className="text-red-500 text-xs">({error})</span>}
    </button>
  );
}
