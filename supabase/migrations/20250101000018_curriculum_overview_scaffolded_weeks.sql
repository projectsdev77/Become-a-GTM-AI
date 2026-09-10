-- Redesign rev 2.0: the public curriculum page now lists all twelve
-- weeks, not just the published ones — an honest "title pending" row for
-- scaffolded weeks instead of hiding them (the twelve-week promise is the
-- product, not something to truncate). Draft weeks expose only their
-- position and a fixed placeholder title; goal/summary stay null so
-- unfinished framing never leaks publicly ahead of release.
--
-- assignment_type is now also surfaced (the first published assignment
-- per week) for the curriculum table's type column.
drop function if exists public_curriculum_overview();

create function public_curriculum_overview()
returns table (
  track_title text,
  week_position int,
  week_title text,
  week_status publish_status,
  week_goal text,
  week_summary text,
  estimated_hours numeric,
  assignment_type assignment_type
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.title,
    w.position,
    case when w.status = 'published' then w.title else 'Title pending — content scaffolded' end,
    w.status,
    case when w.status = 'published' then w.goal else null end,
    case when w.status = 'published' then w.summary else null end,
    case when w.status = 'published' then w.estimated_hours else null end,
    (
      select a.assignment_type from assignments a
      where a.week_id = w.id and a.status = 'published'
      order by a.position limit 1
    )
  from weeks w
  join tracks t on t.id = w.track_id
  where t.status = 'published'
  order by w.position;
$$;

grant execute on function public_curriculum_overview() to anon, authenticated;
