// actions/teams.ts
import { supabase } from '@/lib/supabase';
import { TEAMS_PAGE_SIZE } from '@/lib/constants';

export type Team = {
  team_name: string;
  player1: string;
  player2: string;
  player3: string;
  player4: string | null;
};

export type FreeAgent = {
  player_name: string;
  division: string;
};

export async function getTeams(page: number, pageSize: number = TEAMS_PAGE_SIZE) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('teams_2026')
    .select('team_name, player1, player2, player3, player4', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    teams: (data as Team[]) ?? [],
    total: count ?? 0,
  };
}

export async function getFreeAgents(): Promise<FreeAgent[]> {
  const { data, error } = await supabase
    .from('singles_2026')
    .select('player_name, division')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data as FreeAgent[]) ?? [];
}
