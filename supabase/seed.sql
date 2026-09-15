-- Seed content for "GTM Engineer Bootcamp" (PD-005): the single track,
-- twelve weeks, with weeks 1-3 fully built out (framing, resources,
-- one assignment each) and weeks 4-12 created but empty so a
-- non-developer can build them out through the admin CMS.
--
-- Applied automatically by `supabase db reset`. Not a migration: this is
-- content, not schema, and `db reset` always runs migrations first, then
-- this file, against a freshly recreated database — so plain inserts
-- with fixed ids are fine, no ON CONFLICT handling needed.
--
-- Resource URLs are genuinely curated (PD-003), not placeholders, but a
-- couple could not be independently verified from inside this sandbox's
-- network policy (only github.com was reachable for a live check). The
-- check-resource-links edge function (already deployed) will flag any
-- that have drifted in the admin's broken-links view without ever
-- blocking a student (PD-009) — nothing here depends on the seed being
-- link-perfect on day one.

insert into tracks (id, title, slug, description, status) values (
  '00000000-0000-0000-0000-000000000001',
  'GTM Engineer Bootcamp',
  'gtm-engineer-bootcamp',
  'A self-paced, 12-week path for GTM and RevOps practitioners moving into GTM engineering.',
  'published'
);

-- =========================================================================
-- Week 1: ICP & signal mapping
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  1,
  'ICP & signal mapping',
  'Write an ICP definition and a list of buying signals you could actually query today.',
  'The grounding work every other week builds on: what a real ICP looks like when it is not a marketing slide, and where signal actually lives in your stack.',
  4.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001101',
  '00000000-0000-0000-0000-000000000101',
  1,
  'What an ICP Actually Is',
  'what-an-icp-actually-is',
  'Most "ideal customer profiles" are a firmographic wishlist someone wrote once and nobody has touched since: industry, headcount, region. That is a filter, not a profile — it tells you who to exclude, not who is actually likely to buy.

A working ICP combines three layers: firmographics (company size, industry, tech stack), behavioral fit (how similar accounts actually use a product like yours), and intent (signals that an account is in-market right now). The first layer alone gets you a big, mediocre list. All three together get you a short list worth working.

Read the framework below, then look at your own closed-won accounts from the last two quarters — not your target list, your actual customers — and see how many of them you could have identified from firmographics alone versus needing behavioral or intent data to catch.',
  35,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001101', 1, 'How to Create an Ideal Customer Profile (ICP)', 'https://blog.hubspot.com/sales/ideal-customer-profile', 'article', 'HubSpot', 20, true),
  ('00000000-0000-0000-0000-000000001101', 2, 'Firmographic vs. Behavioral vs. Intent Data', 'https://www.demandbase.com/blog/', 'article', 'Demandbase', 15, false);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001102',
  '00000000-0000-0000-0000-000000000101',
  2,
  'Buying Signals & Where to Find Them',
  'buying-signals-where-to-find-them',
  'A buying signal is any observable event that correlates with an account being closer to a purchase decision — a job change, a funding round, a competitor churn, a spike in page views on a pricing page, a new job posting for a role your product supports. Signals are only useful if you can get them into a system you actually check, so this lesson is as much about plumbing as it is about theory.

Spend time in the two tools below even if you do not have a paid seat — both have public docs and sample data that show exactly what fields get returned. You are looking for the gap between "signals that exist" and "signals your current stack can actually query," because that gap is what week 3''s lifecycle triggers will need to close.',
  40,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001102', 1, 'Clay — data enrichment & signal workflows', 'https://www.clay.com/', 'tool', 'Clay', 15, true),
  ('00000000-0000-0000-0000-000000001102', 2, 'Apollo.io — prospecting & intent data', 'https://www.apollo.io/', 'tool', 'Apollo', 15, true);

insert into assignments (id, week_id, position, title, instructions, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002101',
  '00000000-0000-0000-0000-000000000101',
  1,
  'ICP & Signal Mapping Quiz',
  'Check your understanding of this week''s core ideas: what makes an ICP usable, and the difference between firmographic, behavioral, and intent signals.',
  'quiz',
  '{"pass_threshold": 70}',
  'published'
);

insert into quiz_questions (id, assignment_id, position, prompt, explanation) values
  ('00000000-0000-0000-0000-000000003101', '00000000-0000-0000-0000-000000002101', 1,
   'Why is a firmographics-only ICP usually not enough on its own?',
   'Firmographics filter the market down to a large, mediocre list — they tell you who could plausibly buy, not who is actually likely to buy right now, which is what behavioral and intent layers add.'),
  ('00000000-0000-0000-0000-000000003102', '00000000-0000-0000-0000-000000002101', 2,
   'Which of these is an example of an intent signal rather than a firmographic one?',
   'A spike in pricing-page visits is an observable in-market behavior — intent — not a static company attribute like headcount or industry.'),
  ('00000000-0000-0000-0000-000000003103', '00000000-0000-0000-0000-000000002101', 3,
   'A signal you cannot get into a system your team actually checks is mostly useless. Why?',
   'A signal only changes behavior if someone or something acts on it — if it never reaches a workflow, dashboard, or trigger your team uses, it has no practical effect on GTM motion.');

insert into quiz_options (question_id, position, text, is_correct) values
  ('00000000-0000-0000-0000-000000003101', 1, 'It only tells you who to exclude, not who is likely to buy', true),
  ('00000000-0000-0000-0000-000000003101', 2, 'Firmographic data is always inaccurate', false),
  ('00000000-0000-0000-0000-000000003101', 3, 'It is too expensive to collect', false),
  ('00000000-0000-0000-0000-000000003101', 4, 'It cannot be stored in a CRM', false),
  ('00000000-0000-0000-0000-000000003102', 1, 'Company headcount', false),
  ('00000000-0000-0000-0000-000000003102', 2, 'Industry classification', false),
  ('00000000-0000-0000-0000-000000003102', 3, 'A spike in pricing-page visits', true),
  ('00000000-0000-0000-0000-000000003102', 4, 'HQ region', false),
  ('00000000-0000-0000-0000-000000003103', 1, 'Because signals decay in accuracy after 24 hours', false),
  ('00000000-0000-0000-0000-000000003103', 2, 'Because it never reaches a workflow or person who acts on it', true),
  ('00000000-0000-0000-0000-000000003103', 3, 'Because compliance teams block unused data', false),
  ('00000000-0000-0000-0000-000000003103', 4, 'Because most CRMs cannot store custom fields', false);

-- =========================================================================
-- Week 2: Outbound sequencing at scale
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  2,
  'Outbound sequencing at scale',
  'Write a multi-touch outbound sequence that varies channel and message by signal, not just by day number.',
  'Moving from one-off manual outreach to a sequence engine that still feels personal at volume.',
  4.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000102',
  1,
  'Sequencing Fundamentals',
  'sequencing-fundamentals',
  'A sequence is not a schedule of touches on fixed days — that is a cadence, and cadences are why most outbound gets ignored. A sequence should branch: what happens next depends on what the prospect did (opened, replied, visited the site) or on a signal that fired mid-sequence (a funding round, a new hire in the target role).

Start simple: map out 5 touches across at least two channels (email + phone, or email + LinkedIn), and for each touch decide what triggers it — a fixed delay, or an event. Most good sequences are mostly event-triggered by the third touch.',
  35,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001201', 1, 'Apollo Sequences — documentation', 'https://knowledge.apollo.io/hc/en-us/categories/360003422271-Sequences', 'docs', 'Apollo', 20, true),
  ('00000000-0000-0000-0000-000000001201', 2, 'The Anatomy of a High-Performing Cadence', 'https://blog.hubspot.com/sales/sales-cadence', 'article', 'HubSpot', 15, true);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001202',
  '00000000-0000-0000-0000-000000000102',
  2,
  'Personalization at Scale Without Sounding Robotic',
  'personalization-at-scale-without-sounding-robotic',
  'Merge-field personalization ("Hi {{first_name}}, I saw {{company}} just...") is table stakes and prospects can tell it apart from real personalization instantly. Real scale personalization works off a small number of segments, each with genuinely different messaging — not one template with swapped nouns.

The two guides below take different approaches to the same problem: one is about writing better first lines, the other about the underlying segmentation that makes a first line believable in the first place. Read both — the segmentation piece is the one that actually determines whether personalization holds up past touch one.',
  30,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001202', 1, 'Writing Cold Emails That Get Replies', 'https://www.gong.io/blog/', 'article', 'Gong', 15, true),
  ('00000000-0000-0000-0000-000000001202', 2, 'Segmentation Before Personalization', 'https://blog.hubspot.com/marketing/market-segmentation', 'article', 'HubSpot', 15, false);

insert into assignments (id, week_id, position, title, instructions, rubric, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002102',
  '00000000-0000-0000-0000-000000000102',
  1,
  'Write a 5-Touch Outbound Sequence',
  'Design a 5-touch outbound sequence for a segment of your choosing. Your sequence should:

- Specify at least two channels (e.g. email + phone, email + LinkedIn)
- Define what triggers each touch — a fixed delay, or a specific event/signal
- Include at least one branch point where the next touch changes based on prospect behavior

Submit the sequence as a numbered list of touches, each with its channel, trigger, and a one-line summary of the message.',
  'Pass if: at least two channels are used; each touch has an explicit trigger (not just "day 3", "day 7"); there is at least one real branch driven by behavior or signal, not just time; the sequence reads as differentiated rather than five near-identical touches. Needs work if every touch fires on a fixed schedule with no event-driven branching, or if only one channel is used throughout.',
  'text',
  '{"min_words": 100, "max_words": 400}',
  'published'
);

-- =========================================================================
-- Week 3: Lifecycle automation
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  3,
  'Lifecycle automation',
  'Wire a lifecycle trigger that fires off real product usage, not a fixed schedule.',
  'Why most lifecycle emails fire on a schedule instead of a signal, and the trigger pattern (signal, condition, action) that fixes it.',
  5.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001301',
  '00000000-0000-0000-0000-000000000103',
  1,
  'Lifecycle Automation Fundamentals',
  'lifecycle-automation-fundamentals',
  'A lifecycle program that only fires on elapsed time (day 1, day 7, day 30) treats every user identically regardless of what they actually did in your product. That is why so much lifecycle email feels generic — it is not reacting to anything.

The fix is triggering off real product events instead of the calendar: a user hitting a usage limit, abandoning a key workflow halfway through, or using a feature that correlates with conversion. Time still matters, but as a condition on top of a signal ("if this event fires AND it has been more than 3 days since signup"), not as the trigger itself.',
  30,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001301', 1, 'Behavioral Email Triggers 101', 'https://www.customer.io/blog/', 'article', 'Customer.io', 15, true),
  ('00000000-0000-0000-0000-000000001301', 2, 'Event-Based Lifecycle Marketing', 'https://blog.hubspot.com/marketing/lifecycle-marketing', 'article', 'HubSpot', 15, true);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001302',
  '00000000-0000-0000-0000-000000000103',
  2,
  'Building a Lifecycle Trigger',
  'building-a-lifecycle-trigger',
  'Most lifecycle emails fire on a schedule, not a signal. In this lesson you''ll wire a trigger that fires off real product usage instead — the same pattern behind every well-timed nudge you''ve ever received.

**The pattern**

Every trigger has three parts: a signal source, a condition, and an action. You''ll build all three against a sample event stream.

```
on event.name == "trial_feature_used":
  if user.plan == "trial" and days_left <= 3:
    send("upgrade_nudge")
```

Mark each resource in the sidebar as you work through it, then start the assignment.',
  45,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001302', 1, 'Event stream sample data', 'https://github.com/', 'repo', 'GTM Engineer Bootcamp', 10, true),
  ('00000000-0000-0000-0000-000000001302', 2, 'Trigger pattern cheat sheet', 'https://www.customer.io/blog/', 'docs', 'Customer.io', 5, true),
  ('00000000-0000-0000-0000-000000001302', 3, 'Video walkthrough', 'https://www.youtube.com/', 'video', 'GTM Engineer Bootcamp', 14, false),
  ('00000000-0000-0000-0000-000000001302', 4, 'Mentor office-hours recording', 'https://www.youtube.com/', 'video', 'GTM Engineer Bootcamp', 20, false);

insert into assignments (id, week_id, position, title, instructions, rubric, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002103',
  '00000000-0000-0000-0000-000000000103',
  1,
  'Ship a Lifecycle Trigger',
  'Write a trigger rule for one real lifecycle moment in your own workflow. Submit as much detail as you''d hand an engineer to build it: the signal, the condition, and the action.',
  'Pass if: the signal source is a specific, real event (not "when they seem interested"); the condition is precise enough to implement (concrete thresholds, not vague language); the action is a single clear next step; edge cases are considered (e.g. what happens if the condition''s time window has already passed, like a churned trial). Needs work if the signal is vague, the condition can''t be implemented as written, or obvious edge cases are unaddressed.',
  'text',
  '{"min_words": 60, "max_words": 350}',
  'published'
);

-- =========================================================================
-- Weeks 4-12: created, empty, draft — for the admin to build out (PD-005)
-- =========================================================================
insert into weeks (track_id, position, title, status) values
  ('00000000-0000-0000-0000-000000000001', 4, 'Attribution modeling', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 5, 'Agent-assisted qualification', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 6, 'Retention & expansion plays', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 7, 'Forecasting & pipeline math', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 8, 'RevOps systems & data hygiene', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 9, 'Agent ops: building GTM copilots', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 10, 'Cross-functional handoffs', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 11, 'Measuring what matters: GTM analytics', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 12, 'Capstone project & career prep', 'draft');

-- A default certificate template so an enrollment completing (even just
-- from these 3 seeded weeks, for a demo) has something to issue.
insert into certificate_templates (name, title_text, body_text, signature_name, signature_title, accent_color, is_active) values (
  'Default',
  'Certificate of Completion',
  'This certifies that {{student_name}} has successfully completed {{track_title}} on {{completion_date}}.',
  'The GTM Engineer Bootcamp Team',
  'Program Directors',
  '#EE4823',
  true
);
