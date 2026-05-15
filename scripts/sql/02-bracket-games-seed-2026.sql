-- 2026 Tournament Bracket — initial seed (19-team Competitive Division, double-elim)
-- Run AFTER 01-bracket-games-schema.sql.
--
-- Standard 19-team double-elimination structure:
--   WB R1 (G1-3):   3 play-in games for seeds 14-19. Admin assigns teams manually.
--   WB R2 (G4-11):  Round of 16 — 13 bye seeds + 3 WB R1 winners. Bye seeds are manual.
--   WB R3 (G19-22): Quarterfinals. Fully auto-populated from WB R2 winners.
--   WB R4 (G29-30): Semifinals. Fully auto-populated from WB R3 winners.
--   WB Final (G34): Auto-populated from WB R4 winners.
--   LB R1-R7:       All auto-populated from WB losers + LB winners.
--   Final (G36):    WB Final winner vs LB Final winner.
--   Reset (G37):    Plays only if LB winner takes G36.

truncate table public.bracket_games_2026;

insert into public.bracket_games_2026
  (game_number, round_label, bracket_side, display_order, court, hoop, team1_source, team2_source, is_if_necessary)
values
  -- ── Winners Bracket Round 1 (play-in, 3 games — admin assigns teams) ──
  (1,  'Round 1',         'winners', 1, 1, 1, null,      null,      false),
  (2,  'Round 1',         'winners', 2, 1, 2, null,      null,      false),
  (3,  'Round 1',         'winners', 3, 2, 3, null,      null,      false),

  -- ── Winners Bracket Round 2 (Round of 16, 8 games — bye seeds manual, play-in winners auto) ──
  (4,  'Round 2',         'winners', 1, 1, 1, null,      'WOG:1',   false),
  (5,  'Round 2',         'winners', 2, 1, 2, null,      null,      false),
  (6,  'Round 2',         'winners', 3, 2, 3, null,      null,      false),
  (7,  'Round 2',         'winners', 4, 1, 1, null,      null,      false),
  (8,  'Round 2',         'winners', 5, 1, 2, null,      'WOG:2',   false),
  (9,  'Round 2',         'winners', 6, 2, 3, null,      null,      false),
  (10, 'Round 2',         'winners', 7, 1, 1, null,      'WOG:3',   false),
  (11, 'Round 2',         'winners', 8, 1, 2, null,      null,      false),

  -- ── Losers Bracket Round 1 (3 games — WB R1 losers vs early WB R2 losers) ──
  (12, 'Losers Round 1',  'losers',  1, 2, 3, 'LOG:1',   'LOG:4',   false),
  (13, 'Losers Round 1',  'losers',  2, 1, 1, 'LOG:2',   'LOG:8',   false),
  (14, 'Losers Round 1',  'losers',  3, 1, 2, 'LOG:3',   'LOG:10',  false),

  -- ── Losers Bracket Round 2 (4 games — LB R1 winners vs remaining WB R2 losers) ──
  (15, 'Losers Round 2',  'losers',  1, 2, 3, 'WOG:12',  'LOG:5',   false),
  (16, 'Losers Round 2',  'losers',  2, 1, 1, 'WOG:13',  'LOG:6',   false),
  (17, 'Losers Round 2',  'losers',  3, 1, 2, 'WOG:14',  'LOG:7',   false),
  (18, 'Losers Round 2',  'losers',  4, 2, 3, 'LOG:9',   'LOG:11',  false),

  -- ── Winners Bracket Round 3 (Quarterfinals, 4 games) ──
  (19, 'Round 3',         'winners', 1, 1, 1, 'WOG:4',   'WOG:5',   false),
  (20, 'Round 3',         'winners', 2, 1, 2, 'WOG:6',   'WOG:7',   false),
  (21, 'Round 3',         'winners', 3, 2, 3, 'WOG:8',   'WOG:9',   false),
  (22, 'Round 3',         'winners', 4, 1, 1, 'WOG:10',  'WOG:11',  false),

  -- ── Losers Bracket Round 3 (4 games — LB R2 winners vs WB R3 losers) ──
  (23, 'Losers Round 3',  'losers',  1, 1, 2, 'WOG:15',  'LOG:19',  false),
  (24, 'Losers Round 3',  'losers',  2, 2, 3, 'WOG:16',  'LOG:20',  false),
  (25, 'Losers Round 3',  'losers',  3, 1, 1, 'WOG:17',  'LOG:21',  false),
  (26, 'Losers Round 3',  'losers',  4, 1, 2, 'WOG:18',  'LOG:22',  false),

  -- ── Losers Bracket Round 4 (2 games — LB R3 winner pairs) ──
  (27, 'Losers Round 4',  'losers',  1, 2, 3, 'WOG:23',  'WOG:24',  false),
  (28, 'Losers Round 4',  'losers',  2, 1, 1, 'WOG:25',  'WOG:26',  false),

  -- ── Winners Bracket Round 4 (Semifinals, 2 games) ──
  (29, 'Round 4',         'winners', 1, 1, 2, 'WOG:19',  'WOG:20',  false),
  (30, 'Round 4',         'winners', 2, 2, 3, 'WOG:21',  'WOG:22',  false),

  -- ── Losers Bracket Round 5 (2 games — LB R4 winners vs WB R4 losers) ──
  (31, 'Losers Round 5',  'losers',  1, 1, 1, 'WOG:27',  'LOG:29',  false),
  (32, 'Losers Round 5',  'losers',  2, 1, 2, 'WOG:28',  'LOG:30',  false),

  -- ── Losers Bracket Round 6 (1 game — LB R5 winner pair) ──
  (33, 'Losers Round 6',  'losers',  1, 2, 3, 'WOG:31',  'WOG:32',  false),

  -- ── Winners Bracket Final (called "Semifinals" on Challonge bracket image) ──
  (34, 'Semifinals',      'winners', 1, 1, 1, 'WOG:29',  'WOG:30',  false),

  -- ── Losers Bracket Final ──
  (35, 'Losers Round 7',  'losers',  1, 1, 2, 'WOG:33',  'LOG:34',  false),

  -- ── Grand Final ──
  (36, 'Finals',          'finals',  1, 1, 1, 'WOG:34',  'WOG:35',  false),

  -- ── Grand Final Reset (only if LB winner takes G36) ──
  (37, 'Finals',          'finals',  2, 1, 1, 'WOG:34',  'WOG:36',  true);
