"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Tab = "teams" | "singles" | "donations" | "waivers" | "volunteers";

type Stats = {
  teams: number;
  singles: number;
  totalDonations: number;
  waiversSigned: number;
  waiversTotal: number;
  volunteers: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("teams");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab,
        page: String(page),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
      setPageSize(json.pageSize ?? 20);
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin?tab=stats");
      if (!res.ok) return;
      const json = await res.json();
      setStats(json);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  function handleTabChange(newTab: Tab) {
    setTab(newTab);
    setPage(1);
    setSearch("");
    setSearchInput("");
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const [exporting, setExporting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTabs, setExportTabs] = useState<Tab[]>([]);

  const columnMap: Record<Tab, string[]> = {
    teams: ["team_name", "division", "team_email", "team_phone", "player1", "player1shirt", "player1email", "player2", "player2shirt", "player2email", "player3", "player3shirt", "player3email", "player4", "player4shirt", "player4email", "created_at"],
    singles: ["player_name", "player_shirt", "division", "email", "phone", "created_at"],
    donations: ["amount", "donor_name", "donor_email", "source", "created_at"],
    waivers: ["player_name", "player_email", "team_name", "registration_type", "signed", "signed_name", "signed_at", "created_at"],
    volunteers: ["name", "email", "phone", "interests", "created_at"],
  };

  function toggleExportTab(t: Tab) {
    setExportTabs((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  async function fetchAllForTab(t: Tab): Promise<Record<string, unknown>[]> {
    const allRows: Record<string, unknown>[] = [];
    let p = 1;
    let hasMore = true;
    while (hasMore) {
      const params = new URLSearchParams({ tab: t, page: String(p) });
      const res = await fetch(`/api/admin?${params}`);
      if (!res.ok) break;
      const json = await res.json();
      allRows.push(...(json.data ?? []));
      hasMore = allRows.length < (json.total ?? 0);
      p++;
    }
    return allRows;
  }

  function toCsv(rows: Record<string, unknown>[], cols: string[]): string {
    const sanitize = (v: unknown): string => {
      const cell = v == null ? "" : String(v);
      const escaped = cell.replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(escaped)) return `"'${escaped}"`;
      return `"${escaped}"`;
    };
    const header = cols.join(",") + "\n";
    const body = rows.map((row) => cols.map((c) => sanitize(row[c])).join(",")).join("\n");
    return header + body;
  }

  function downloadCsv(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExport() {
    if (exportTabs.length === 0) return;
    setExporting(true);
    try {
      for (const t of exportTabs) {
        const rows = await fetchAllForTab(t);
        if (rows.length === 0) continue;
        const csv = toCsv(rows, columnMap[t]);
        downloadCsv(csv, `${t}-export.csv`);
      }
    } catch {
      // silently fail
    } finally {
      setExporting(false);
      setShowExportModal(false);
      setExportTabs([]);
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  const tabs: { key: Tab; label: string }[] = [
    { key: "teams", label: "Teams" },
    { key: "singles", label: "Singles" },
    { key: "donations", label: "Donations" },
    { key: "waivers", label: "Waivers" },
    { key: "volunteers", label: "Volunteers" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-slate-800">
            Molloy Madness Admin
          </h1>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-slate-700 font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard label="Teams" value={stats.teams} />
            <StatCard label="Singles" value={stats.singles} />
            <StatCard
              label="Total Raised"
              value={`$${stats.totalDonations.toLocaleString()}`}
            />
            <StatCard
              label="Waivers Signed"
              value={`${stats.waiversSigned} / ${stats.waiversTotal}`}
            />
            <StatCard label="Volunteers" value={stats.volunteers} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + Export */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="flex-1 min-w-0 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 text-white font-semibold text-sm rounded-xl hover:bg-amber-600 transition shrink-0"
            >
              Search
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                  setPage(1);
                }}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition shrink-0"
              >
                Clear
              </button>
            )}
          </form>
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-semibold text-sm rounded-xl hover:bg-slate-700 transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="text-lg font-extrabold text-slate-800 mb-1">Export Reports</h3>
              <p className="text-sm text-slate-500 mb-5">Select which reports to download as CSV.</p>

              <div className="space-y-2 mb-6">
                {tabs.map((t) => {
                  const checked = exportTabs.includes(t.key);
                  return (
                    <label
                      key={t.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition ${
                        checked
                          ? "bg-amber-50 border-2 border-amber-500"
                          : "bg-slate-50 border-2 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleExportTab(t.key)}
                        className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className={`text-sm font-semibold ${checked ? "text-amber-700" : "text-slate-700"}`}>
                        {t.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowExportModal(false); setExportTabs([]); }}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting || exportTabs.length === 0}
                  className="flex-1 py-2.5 bg-amber-500 text-white font-bold text-sm rounded-xl hover:bg-amber-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {exporting ? "Exporting..." : `Export ${exportTabs.length > 0 ? `(${exportTabs.length})` : ""}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading...</div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              {search ? "No results found." : "No data yet."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {tab === "teams" && <TeamsTable rows={data} />}
              {tab === "singles" && <SinglesTable rows={data} />}
              {tab === "donations" && <DonationsTable rows={data} />}
              {tab === "waivers" && <WaiversTable rows={data} />}
              {tab === "volunteers" && <VolunteersTable rows={data} />}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center px-3 text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const th =
  "px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider";
const td = "px-4 py-3 text-sm text-slate-700 whitespace-nowrap";

// Shared mobile card field
function CardField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-sm text-slate-700 text-right">{children}</span>
    </div>
  );
}

function TeamsTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <>
      {/* Desktop */}
      <table className="w-full hidden md:table">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className={th}>Team</th>
            <th className={th}>Division</th>
            <th className={th}>Players</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition">
              <td className={`${td} font-semibold`}>{String(r.team_name ?? "")}</td>
              <td className={td}>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  {String(r.division ?? "")}
                </span>
              </td>
              <td className={`${td} max-w-xs`}>
                <div className="space-y-0.5">
                  <p>{String(r.player1 ?? "")} <span className="text-slate-400">({String(r.player1shirt ?? "")})</span></p>
                  <p>{String(r.player2 ?? "")} <span className="text-slate-400">({String(r.player2shirt ?? "")})</span></p>
                  <p>{String(r.player3 ?? "")} <span className="text-slate-400">({String(r.player3shirt ?? "")})</span></p>
                  {r.player4 ? (
                    <p>{String(r.player4)} <span className="text-slate-400">({String(r.player4shirt ?? "")})</span></p>
                  ) : null}
                </div>
              </td>
              <td className={td}>{String(r.team_email ?? "")}</td>
              <td className={td}>{String(r.team_phone ?? "")}</td>
              <td className={td}>{formatDate(r.created_at as string)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Mobile */}
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800">{String(r.team_name ?? "")}</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{String(r.division ?? "")}</span>
            </div>
            <CardField label="Players">
              <div className="space-y-0.5 text-right">
                <p>{String(r.player1 ?? "")}</p>
                <p>{String(r.player2 ?? "")}</p>
                <p>{String(r.player3 ?? "")}</p>
                {r.player4 ? <p>{String(r.player4)}</p> : null}
              </div>
            </CardField>
            <CardField label="Email">{String(r.team_email ?? "")}</CardField>
            <CardField label="Phone">{String(r.team_phone ?? "")}</CardField>
            <CardField label="Date">{formatDate(r.created_at as string)}</CardField>
          </div>
        ))}
      </div>
    </>
  );
}

function SinglesTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <>
      <table className="w-full hidden md:table">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className={th}>Player</th>
            <th className={th}>Shirt</th>
            <th className={th}>Division</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>Registered</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition">
              <td className={`${td} font-semibold`}>{String(r.player_name ?? "")}</td>
              <td className={td}>{String(r.player_shirt ?? "")}</td>
              <td className={td}>
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{String(r.division ?? "")}</span>
              </td>
              <td className={td}>{String(r.email ?? "")}</td>
              <td className={td}>{String(r.phone ?? "")}</td>
              <td className={td}>{formatDate(r.created_at as string)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800">{String(r.player_name ?? "")}</p>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{String(r.division ?? "")}</span>
            </div>
            <CardField label="Shirt">{String(r.player_shirt ?? "")}</CardField>
            <CardField label="Email">{String(r.email ?? "")}</CardField>
            <CardField label="Phone">{String(r.phone ?? "")}</CardField>
            <CardField label="Date">{formatDate(r.created_at as string)}</CardField>
          </div>
        ))}
      </div>
    </>
  );
}

function DonationsTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <>
      <table className="w-full hidden md:table">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className={th}>Amount</th>
            <th className={th}>Donor</th>
            <th className={th}>Email</th>
            <th className={th}>Source</th>
            <th className={th}>Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition">
              <td className={`${td} font-semibold text-green-600`}>${Number(r.amount ?? 0).toLocaleString()}</td>
              <td className={td}>{String(r.donor_name ?? "Anonymous")}</td>
              <td className={td}>{String(r.donor_email ?? "—")}</td>
              <td className={td}><SourceBadge source={String(r.source ?? "")} /></td>
              <td className={td}>{formatDate(r.created_at as string)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-green-600 text-lg">${Number(r.amount ?? 0).toLocaleString()}</p>
              <SourceBadge source={String(r.source ?? "")} />
            </div>
            <CardField label="Donor">{String(r.donor_name ?? "Anonymous")}</CardField>
            <CardField label="Email">{String(r.donor_email ?? "—")}</CardField>
            <CardField label="Date">{formatDate(r.created_at as string)}</CardField>
          </div>
        ))}
      </div>
    </>
  );
}

function WaiversTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <>
      <table className="w-full hidden md:table">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className={th}>Player</th>
            <th className={th}>Email</th>
            <th className={th}>Team</th>
            <th className={th}>Type</th>
            <th className={th}>Status</th>
            <th className={th}>Signed At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition">
              <td className={`${td} font-semibold`}>{String(r.player_name ?? "")}</td>
              <td className={td}>{String(r.player_email ?? "")}</td>
              <td className={td}>{String(r.team_name ?? "—")}</td>
              <td className={td}>{String(r.registration_type ?? "")}</td>
              <td className={td}>
                {r.signed ? (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Signed</span>
                ) : (
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Pending</span>
                )}
              </td>
              <td className={td}>{r.signed_at ? formatDate(r.signed_at as string) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-slate-800">{String(r.player_name ?? "")}</p>
              {r.signed ? (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Signed</span>
              ) : (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">Pending</span>
              )}
            </div>
            <CardField label="Email">{String(r.player_email ?? "")}</CardField>
            <CardField label="Team">{String(r.team_name ?? "—")}</CardField>
            <CardField label="Type">{String(r.registration_type ?? "")}</CardField>
            {r.signed_at ? <CardField label="Signed">{formatDate(r.signed_at as string)}</CardField> : null}
          </div>
        ))}
      </div>
    </>
  );
}

function VolunteersTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <>
      <table className="w-full hidden md:table">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className={th}>Name</th>
            <th className={th}>Email</th>
            <th className={th}>Phone</th>
            <th className={th}>Interests</th>
            <th className={th}>Signed Up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition">
              <td className={`${td} font-semibold`}>{String(r.name ?? "")}</td>
              <td className={td}>{String(r.email ?? "")}</td>
              <td className={td}>{String(r.phone ?? "")}</td>
              <td className={td}>
                <div className="flex flex-wrap gap-1">
                  {String(r.interests ?? "").split(", ").filter(Boolean).map((interest, j) => (
                    <span key={j} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{interest}</span>
                  ))}
                </div>
              </td>
              <td className={td}>{formatDate(r.created_at as string)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((r, i) => (
          <div key={i} className="p-4 space-y-2">
            <p className="font-bold text-slate-800">{String(r.name ?? "")}</p>
            <CardField label="Email">{String(r.email ?? "")}</CardField>
            <CardField label="Phone">{String(r.phone ?? "")}</CardField>
            <div className="flex flex-wrap gap-1 pt-1">
              {String(r.interests ?? "").split(", ").filter(Boolean).map((interest, j) => (
                <span key={j} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">{interest}</span>
              ))}
            </div>
            <CardField label="Date">{formatDate(r.created_at as string)}</CardField>
          </div>
        ))}
      </div>
    </>
  );
}

function SourceBadge({ source }: { source: string }) {
  const styles: Record<string, string> = {
    donation: "bg-purple-100 text-purple-700",
    registration: "bg-blue-100 text-blue-700",
    singles_registration: "bg-teal-100 text-teal-700",
  };
  const labels: Record<string, string> = {
    donation: "Donation",
    registration: "Team Reg",
    singles_registration: "Singles Reg",
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[source] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {labels[source] ?? source}
    </span>
  );
}
