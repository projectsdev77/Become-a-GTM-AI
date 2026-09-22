-- Admin-only. profiles has no email column (email lives in auth.users,
-- which PostgREST/the client can't query directly) — this is what backs
-- "search by email" on the admin students list, which advertised that in
-- its placeholder but never actually had the data to search against.
create or replace function admin_list_student_emails()
returns table (id uuid, email text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'admin only';
  end if;

  return query
    select p.id, au.email
    from profiles p
    join auth.users au on au.id = p.id
    where p.role = 'student';
end;
$$;

grant execute on function admin_list_student_emails() to authenticated;
