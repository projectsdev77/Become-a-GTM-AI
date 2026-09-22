-- Lets an admin remove a mentor from the roster. Suspends the profile
-- (status = 'suspended') rather than deleting it, so their history —
-- submissions they reviewed, messages they sent — stays intact and
-- attributable; auto_assign_mentor() already filters on status = 'active',
-- so a suspended mentor simply stops receiving new students with no other
-- code needing to know about this. Their current students are moved to
-- the next least-loaded active, confirmed mentor (same fairness rule as
-- auto_assign_mentor/20250101000028) instead of being left pointed at a
-- mentor who no longer answers to anyone.
create or replace function admin_remove_mentor(p_mentor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student record;
  v_new_mentor_id uuid;
begin
  if not is_admin() then
    raise exception 'admin only';
  end if;

  if not exists (select 1 from profiles where id = p_mentor_id and role = 'mentor') then
    raise exception 'not a mentor';
  end if;

  update profiles set status = 'suspended' where id = p_mentor_id;

  for v_student in
    select student_id from mentor_assignments where mentor_id = p_mentor_id and is_active
  loop
    select p.id into v_new_mentor_id
    from profiles p
    join auth.users au on au.id = p.id and au.confirmed_at is not null
    left join mentor_assignments ma on ma.mentor_id = p.id and ma.is_active
    where p.role = 'mentor' and p.status = 'active' and p.id <> p_mentor_id
    group by p.id
    order by count(ma.id) asc, random()
    limit 1;

    update mentor_assignments set is_active = false where student_id = v_student.student_id and is_active;

    -- No other active mentor to hand off to — the student ends up
    -- unassigned, same as a brand-new signup with no mentors yet; an admin
    -- can assign one manually from the student's detail page once one
    -- exists.
    if v_new_mentor_id is not null then
      insert into mentor_assignments (mentor_id, student_id, is_active)
      values (v_new_mentor_id, v_student.student_id, true);
    end if;
  end loop;
end;
$$;

grant execute on function admin_remove_mentor(uuid) to authenticated;
