-- A room's owner can remove someone from it (App Store guideline 1.2: a way to deal with an abusive user).
-- The removed player can't rejoin with the code; leaving on your own stays reversible.

create table public.room_bans (
  room_id uuid not null references public.rooms on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  primary key (room_id, user_id)
);
alter table public.room_bans enable row level security; -- no policies: only the functions below touch it
revoke all on public.room_bans from anon, authenticated;

create function public.remove_member(p_room uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.rooms where id = p_room and owner = auth.uid()) then raise exception 'not the owner'; end if;
  if p_user = auth.uid() then raise exception 'not yourself'; end if;
  delete from public.room_members where room_id = p_room and user_id = p_user;
  insert into public.room_bans (room_id, user_id) values (p_room, p_user) on conflict do nothing;
end $$;

-- join_room again, now refusing anyone the owner removed.
create or replace function public.join_room(p_code text) returns public.rooms
language plpgsql security definer set search_path = '' as $$
declare r public.rooms;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'no profile'; end if;
  select * into r from public.rooms where code = upper(regexp_replace(p_code, '\s', '', 'g'));
  if r.id is null then raise exception 'no such room'; end if;
  if exists (select 1 from public.room_bans where room_id = r.id and user_id = auth.uid()) then raise exception 'removed from room'; end if;
  if not public.is_member(r.id) then
    if (select count(*) from public.room_members where room_id = r.id) >= 50 then raise exception 'room is full'; end if;
    if (select count(*) from public.room_members where user_id = auth.uid()) >= 20 then raise exception 'too many rooms'; end if;
    insert into public.room_members (room_id, user_id) values (r.id, auth.uid());
  end if;
  return r;
end $$;

revoke execute on function public.remove_member, public.join_room from public, anon;
grant execute on function public.remove_member, public.join_room to authenticated;
