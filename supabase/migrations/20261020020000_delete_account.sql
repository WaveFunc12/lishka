-- Deleting an account (the App Store requires it in the app): the player's profile, results, memberships and
-- backup go with it. Rooms they opened pass to the member who joined next, so friends keep their table;
-- a room with nobody else in it is deleted.

create function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in'; end if;
  update public.rooms r
    set owner = (select m.user_id from public.room_members m where m.room_id = r.id and m.user_id <> me order by m.joined_at limit 1)
    where r.owner = me and exists (select 1 from public.room_members m where m.room_id = r.id and m.user_id <> me);
  delete from auth.users where id = me;
end $$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
