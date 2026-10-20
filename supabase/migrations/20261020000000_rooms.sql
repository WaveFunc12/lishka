-- Private rooms and the daily leaderboard.
-- Players sign in (Apple, or an emailed code), pick a display name, and join rooms by a 6-letter code.
-- Everyone in a room sees each other's daily score; nobody else does. All writes go through the
-- functions at the bottom or through row-level security; the client never sees another room.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 24),
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  name text not null check (char_length(btrim(name)) between 1 and 30),
  owner uuid not null references public.profiles on delete cascade,
  created_at timestamptz not null default now()
);

create table public.room_members (
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);
create index room_members_user on public.room_members (user_id);

-- One result per player per day. Points and distance come from the app (rooms are among friends).
create table public.daily_results (
  user_id uuid not null references public.profiles on delete cascade,
  day date not null,
  points smallint not null check (points between 0 and 5),
  total_km real not null check (total_km >= 0 and total_km < 5000),
  squares text not null check (squares ~ '^[🟩🟥]{5}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);
create index daily_results_day on public.daily_results (day);

-- The day as the app counts it: Israel time.
create function public.israel_today() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Asia/Jerusalem')::date
$$;

-- True when the signed-in player shares a room with `other` (or is `other`).
create function public.is_roommate(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select other = auth.uid() or exists (
    select 1 from public.room_members a join public.room_members b using (room_id)
    where a.user_id = auth.uid() and b.user_id = other
  )
$$;

create function public.is_member(room uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.room_members where room_id = room and user_id = auth.uid())
$$;

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.daily_results enable row level security;

create policy "see roommates" on public.profiles for select to authenticated using (public.is_roommate(id));
create policy "own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "rename self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "see my rooms" on public.rooms for select to authenticated using (public.is_member(id));
create policy "rename my room" on public.rooms for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());

create policy "see my rooms' members" on public.room_members for select to authenticated using (public.is_member(room_id));
create policy "leave a room" on public.room_members for delete to authenticated using (user_id = auth.uid());

create policy "see roommates' results" on public.daily_results for select to authenticated using (public.is_roommate(user_id));
-- Today's result (or yesterday's, for a game finished around midnight), once.
create policy "post my result" on public.daily_results for insert to authenticated
  with check (user_id = auth.uid() and day between public.israel_today() - 1 and public.israel_today());

revoke all on public.profiles, public.rooms, public.room_members, public.daily_results from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, update on public.rooms to authenticated;
grant select, delete on public.room_members to authenticated;
grant select, insert on public.daily_results to authenticated;

-- Create a room with a fresh code; the creator is its first member.
create function public.create_room(p_name text) returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare
  r public.rooms;
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I, O, 0, 1
  c text;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'no profile'; end if;
  if (select count(*) from public.room_members where user_id = auth.uid()) >= 20 then raise exception 'too many rooms'; end if;
  loop
    c := (select string_agg(substr(letters, 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 6));
    begin
      insert into public.rooms (code, name, owner) values (c, btrim(p_name), auth.uid()) returning * into r;
      exit;
    exception when unique_violation then -- try another code
    end;
  end loop;
  insert into public.room_members (room_id, user_id) values (r.id, auth.uid());
  return r;
end $$;

-- Join by code (any case, spaces ignored). Joining a room twice is fine.
create function public.join_room(p_code text) returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare r public.rooms;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'no profile'; end if;
  select * into r from public.rooms where code = upper(regexp_replace(p_code, '\s', '', 'g'));
  if r.id is null then raise exception 'no such room'; end if;
  if not public.is_member(r.id) then
    if (select count(*) from public.room_members where room_id = r.id) >= 50 then raise exception 'room is full'; end if;
    if (select count(*) from public.room_members where user_id = auth.uid()) >= 20 then raise exception 'too many rooms'; end if;
    insert into public.room_members (room_id, user_id) values (r.id, auth.uid());
  end if;
  return r;
end $$;

-- A room's table for one day: everyone in the room, played or not, best first
-- (more points, then less total distance, then who finished first).
create function public.room_day(p_room uuid, p_day date)
returns table (user_id uuid, name text, points smallint, total_km real, squares text, me boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.name, d.points, d.total_km, d.squares, p.id = auth.uid()
  from public.room_members m
  join public.profiles p on p.id = m.user_id
  left join public.daily_results d on d.user_id = m.user_id and d.day = p_day
  where m.room_id = p_room and public.is_member(p_room)
  order by d.points desc nulls last, d.total_km asc nulls last, d.created_at asc nulls last, p.name
$$;

-- A room's table for the 7 days ending on p_end: points and distance summed.
create function public.room_week(p_room uuid, p_end date)
returns table (user_id uuid, name text, points bigint, total_km double precision, days bigint, me boolean)
language sql stable security definer set search_path = '' as $$
  select p.id, p.name, coalesce(sum(d.points), 0), coalesce(sum(d.total_km), 0), count(d.day), p.id = auth.uid()
  from public.room_members m
  join public.profiles p on p.id = m.user_id
  left join public.daily_results d on d.user_id = m.user_id and d.day between p_end - 6 and p_end
  where m.room_id = p_room and public.is_member(p_room)
  group by p.id, p.name
  order by 3 desc, 4 asc, p.name
$$;

-- How everyone did today, with no names: for "you beat 70% of players".
create function public.day_stats(p_day date)
returns table (players bigint, by_points bigint[])
language sql stable security definer set search_path = '' as $$
  select (select count(*) from public.daily_results where day = p_day),
    array(select (select count(*) from public.daily_results where day = p_day and points = k) from generate_series(0, 5) k)
$$;

revoke execute on function public.create_room, public.join_room, public.room_day, public.room_week, public.day_stats from public, anon;
grant execute on function public.create_room, public.join_room, public.room_day, public.room_week, public.day_stats to authenticated;
