-- 2026 Tournament Bracket — schema
-- Run this in the Supabase SQL editor.
--
-- Structure (which game feeds which) is data-driven via team1_source / team2_source.
-- Examples of valid source values:
--   NULL              -- admin fills team manually (used for first-round games)
--   'WOG:5'           -- winner of game 5
--   'LOG:5'           -- loser of game 5
--
-- Writes are restricted to the service role (server actions). Public read only.

create table if not exists public.bracket_games_2026 (
  game_number       int primary key,
  round_label       text not null,
  bracket_side      text not null check (bracket_side in ('winners', 'losers', 'finals')),
  display_order     int not null,                        -- visual top-to-bottom ordering within a round
  court             int,
  hoop              int,
  team1_source      text,
  team2_source      text,
  team1_id          bigint references public.teams_2026(id) on delete set null,
  team2_id          bigint references public.teams_2026(id) on delete set null,
  winner_id         bigint references public.teams_2026(id) on delete set null,
  is_if_necessary   boolean not null default false,
  updated_at        timestamptz not null default now()
);

create index if not exists bracket_games_2026_side_round
  on public.bracket_games_2026 (bracket_side, round_label);

alter table public.bracket_games_2026 enable row level security;

-- Public read for /bracket page.
drop policy if exists "bracket_games_2026_public_read" on public.bracket_games_2026;
create policy "bracket_games_2026_public_read"
  on public.bracket_games_2026
  for select
  using (true);

-- No insert/update/delete policies => only service-role bypasses RLS.

create or replace function public.bracket_games_2026_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bracket_games_2026_touch_updated_at on public.bracket_games_2026;
create trigger bracket_games_2026_touch_updated_at
  before update on public.bracket_games_2026
  for each row execute function public.bracket_games_2026_touch_updated_at();
