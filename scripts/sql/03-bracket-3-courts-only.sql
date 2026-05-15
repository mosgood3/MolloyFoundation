-- 2026 Tournament Bracket — switch to 3-court layout (no hoops)
--
-- Use this INSTEAD of re-running 02-bracket-games-seed-2026.sql if you've
-- already entered team assignments or winners and don't want to lose them.
-- This only updates court + hoop columns; team and winner data is untouched.

update public.bracket_games_2026
set
  court = case
    when game_number = 36 then 1   -- Grand Final on Court 1
    when game_number = 37 then 1   -- Grand Final Reset on Court 1
    else ((game_number - 1) % 3) + 1
  end,
  hoop = null;
