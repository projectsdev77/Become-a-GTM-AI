-- Seed content for "Become a GTM AI" (PD-005): the single track,
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
  'Become a GTM AI',
  'become-a-gtm-ai',
  'A self-paced, 12-week path for marketing, sales, and growth professionals moving into AI-powered go-to-market.',
  'published'
);

-- =========================================================================
-- Week 1: AI Foundations for GTM Teams
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000001',
  1,
  'AI Foundations for GTM Teams',
  'Explain, in your own words, what a language model can and can''t reliably do in a revenue workflow — and why.',
  'The mental model underneath every AI tool you will use this course: how models predict text, why they hallucinate, and where they actually fit in the funnel.',
  4.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001101',
  '00000000-0000-0000-0000-000000000101',
  1,
  'How Language Models Actually Work',
  'how-language-models-actually-work',
  'Every AI tool you will touch this course — a chatbot, a "write me an email" button, a research agent — is a thin layer on top of the same idea: a model that predicts the next chunk of text, one piece at a time, based on everything before it. It has no database of facts it looks things up in, and no built-in sense of what is true about your company or your prospects. It generates the statistically likely continuation of your prompt. That single fact explains most of what feels magical about these tools, and most of what goes wrong when you trust them too far.

The breakthrough that made today''s models possible is **self-attention**: every piece of text the model reads can weigh every other piece directly, instead of processing word by word in strict order. That is why a model can hold a long brand brief, a call transcript, and your instructions all "in mind" at once. Read the illustrated explainer below before anything more technical — you are building intuition this week, not implementing anything from scratch.',
  50,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001101', 1, 'The Illustrated Transformer', 'https://jalammar.github.io/illustrated-transformer/', 'article', 'Jay Alammar', 25, true),
  ('00000000-0000-0000-0000-000000001101', 2, 'Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', 'paper', 'arXiv', 20, false);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001102',
  '00000000-0000-0000-0000-000000000101',
  2,
  'Where AI Actually Fits in the Funnel',
  'where-ai-fits-in-the-funnel',
  'Not every GTM task is a good fit for AI, and treating it as a universal shortcut is how teams end up with generic-sounding outreach and reports nobody trusts. A useful way to sort tasks: AI is strong at *transforming* information you already have — turning ten research bullet points into a personalized email, summarizing a call transcript, drafting five ad variants from one brief. It is weak at *originating* facts it was never given — guessing what a prospect''s company actually does, inventing a statistic, or knowing this quarter''s pricing.

Tokenization is part of why: a model never sees words, it sees **tokens**, fragments from a fixed vocabulary that get mapped to numbers and back. That is also why models sometimes fumble names, numbers, or brand-specific spelling — those are not "one clean unit" to the tokenizer. Try a few company names and pricing figures in the tokenizer tool below and notice which ones split into unexpected pieces; that is a preview of where you will want to double-check AI output later in the course.',
  40,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001102', 1, 'OpenAI Tokenizer', 'https://platform.openai.com/tokenizer', 'tool', 'OpenAI', 10, true),
  ('00000000-0000-0000-0000-000000001102', 2, 'The Illustrated Word2vec', 'https://jalammar.github.io/illustrated-word2vec/', 'article', 'Jay Alammar', 20, false);

insert into assignments (id, week_id, position, title, instructions, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002101',
  '00000000-0000-0000-0000-000000000101',
  1,
  'AI Foundations Quiz',
  'Check your understanding of this week''s core ideas: how models generate text, why they hallucinate, and where AI is actually useful in a GTM workflow.',
  'quiz',
  '{"pass_threshold": 70}',
  'published'
);

insert into quiz_questions (id, assignment_id, position, prompt, explanation) values
  ('00000000-0000-0000-0000-000000003101', '00000000-0000-0000-0000-000000002101', 1,
   'What is a language model actually doing when it writes an email for you?',
   'It is predicting the statistically likely next tokens given your prompt — it is not retrieving facts from a database or verifying anything is true.'),
  ('00000000-0000-0000-0000-000000003102', '00000000-0000-0000-0000-000000002101', 2,
   'Which of these is the best-suited task for AI to help with directly?',
   'Turning research you already gathered into a personalized draft is a transformation task — exactly what these models are strong at. Inventing facts it was never given is where they are weakest.'),
  ('00000000-0000-0000-0000-000000003103', '00000000-0000-0000-0000-000000002101', 3,
   'A rep asks an AI tool for a prospect''s exact current headcount and it confidently gives a specific number. What should you assume?',
   'Without a real data source behind it, that number is a plausible-sounding guess, not a verified fact — always confirm figures like this against a real source before using them.');

insert into quiz_options (question_id, position, text, is_correct) values
  ('00000000-0000-0000-0000-000000003101', 1, 'It looks up the correct answer in a company database', false),
  ('00000000-0000-0000-0000-000000003101', 2, 'It predicts the most likely next words based on your prompt and its training', true),
  ('00000000-0000-0000-0000-000000003101', 3, 'It searches the live internet for every response', false),
  ('00000000-0000-0000-0000-000000003101', 4, 'It follows a fixed set of if/then rules written by engineers', false),
  ('00000000-0000-0000-0000-000000003102', 1, 'Drafting five ad variants from a brief you already wrote', true),
  ('00000000-0000-0000-0000-000000003102', 2, 'Stating a competitor''s exact current pricing from memory', false),
  ('00000000-0000-0000-0000-000000003102', 3, 'Confirming whether a lead''s contact info is still valid', false),
  ('00000000-0000-0000-0000-000000003102', 4, 'Guessing a prospect company''s revenue with no data provided', false),
  ('00000000-0000-0000-0000-000000003103', 1, 'Trust it — the model would not state a number it wasn''t sure of', false),
  ('00000000-0000-0000-0000-000000003103', 2, 'Treat it as an unverified guess and check a real source before using it', true),
  ('00000000-0000-0000-0000-000000003103', 3, 'Assume it is always exactly right if the number sounds specific', false),
  ('00000000-0000-0000-0000-000000003103', 4, 'Ask the same tool again and use whichever answer comes back first', false);

-- =========================================================================
-- Week 2: Prompt Engineering & Context Design
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000001',
  2,
  'Prompt Engineering & Context Design',
  'Write a prompt that reliably produces on-brand, usable GTM copy — not just something that reads well once.',
  'The practical skill of directing a model for revenue work: clear instructions, system prompts, and feeding it your ICP, voice, and product context.',
  4.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001201',
  '00000000-0000-0000-0000-000000000102',
  1,
  'Prompting Fundamentals for GTM Work',
  'prompting-fundamentals-for-gtm-work',
  'A model has no idea what "on-brand" means for your company beyond what you put in its context. "Write a cold email" gets you something generic; "write a 90-word cold email to a VP of Sales at a Series B SaaS company, referencing their recent Series B, in a direct and slightly informal tone, with a single clear CTA to book 15 minutes" gets you something you can actually send. The gap between those two is almost the entire skill this week teaches.

The two guides below approach prompting from different angles (a single vendor''s house style vs. a broader survey of techniques). Read both with a GTM task in mind — an outbound sequence, an ad variant set, a call summary — and notice which techniques (examples, explicit constraints, step-by-step instructions) would change your actual output the most.',
  40,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001201', 1, 'Prompt engineering overview', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', 'docs', 'Anthropic', 20, true),
  ('00000000-0000-0000-0000-000000001201', 2, 'Prompt Engineering Guide', 'https://www.promptingguide.ai/', 'docs', 'DAIR.AI', 25, true);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001202',
  '00000000-0000-0000-0000-000000000102',
  2,
  'System Prompts: Giving AI Your ICP, Voice, and Guardrails',
  'system-prompts-icp-voice-guardrails',
  'A system prompt is where you set the rules that should hold across an entire session — your ideal customer profile, brand voice, product positioning, and what the assistant should never do (quote pricing it isn''t sure of, promise a feature that doesn''t exist, sound like a form letter). Set once, separately from whatever a rep types next, instead of re-explaining your ICP in every single message.

Everything you put in the prompt competes for the model''s attention, so a system prompt that buries the important constraints in a wall of brand history costs you more than one that states, plainly: who we sell to, how we sound, and where the assistant should stop and hand off to a human.',
  35,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001202', 1, 'System prompts', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts', 'docs', 'Anthropic', 15, true),
  ('00000000-0000-0000-0000-000000001202', 2, 'Prompt engineering guide (OpenAI)', 'https://platform.openai.com/docs/guides/prompt-engineering', 'docs', 'OpenAI', 20, true);

insert into assignments (id, week_id, position, title, instructions, rubric, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002102',
  '00000000-0000-0000-0000-000000000102',
  1,
  'Write a System Prompt for an SDR Outreach Assistant',
  'Write a system prompt for an AI assistant that helps an SDR draft cold outbound emails for a fictional B2B product of your choosing. Your prompt should:

- Define the assistant''s role and the product/ICP it is writing for
- Specify a tone and voice (e.g. direct and consultative, warm and casual, formal)
- Include at least two explicit boundaries — things it should never claim or should escalate to a human instead (e.g. never state pricing, never promise a feature that does not exist)

Paste the system prompt itself as your submission.',
  'Pass if: the role, product, and ICP are concretely defined (not generic "you are a helpful assistant"); a tone/voice is explicitly specified; at least two distinct behavioral boundaries are present and non-contradictory with the rest of the prompt; length is reasonable for the word-count guidance. Needs work if boundaries are vague/missing, the tone is unspecified, or instructions contradict each other.',
  'text',
  '{"min_words": 100, "max_words": 400}',
  'published'
);

-- =========================================================================
-- Week 3: Research-Grounded Personalization
-- =========================================================================
insert into weeks (id, track_id, position, title, goal, summary, estimated_hours, status, published_at) values (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000001',
  3,
  'Research-Grounded Personalization',
  'Build a minimal research-to-outreach workflow that personalizes using real, gathered signals — not guesses.',
  'Why AI-written outreach falls flat without real input, and the concrete pieces (sourcing signals, structuring notes, drafting) that make personalization actually work.',
  5.0,
  'published',
  now()
);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001301',
  '00000000-0000-0000-0000-000000000103',
  1,
  'Why AI Guesses (and How to Stop It)',
  'why-ai-guesses-and-how-to-stop-it',
  'Left to its own devices, a model asked to "personalize this email for Acme Corp" will invent something plausible-sounding rather than admit it doesn''t know anything specific about Acme Corp — the same failure mode from week 1, now dressed up as a "personalized" opening line that name-drops a product Acme doesn''t even sell. This is the exact problem retrieval-augmented generation (RAG) was built to solve in technical systems: instead of asking a model to recall facts from training, you retrieve the real material yourself and hand it over as context, then ask the model to work only from that.

The same discipline applies directly to outreach: gather real signals about an account first (a funding announcement, a job posting, a product launch, a LinkedIn post), then ask the model to write from those specific facts — never from the company name alone. The Pinecone explainer below lays out the RAG pattern in its original technical form; as you read it, mentally substitute "prospect research" for "documents" and "personalized email" for "generated answer."',
  35,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001301', 1, 'What is Retrieval-Augmented Generation?', 'https://www.pinecone.io/learn/retrieval-augmented-generation/', 'article', 'Pinecone', 15, true),
  ('00000000-0000-0000-0000-000000001301', 2, 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', 'https://arxiv.org/abs/2005.11401', 'paper', 'arXiv', 20, false);

insert into lessons (id, week_id, position, title, slug, body, estimated_minutes, status) values (
  '00000000-0000-0000-0000-000000001302',
  '00000000-0000-0000-0000-000000000103',
  2,
  'Building a Research-to-Outreach Workflow',
  'building-a-research-to-outreach-workflow',
  'A working personalization workflow has the same four pieces as a technical RAG pipeline, just done by hand: **source** signals about the account (news, job listings, LinkedIn activity, the company''s own site), **structure** them into short factual notes instead of a pile of tabs, **select** the two or three signals that are actually relevant to your pitch (not everything you found), and only then **generate** — feed those specific notes to the model and ask it to draft from them, nothing else. Skip straight to "AI, personalize this" without the first three steps and you get the same hallucinated guesswork from the previous lesson with better formatting.

Do this once by hand for a real (or realistic) company before touching this week''s assignment, timing yourself. Notice how much of the work is actually research and note-taking, and how little of it is the AI-generation step itself — that ratio does not flip just because you added a tool.',
  50,
  'published'
);

insert into resources (lesson_id, position, title, url, resource_type, source_name, estimated_minutes, is_required) values
  ('00000000-0000-0000-0000-000000001302', 1, 'Build a Retrieval Augmented Generation (RAG) App', 'https://python.langchain.com/docs/tutorials/rag/', 'docs', 'LangChain', 30, false);

insert into assignments (id, week_id, position, title, instructions, rubric, assignment_type, config, status) values (
  '00000000-0000-0000-0000-000000002103',
  '00000000-0000-0000-0000-000000000103',
  1,
  'Submit a Research-Grounded Outreach Draft',
  'Pick a real (or realistic) target company and do the four-step workflow from this week''s lesson:

1. Source at least three concrete, current signals about the company (news, a job posting, a product launch, a LinkedIn post — cite where each came from)
2. Structure them as short factual notes
3. Select the two or three signals most relevant to a specific product or service (real or fictional)
4. Draft a personalized cold email that references at least two of those researched facts by name

Write your notes and the final email in a single public document (Google Doc, Notion page, or similar) and submit the link.',
  'Pass if: at least three real, sourced signals are listed with where they came from; the final email references at least two specific researched facts (not generic flattery like "I saw your company is growing"); the email is coherent and could plausibly be sent. Needs work if the "research" is vague or unsourced, the email could have been written about any company, or fewer than two researched facts appear in the draft.',
  'url',
  '{"allowed_hosts": [], "require_public": true}',
  'published'
);

-- =========================================================================
-- Weeks 4-12: created, empty, draft — for the admin to build out (PD-005)
-- =========================================================================
insert into weeks (track_id, position, title, status) values
  ('00000000-0000-0000-0000-000000000001', 4, 'AI-Powered Outbound & Sequence Writing', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 5, 'AI Sales Enablement & Conversation Intelligence', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 6, 'AI Agents & Workflow Automation', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 7, 'Evaluating AI Output & Avoiding Hallucination Risk', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 8, 'AI for Content, SEO & Demand Gen', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 9, 'GTM Data, Reporting & Forecasting with AI', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 10, 'Account-Based Marketing & AI-Powered ABM', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 11, 'AI Governance, Compliance & Brand Safety in GTM', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 12, 'Capstone Project & Career Prep', 'draft');

-- A default certificate template so an enrollment completing (even just
-- from these 3 seeded weeks, for a demo) has something to issue.
insert into certificate_templates (name, title_text, body_text, signature_name, signature_title, accent_color, is_active) values (
  'Default',
  'Certificate of Completion',
  'This certifies that {{student_name}} has successfully completed {{track_title}} on {{completion_date}}.',
  'The Become a GTM AI Team',
  'Program Directors',
  '#1d4ed8',
  true
);
