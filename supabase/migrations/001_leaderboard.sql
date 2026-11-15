create table if not exists public.leaderboard (
  id bigint generated always as identity primary key,
  player_name text not null check (char_length(player_name) between 1 and 18),
  score integer not null check (score between 0 and 500000),
  level_reached integer not null check (level_reached between 1 and 33),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_score_created_at_idx
  on public.leaderboard (score desc, created_at asc);

alter table public.leaderboard enable row level security;

create policy "Leaderboard is readable by everyone"
  on public.leaderboard for select
  to anon
  using (true);
