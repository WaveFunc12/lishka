-- Progress backup: each signed-in player's saved game, so a new phone picks up where the old one left off.
-- Only the player can read or write their own row.

create table public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  state jsonb not null check (jsonb_typeof(state) = 'object' and pg_column_size(state) < 200000),
  xp integer not null default 0 check (xp >= 0),
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;
create policy "read my progress" on public.progress for select to authenticated using (user_id = auth.uid());
create policy "save my progress" on public.progress for insert to authenticated with check (user_id = auth.uid());
create policy "update my progress" on public.progress for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke all on public.progress from anon;
grant select, insert, update on public.progress to authenticated;
