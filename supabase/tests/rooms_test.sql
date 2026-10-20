-- Run: createdb t && psql t -f mock_auth.sql -f ../migrations/*.sql -f rooms_test.sql
-- Fails loudly (ON_ERROR_STOP) on the first broken expectation.
\set ON_ERROR_STOP 1
insert into auth.users values ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b'), ('00000000-0000-0000-0000-00000000000c');

create function pg_temp.as_user(u text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u, false); end $$;
create function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin if not ok then raise exception 'FAILED: %', what; end if; raise notice 'ok: %', what; end $$;

set role authenticated;
-- Gal (a) makes a profile and a room; Noa (b) joins by code; Dan (c) is in no room.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.profiles (id, name) values (auth.uid(), 'גל');
create temp table r as select * from public.create_room('המשפחה');
select pg_temp.check((select code ~ '^[A-HJ-NP-Z2-9]{6}$' from r), 'room code is 6 clear letters');
select code as room_code, id as room_id from r \gset
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.profiles (id, name) values (auth.uid(), 'נועה');
select pg_temp.check((select count(*) from public.rooms) = 0, 'a room is invisible before joining');
select public.join_room(lower(:'room_code'));
select public.join_room(:'room_code'); -- twice is fine
select pg_temp.check((select count(*) from public.room_members) = 2, 'joined once, sees both members');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into public.profiles (id, name) values (auth.uid(), 'דן');

-- Results: today is allowed, last week is not, twice is not.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.daily_results (user_id, day, points, total_km, squares) values (auth.uid(), public.israel_today(), 3, 41.5, '🟩🟩🟥🟩🟥');
do $$ begin
  insert into public.daily_results (user_id, day, points, total_km, squares) values (auth.uid(), public.israel_today() - 7, 5, 1, '🟩🟩🟩🟩🟩');
  raise exception 'FAILED: an old day was accepted';
exception when insufficient_privilege then raise notice 'ok: old days refused'; end $$;
do $$ begin
  insert into public.daily_results (user_id, day, points, total_km, squares) values (auth.uid(), public.israel_today(), 5, 1, '🟩🟩🟩🟩🟩');
  raise exception 'FAILED: a second result was accepted';
exception when unique_violation then raise notice 'ok: one result a day'; end $$;
do $$ begin
  insert into public.daily_results (user_id, day, points, total_km, squares) values ('00000000-0000-0000-0000-00000000000b', public.israel_today(), 5, 1, '🟩🟩🟩🟩🟩');
  raise exception 'FAILED: posted for someone else';
exception when insufficient_privilege then raise notice 'ok: cannot post for others'; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
insert into public.daily_results (user_id, day, points, total_km, squares) values (auth.uid(), public.israel_today(), 3, 20, '🟩🟥🟩🟩🟥');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
insert into public.daily_results (user_id, day, points, total_km, squares) values (auth.uid(), public.israel_today(), 5, 2, '🟩🟩🟩🟩🟩');

-- The room's table: Noa first (same points, less distance), Dan not in it.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select array_agg(name) from public.room_day(:'room_id', public.israel_today())) = array['נועה', 'גל'], 'room table: points, then distance');
select pg_temp.check((select count(*) from public.daily_results) = 2, 'only roommates'' results are visible');
select pg_temp.check((select count(*) from public.profiles) = 2, 'only roommates'' names are visible');
select pg_temp.check((select points from public.room_week(:'room_id', public.israel_today()) where me) = 3, 'week totals');
select pg_temp.check((select players from public.day_stats(public.israel_today())) = 3 and (select by_points[6] from public.day_stats(public.israel_today())) = 1, 'anonymous day stats');

-- Dan, an outsider, sees nothing of the room.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from public.room_day(:'room_id', public.israel_today())) = 0, 'outsiders get an empty table');
do $$ begin
  perform public.join_room('ZZZZZZ');
  raise exception 'FAILED: joined a missing room';
exception when raise_exception then
  if sqlerrm like 'FAILED%' then raise; end if;
  raise notice 'ok: unknown code refused';
end $$;

-- Noa leaves; Gal no longer sees her.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
delete from public.room_members where user_id = auth.uid();
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select count(*) from public.room_day(:'room_id', public.israel_today())) = 1, 'leaving removes you from the table');

-- Leaving is reversible: Noa rejoins. Only the owner can remove someone (Gal removes Dan), and a removed player can't come back.
select set_config('t.code', :'room_code', false), set_config('t.room', :'room_id', false);
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.join_room(:'room_code');
do $$ begin
  perform public.remove_member(current_setting('t.room')::uuid, '00000000-0000-0000-0000-00000000000a');
  raise exception 'FAILED: a member removed the owner';
exception when raise_exception then
  if sqlerrm like 'FAILED%' then raise; end if;
  raise notice 'ok: only the owner removes';
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select public.join_room(:'room_code');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.remove_member(:'room_id', '00000000-0000-0000-0000-00000000000c');
select pg_temp.check((select count(*) from public.room_day(:'room_id', public.israel_today())) = 2, 'removed member is off the table');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
do $$ begin
  perform public.join_room(current_setting('t.code'));
  raise exception 'FAILED: removed player rejoined';
exception when raise_exception then
  if sqlerrm like 'FAILED%' then raise; end if;
  raise notice 'ok: removed player cannot rejoin (%)', sqlerrm;
end $$;

-- Anonymous visitors can't call anything.
reset role;
set role anon;
do $$ begin
  perform public.create_room('x');
  raise exception 'FAILED: anon created a room';
exception when insufficient_privilege then raise notice 'ok: anon refused'; end $$;
reset role;
\echo ALL ROOM TESTS PASSED
