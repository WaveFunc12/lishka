-- Deleting an account. Runs after the other tests (Gal owns a room; Noa left it).
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u, false); end $$;
create or replace function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin if not ok then raise exception 'FAILED: %', what; end if; raise notice 'ok: %', what; end $$;

set role authenticated;
-- Noa rejoins Gal's room; Dan opens a room of his own.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select code as room_code, id as room_id from public.rooms limit 1 \gset
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select public.join_room(:'room_code');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select id as solo_id from public.create_room('לבד') \gset

-- Gal deletes the account: the room stays, now Noa's; Gal's name, results and backup are gone.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select public.delete_my_account();
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select owner from public.rooms where id = :'room_id') = auth.uid(), 'the room passes to the next member');
select pg_temp.check((select count(*) from public.room_day(:'room_id', public.israel_today())) = 1, 'the deleted player leaves the table');
reset role;
select pg_temp.check(not exists (select 1 from auth.users where id = '00000000-0000-0000-0000-00000000000a'), 'the account is gone');
select pg_temp.check(not exists (select 1 from public.profiles where id = '00000000-0000-0000-0000-00000000000a')
  and not exists (select 1 from public.daily_results where user_id = '00000000-0000-0000-0000-00000000000a')
  and not exists (select 1 from public.progress where user_id = '00000000-0000-0000-0000-00000000000a'), 'name, results and backup are gone');

-- Dan deletes too: his room had nobody else, so it goes.
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c');
select public.delete_my_account();
reset role;
select pg_temp.check(not exists (select 1 from public.rooms where id = :'solo_id'), 'an empty room is deleted with its owner');

set role anon;
do $$ begin
  perform public.delete_my_account();
  raise exception 'FAILED: anon called delete';
exception when insufficient_privilege then raise notice 'ok: anon refused'; end $$;
reset role;
\echo ALL DELETE TESTS PASSED
