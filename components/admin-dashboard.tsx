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

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6 max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="flex-1 py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 text-white font-semibold text-sm rounded-xl hover:bg-amber-600 transition"
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
              className="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm rounded-xl hover:bg-slate-50 transition"
            >
              Clear
            </button>
          )}
        </form>

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

function TeamsTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <table className="w-full">
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
  );
}

function SinglesTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <table className="w-full">
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
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {String(r.division ?? "")}
              </span>
            </td>
            <td className={td}>{String(r.email ?? "")}</td>
            <td className={td}>{String(r.phone ?? "")}</td>
            <td className={td}>{formatDate(r.created_at as string)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DonationsTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <table className="w-full">
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
            <td className={`${td} font-semibold text-green-600`}>
              ${Number(r.amount ?? 0).toLocaleString()}
            </td>
            <td className={td}>{String(r.donor_name ?? "Anonymous")}</td>
            <td className={td}>{String(r.donor_email ?? "—")}</td>
            <td className={td}>
              <SourceBadge source={String(r.source ?? "")} />
            </td>
            <td className={td}>{formatDate(r.created_at as string)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WaiversTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <table className="w-full">
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
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Signed
                </span>
              ) : (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-600">
                  Pending
                </span>
              )}
            </td>
            <td className={td}>
              {r.signed_at ? formatDate(r.signed_at as string) : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function VolunteersTable({ rows }: { rows: Record<string, unknown>[] }) {
  return (
    <table className="w-full">
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
                {String(r.interests ?? "")
                  .split(", ")
                  .filter(Boolean)
                  .map((interest, j) => (
                    <span
                      key={j}
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700"
                    >
                      {interest}
                    </span>
                  ))}
              </div>
            </td>
            <td className={td}>{formatDate(r.created_at as string)}</td>
          </tr>
        ))}
      </tbody>
    </table>
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
