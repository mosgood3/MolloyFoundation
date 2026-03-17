// actions/proceeds.ts
import { supabaseAdmin } from '@/lib/supabaseadmin';

type Summary = { total_amount: string };

/** Total raised across all years (from the existing view). */
export async function getTotalRaised(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('DonationsSummary')
    .select('total_amount')
    .single();

  if (error) {
    console.error('Failed to fetch total raised:', error.message);
    return 0;
  }

  return Number((data as Summary)?.total_amount ?? 0);
}

/** Total raised for 2026. */
export async function get2026Total(): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('donations_2026')
    .select('amount');

  if (error) {
    console.error('Failed to fetch 2026 total:', error.message);
    return 0;
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export type TopDonor = {
  donor_name: string;
  total: number;
};

/** Top donors for 2026, ranked by total donated. */
export async function getTopDonors(limit = 10): Promise<TopDonor[]> {
  const { data, error } = await supabaseAdmin
    .from('donations_2026')
    .select('donor_name, amount');

  if (error) {
    console.error('Failed to fetch top donors:', error.message);
    return [];
  }

  // Aggregate by donor name (null names grouped as "Anonymous")
  const totals = new Map<string, number>();
  for (const row of data ?? []) {
    const name = row.donor_name || 'Anonymous';
    totals.set(name, (totals.get(name) ?? 0) + Number(row.amount));
  }

  return Array.from(totals.entries())
    .map(([donor_name, total]) => ({ donor_name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
