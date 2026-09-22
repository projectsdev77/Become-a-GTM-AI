-- auth.users.email is character varying(255), not text — Postgres requires
-- an exact type match between a function's declared return columns and the
-- query that fills them, so the varchar/text mismatch made every call fail
-- with error 42804. Cast it explicitly.
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
    select p.id, au.email::text
    from profiles p
    join auth.users au on au.id = p.id
    where p.role = 'student';
end;
$$;

grant execute on function admin_list_student_emails() to authenticated;
