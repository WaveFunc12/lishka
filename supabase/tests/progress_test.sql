-- Progress backup: own row only. Runs after rooms_test.sql (same users).
\set ON_ERROR_STOP 1
create or replace function pg_temp.as_user(u text) returns void language plpgsql as $$
begin perform set_config('request.jwt.claim.sub', u, false); end $$;
create or replace function pg_temp.check(ok boolean, what text) returns void language plpgsql as $$
begin if not ok then raise exception 'FAILED: %', what; end if; raise notice 'ok: %', what; end $$;

set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
insert into public.progress (user_id, state, xp) values (auth.uid(), '{"xp": 120}', 120);
insert into public.progress (user_id, state, xp) values (auth.uid(), '{"xp": 150}', 150)
  on conflict (user_id) do update set state = excluded.state, xp = excluded.xp, updated_at = now();
select pg_temp.check((select xp from public.progress) = 150, 'saving again updates my backup');
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b');
select pg_temp.check((select count(*) from public.progress) = 0, 'a roommate cannot read my backup');
update public.progress set xp = 0;
do $$ begin
  insert into public.progress (user_id, state) values ('00000000-0000-0000-0000-00000000000a', '{}');
  raise exception 'FAILED: wrote someone else''s backup';
exception when insufficient_privilege or unique_violation then raise notice 'ok: cannot write someone else''s backup'; end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a');
select pg_temp.check((select xp from public.progress) = 150, 'my backup is untouched');
do $$ begin
  insert into public.progress (user_id, state) values (auth.uid(), '[1]')
    on conflict (user_id) do update set state = excluded.state;
  raise exception 'FAILED: a non-object state was accepted';
exception when check_violation then raise notice 'ok: state must be an object'; end $$;
reset role;
set role anon;
do $$ begin
  perform 1 from public.progress;
  raise exception 'FAILED: anon read backups';
exception when insufficient_privilege then raise notice 'ok: anon refused'; end $$;
reset role;
\echo ALL PROGRESS TESTS PASSED
