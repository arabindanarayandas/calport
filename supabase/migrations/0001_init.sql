-- Calport: core schema and business rules
-- Rules (agreed with founder, 4 Nov 2026):
--   Learners: 2 free sessions at sign-up, +1 per qualified referral, max 10 referral credits.
--   A referral qualifies when the friend has completed their profile AND finished a first practice.
--   A free session (credit) can be used with a free mentor, or a paid mentor priced <= 999.
--   Mentors: first 2 sessions free, then they set their own price.
--   Calport commission on a mentor's paid sessions: 25% (1-10), 20% (11-20), 10% (21+).
--   When Calport pays for a credit session, mentor gets price minus that cut, and it counts toward 10/20.
--   Calport spends at most 20,000 INR a month on credit sessions; after that, credits work only with free mentors.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- settings
create table public.settings (
  key   text primary key,
  value jsonb not null
);
insert into public.settings (key, value) values
  ('monthly_budget_inr', '20000'),
  ('credit_price_cap_inr', '999'),
  ('signup_credits', '2'),
  ('max_referral_credits', '10'),
  ('mentor_free_sessions', '2'),
  ('cancel_refund_hours', '24'),
  ('no_show_block_days', '7');

create or replace function public.setting_int(k text) returns int
language sql stable security definer set search_path = public as $$
  select (value #>> '{}')::int from public.settings where key = k
$$;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  role                 text not null check (role in ('learner','mentor','admin')),
  full_name            text not null default '',
  college              text,
  year                 int check (year between 1 and 5),
  branch               text,
  target_role          text,
  phone                text,
  referral_code        text not null unique,
  referred_by          uuid references public.profiles(id),
  onboarded            boolean not null default false,
  profile_completed_at timestamptz,
  is_adult_confirmed   boolean not null default false,
  no_show_count        int not null default 0,
  blocked_until        timestamptz,
  created_at           timestamptz not null default now()
);

create table public.mentor_profiles (
  id                uuid primary key references public.profiles(id) on delete cascade,
  tier              text not null default 'senior' check (tier in ('senior','expert')),
  headline          text,
  company           text,
  job_title         text,
  experience_years  int,
  bio               text,
  expertise         text[] not null default '{}',
  linkedin_url      text,
  price_inr         int not null default 0 check (price_inr >= 0),
  weekly_limit      int not null default 3 check (weekly_limit between 1 and 20),
  approved          boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------- availability and sessions
create table public.availability (
  id         uuid primary key default gen_random_uuid(),
  mentor_id  uuid not null references public.mentor_profiles(id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  booked     boolean not null default false,
  check (ends_at > starts_at)
);
create index on public.availability (mentor_id, starts_at);

create table public.sessions (
  id                uuid primary key default gen_random_uuid(),
  learner_id        uuid not null references public.profiles(id),
  mentor_id         uuid not null references public.mentor_profiles(id),
  slot_id           uuid references public.availability(id),
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  topic             text,
  status            text not null default 'confirmed'
                      check (status in ('confirmed','completed','cancelled','no_show','awaiting_payment')),
  -- kind: mentor_free = within mentor's first 2 or mentor price is 0
  --       credit      = learner used a free session on a paid mentor; Calport pays
  --       paid        = learner pays (needs payments, not live yet)
  kind              text not null check (kind in ('mentor_free','credit','paid')),
  credit_used       boolean not null default false,
  price_inr         int not null default 0,
  commission_pct    int not null default 0,
  commission_inr    int not null default 0,
  mentor_payout_inr int not null default 0,
  calport_pays_inr  int not null default 0,
  budget_month      date,
  meet_link         text,
  cancelled_at      timestamptz,
  cancelled_by      uuid,
  created_at        timestamptz not null default now()
);
create index on public.sessions (mentor_id, starts_at);
create index on public.sessions (learner_id, starts_at);

create table public.scorecards (
  session_id  uuid primary key references public.sessions(id) on delete cascade,
  mentor_id   uuid not null references public.mentor_profiles(id),
  learner_id  uuid not null references public.profiles(id),
  skills      jsonb not null,           -- [{"skill":"Problem solving","score":3,"note":"..."}]
  overall     numeric(3,2) not null,
  strengths   text,
  improve     text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- credits, referrals, budget
create table public.credit_ledger (
  id          bigserial primary key,
  learner_id  uuid not null references public.profiles(id) on delete cascade,
  delta       int not null,
  reason      text not null check (reason in ('signup','referral','used','refund','admin')),
  session_id  uuid references public.sessions(id),
  referral_id uuid,
  created_at  timestamptz not null default now()
);
create index on public.credit_ledger (learner_id);

create table public.referrals (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid not null references public.profiles(id) on delete cascade,
  referred_id  uuid not null unique references public.profiles(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','qualified')),
  credited     boolean not null default false,
  qualified_at timestamptz,
  created_at   timestamptz not null default now(),
  check (referrer_id <> referred_id)
);

create table public.budget_months (
  month        date primary key,         -- first day of month (IST)
  limit_inr    int not null,
  spent_inr    int not null default 0,
  alert_80_at  timestamptz
);

-- ---------------------------------------------------------------- practice (AI assessments)
create table public.practices (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references public.profiles(id) on delete cascade,
  company      text,
  role         text not null,
  jd           text,
  status       text not null default 'draft' check (status in ('draft','in_progress','graded')),
  research     jsonb,
  plan         jsonb,
  questions    jsonb,
  answers      jsonb,
  scorecard    jsonb,
  score        numeric(4,1),
  graded_at    timestamptz,
  created_at   timestamptz not null default now()
);
create index on public.practices (learner_id);

create table public.company_research (
  company_key  text primary key,          -- lower(company)||'|'||lower(role)
  company      text not null,
  role         text not null,
  research     jsonb not null,
  sources      jsonb not null default '[]',
  created_at   timestamptz not null default now()
);

create table public.activity_days (
  learner_id  uuid not null references public.profiles(id) on delete cascade,
  day         date not null,
  points      int not null default 0,
  primary key (learner_id, day)
);

-- ================================================================ helpers
create or replace function public.ist_month(ts timestamptz) returns date
language sql immutable as $$
  select date_trunc('month', ts at time zone 'Asia/Kolkata')::date
$$;

create or replace function public.credit_balance(uid uuid) returns int
language sql stable security definer set search_path = public as $$
  select coalesce(sum(delta), 0)::int from public.credit_ledger where learner_id = uid
$$;

create or replace function public.commission_pct_for(paid_index int) returns int
language sql immutable as $$
  -- paid_index = number of this mentor's earlier paid/credit sessions (0-based)
  select case when paid_index < 10 then 25 when paid_index < 20 then 20 else 10 end
$$;

create or replace function public.ensure_budget_month(m date) returns public.budget_months
language plpgsql security definer set search_path = public as $$
declare r public.budget_months;
begin
  insert into public.budget_months (month, limit_inr)
  values (m, public.setting_int('monthly_budget_inr'))
  on conflict (month) do nothing;
  select * into r from public.budget_months where month = m for update;
  return r;
end $$;

-- ================================================================ sign-up
create or replace function public.new_referral_code() returns text
language plpgsql set search_path = public, extensions as $$
declare c text;
begin
  loop
    c := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 7));
    exit when not exists (select 1 from public.profiles where referral_code = c);
  end loop;
  return c;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  r text := coalesce(meta->>'role', 'learner');
  ref_code text := upper(nullif(trim(meta->>'ref'), ''));
  referrer uuid;
begin
  if r not in ('learner','mentor') then r := 'learner'; end if;
  if ref_code is not null then
    select id into referrer from public.profiles where referral_code = ref_code;
  end if;

  insert into public.profiles (id, role, full_name, referral_code, referred_by)
  values (new.id, r, coalesce(meta->>'full_name', ''), public.new_referral_code(), referrer);

  if r = 'mentor' then
    insert into public.mentor_profiles (id) values (new.id);
  else
    insert into public.credit_ledger (learner_id, delta, reason)
    values (new.id, public.setting_int('signup_credits'), 'signup');
    if referrer is not null then
      insert into public.referrals (referrer_id, referred_id) values (referrer, new.id);
    end if;
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================ referrals
create or replace function public.maybe_qualify_referral(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  ref public.referrals;
  done_count int;
begin
  select * into ref from public.referrals where referred_id = uid and status = 'pending' for update;
  if not found then return; end if;

  if not exists (select 1 from public.profiles where id = uid and profile_completed_at is not null) then return; end if;
  if not exists (select 1 from public.practices where learner_id = uid and status = 'graded') then return; end if;

  -- lock referrer's referral rows to count safely
  perform 1 from public.profiles where id = ref.referrer_id for update;
  select count(*) into done_count from public.referrals where referrer_id = ref.referrer_id and credited;

  update public.referrals
     set status = 'qualified', qualified_at = now(),
         credited = (done_count < public.setting_int('max_referral_credits'))
   where id = ref.id;

  if done_count < public.setting_int('max_referral_credits') then
    insert into public.credit_ledger (learner_id, delta, reason, referral_id)
    values (ref.referrer_id, 1, 'referral', ref.id);
  end if;
end $$;

-- Learners can write their answers, but only the server (AI grader) can grade a practice.
create or replace function public.trg_guard_practice() returns trigger
language plpgsql as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.status := 'draft'; new.score := null; new.scorecard := null; new.graded_at := null;
    new.research := null; new.plan := null; new.questions := null;
  else
    if new.status = 'graded' and old.status <> 'graded' then new.status := old.status; end if;
    new.score := old.score; new.scorecard := old.scorecard; new.graded_at := old.graded_at;
    new.research := old.research; new.plan := old.plan; new.questions := old.questions;
  end if;
  return new;
end $$;
create trigger guard_practice before insert or update on public.practices
  for each row execute function public.trg_guard_practice();

create or replace function public.trg_practice_graded() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'graded' then perform public.maybe_qualify_referral(new.learner_id); end if;
  return new;
end $$;
create trigger practice_graded after insert or update of status on public.practices
  for each row execute function public.trg_practice_graded();

create or replace function public.trg_profile_completed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.profile_completed_at is not null and old.profile_completed_at is null then
    perform public.maybe_qualify_referral(new.id);
  end if;
  return new;
end $$;
create trigger profile_completed after update on public.profiles
  for each row when (old.profile_completed_at is null and new.profile_completed_at is not null)
  execute function public.trg_profile_completed();

-- ================================================================ guards on self-edits
-- Users can edit their own profile, but not the fields that control money or access.
create or replace function public.trg_guard_profile() returns trigger
language plpgsql as $$
begin
  if current_setting('calport.internal', true) = 'on' or auth.uid() is null then return new; end if;
  new.role := old.role;
  new.referral_code := old.referral_code;
  new.referred_by := old.referred_by;
  new.no_show_count := old.no_show_count;
  new.blocked_until := old.blocked_until;
  -- Profile counts as complete only when the key fields are filled. Users can't set this themselves.
  new.profile_completed_at := old.profile_completed_at;
  if old.profile_completed_at is null and new.role = 'learner'
     and coalesce(trim(new.full_name), '') <> '' and coalesce(trim(new.college), '') <> ''
     and new.year is not null and coalesce(trim(new.branch), '') <> ''
     and coalesce(trim(new.target_role), '') <> '' and new.is_adult_confirmed then
    new.profile_completed_at := now();
  end if;
  return new;
end $$;
create trigger guard_profile before update on public.profiles
  for each row execute function public.trg_guard_profile();

create or replace function public.trg_guard_mentor() returns trigger
language plpgsql as $$
begin
  if current_setting('calport.internal', true) = 'on' or auth.uid() is null then return new; end if;
  new.approved := old.approved;
  new.tier := old.tier;
  return new;
end $$;
create trigger guard_mentor before update on public.mentor_profiles
  for each row execute function public.trg_guard_mentor();

-- ================================================================ booking
-- Returns the new session row. Errors carry a short code the app turns into a friendly message.
create or replace function public.book_session(p_slot uuid, p_use_credit boolean default true, p_topic text default null)
returns public.sessions
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  me public.profiles;
  slot public.availability;
  m public.mentor_profiles;
  free_done int;
  paid_done int;
  week_count int;
  s public.sessions;
  b public.budget_months;
  v_kind text;
  v_pct int := 0;
  v_comm int := 0;
  v_payout int := 0;
  v_calport int := 0;
  v_status text := 'confirmed';
  v_credit boolean := false;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into me from public.profiles where id = uid;
  if me.role <> 'learner' then raise exception 'learners_only'; end if;
  if not me.onboarded then raise exception 'finish_onboarding'; end if;
  if me.blocked_until is not null and me.blocked_until > now() then raise exception 'blocked_no_shows'; end if;

  select * into slot from public.availability where id = p_slot for update;
  if not found then raise exception 'slot_not_found'; end if;
  if slot.booked then raise exception 'slot_taken'; end if;
  if slot.starts_at < now() + interval '2 hours' then raise exception 'slot_too_soon'; end if;

  select * into m from public.mentor_profiles where id = slot.mentor_id for update;
  if not m.approved then raise exception 'mentor_not_approved'; end if;

  if exists (select 1 from public.sessions where learner_id = uid and mentor_id = m.id
             and status = 'confirmed' and starts_at > now()) then
    raise exception 'already_booked_this_mentor';
  end if;

  select count(*) into week_count from public.sessions
   where mentor_id = m.id and status in ('confirmed','completed')
     and date_trunc('week', starts_at at time zone 'Asia/Kolkata') = date_trunc('week', slot.starts_at at time zone 'Asia/Kolkata');
  if week_count >= m.weekly_limit then raise exception 'mentor_week_full'; end if;

  select count(*) filter (where kind = 'mentor_free' and status <> 'cancelled'),
         count(*) filter (where kind in ('credit','paid') and status <> 'cancelled')
    into free_done, paid_done
    from public.sessions where mentor_id = m.id;

  if m.price_inr = 0 or free_done < public.setting_int('mentor_free_sessions') then
    -- Mentor is free (in their first 2, or chooses to stay free). Uses one of the learner's free sessions.
    v_kind := 'mentor_free';
    if public.credit_balance(uid) < 1 then raise exception 'no_free_sessions_left'; end if;
    v_credit := true;
  elsif p_use_credit then
    v_kind := 'credit';
    if m.price_inr > public.setting_int('credit_price_cap_inr') then raise exception 'mentor_above_free_cap'; end if;
    if public.credit_balance(uid) < 1 then raise exception 'no_free_sessions_left'; end if;
    v_pct := public.commission_pct_for(paid_done);
    v_comm := round(m.price_inr * v_pct / 100.0);
    v_payout := m.price_inr - v_comm;
    v_calport := v_payout;
    b := public.ensure_budget_month(public.ist_month(now()));
    if b.spent_inr + v_calport > b.limit_inr then raise exception 'budget_used_up'; end if;
    update public.budget_months set spent_inr = spent_inr + v_calport,
           alert_80_at = case when alert_80_at is null and (spent_inr + v_calport) >= 0.8 * limit_inr then now() else alert_80_at end
     where month = b.month;
    v_credit := true;
  else
    v_kind := 'paid';
    v_pct := public.commission_pct_for(paid_done);
    v_comm := round(m.price_inr * v_pct / 100.0);
    v_payout := m.price_inr - v_comm;
    v_status := 'awaiting_payment';
  end if;

  insert into public.sessions (learner_id, mentor_id, slot_id, starts_at, ends_at, topic, status, kind,
                               credit_used, price_inr, commission_pct, commission_inr, mentor_payout_inr,
                               calport_pays_inr, budget_month)
  values (uid, m.id, slot.id, slot.starts_at, slot.ends_at, p_topic, v_status, v_kind,
          v_credit, case when v_kind = 'mentor_free' then 0 else m.price_inr end, v_pct, v_comm, v_payout,
          v_calport, case when v_kind = 'credit' then public.ist_month(now()) end)
  returning * into s;

  update public.availability set booked = true where id = slot.id;

  if v_credit then
    insert into public.credit_ledger (learner_id, delta, reason, session_id) values (uid, -1, 'used', s.id);
  end if;
  return s;
end $$;

-- ================================================================ cancel
create or replace function public.cancel_session(p_session uuid) returns public.sessions
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s public.sessions;
  refund boolean;
begin
  select * into s from public.sessions where id = p_session for update;
  if not found then raise exception 'session_not_found'; end if;
  if uid not in (s.learner_id, s.mentor_id) then raise exception 'not_your_session'; end if;
  if s.status not in ('confirmed','awaiting_payment') then raise exception 'cannot_cancel'; end if;

  -- Learner gets the free session back if they cancel 24h+ ahead. A mentor cancelling always refunds.
  refund := s.credit_used and (uid = s.mentor_id or s.starts_at - now() >= make_interval(hours => public.setting_int('cancel_refund_hours')));

  update public.sessions set status = 'cancelled', cancelled_at = now(), cancelled_by = uid
   where id = s.id returning * into s;
  update public.availability set booked = false where id = s.slot_id and starts_at > now();

  if refund then
    insert into public.credit_ledger (learner_id, delta, reason, session_id) values (s.learner_id, 1, 'refund', s.id);
  end if;
  -- Calport money is released whenever the session doesn't happen (mentor isn't paid).
  if s.kind = 'credit' and s.budget_month is not null then
    update public.budget_months set spent_inr = greatest(0, spent_inr - s.calport_pays_inr) where month = s.budget_month;
  end if;
  return s;
end $$;

-- ================================================================ mentor marks outcome
create or replace function public.mark_session(p_session uuid, p_outcome text) returns public.sessions
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s public.sessions;
  cnt int;
begin
  if p_outcome not in ('completed','no_show') then raise exception 'bad_outcome'; end if;
  select * into s from public.sessions where id = p_session for update;
  if not found or s.mentor_id <> uid then raise exception 'not_your_session'; end if;
  if s.status <> 'confirmed' then raise exception 'already_marked'; end if;
  if s.starts_at > now() then raise exception 'session_not_started'; end if;

  update public.sessions set status = p_outcome where id = s.id returning * into s;

  if p_outcome = 'no_show' then
    perform set_config('calport.internal', 'on', true);
    update public.profiles set no_show_count = no_show_count + 1 where id = s.learner_id returning no_show_count into cnt;
    if cnt % 2 = 0 then
      update public.profiles set blocked_until = now() + make_interval(days => public.setting_int('no_show_block_days'))
       where id = s.learner_id;
    end if;
    perform set_config('calport.internal', 'off', true);
  end if;
  return s;
end $$;

create or replace function public.submit_scorecard(p_session uuid, p_skills jsonb, p_strengths text, p_improve text)
returns public.scorecards
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  s public.sessions;
  sc public.scorecards;
  avg_score numeric;
begin
  select * into s from public.sessions where id = p_session;
  if not found or s.mentor_id <> uid then raise exception 'not_your_session'; end if;
  if s.status not in ('confirmed','completed') then raise exception 'cannot_score'; end if;
  if s.starts_at > now() then raise exception 'session_not_started'; end if;
  select avg((e->>'score')::numeric) into avg_score from jsonb_array_elements(p_skills) e;
  if avg_score is null or avg_score < 1 or avg_score > 4 then raise exception 'bad_scores'; end if;

  if s.status = 'confirmed' then
    update public.sessions set status = 'completed' where id = s.id;
  end if;
  insert into public.scorecards (session_id, mentor_id, learner_id, skills, overall, strengths, improve)
  values (s.id, s.mentor_id, s.learner_id, p_skills, round(avg_score, 2), p_strengths, p_improve)
  on conflict (session_id) do update set skills = excluded.skills, overall = excluded.overall,
     strengths = excluded.strengths, improve = excluded.improve
  returning * into sc;
  return sc;
end $$;

create or replace function public.set_meet_link(p_session uuid, p_link text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_link !~ '^https://' then raise exception 'bad_link'; end if;
  update public.sessions set meet_link = p_link
   where id = p_session and mentor_id = auth.uid() and status = 'confirmed';
  if not found then raise exception 'not_your_session'; end if;
end $$;

-- ================================================================ public view of mentors
create or replace view public.mentor_directory
with (security_invoker = false) as
select p.id, p.full_name, p.college, m.tier, m.headline, m.company, m.job_title, m.experience_years, m.bio,
       m.expertise, m.linkedin_url, m.price_inr, m.weekly_limit,
       (select count(*) from public.sessions s where s.mentor_id = m.id and s.kind = 'mentor_free' and s.status <> 'cancelled')::int as free_sessions_done,
       (select count(*) from public.sessions s where s.mentor_id = m.id and s.status = 'completed')::int as sessions_completed,
       (select count(distinct s.learner_id) from public.sessions s where s.mentor_id = m.id and s.status = 'completed')::int as students_mentored,
       case when m.price_inr = 0
              or (select count(*) from public.sessions s where s.mentor_id = m.id and s.kind = 'mentor_free' and s.status <> 'cancelled') < public.setting_int('mentor_free_sessions')
            then 0 else m.price_inr end as current_price_inr
from public.mentor_profiles m join public.profiles p on p.id = m.id
where m.approved;

-- Learner-facing summary of their own free sessions.
create or replace function public.my_credits() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'balance', public.credit_balance(auth.uid()),
    'referrals_qualified', (select count(*) from public.referrals where referrer_id = auth.uid() and status = 'qualified'),
    'referrals_pending', (select count(*) from public.referrals where referrer_id = auth.uid() and status = 'pending'),
    'referral_credits_earned', (select count(*) from public.referrals where referrer_id = auth.uid() and credited),
    'referral_credits_max', public.setting_int('max_referral_credits'),
    'budget_open', (select coalesce(b.spent_inr < b.limit_inr, true) from (select 1) x
                    left join public.budget_months b on b.month = public.ist_month(now())),
    'price_cap', public.setting_int('credit_price_cap_inr')
  )
$$;

-- ================================================================ row level security
alter table public.settings         enable row level security;
alter table public.profiles         enable row level security;
alter table public.mentor_profiles  enable row level security;
alter table public.availability     enable row level security;
alter table public.sessions         enable row level security;
alter table public.scorecards       enable row level security;
alter table public.credit_ledger    enable row level security;
alter table public.referrals        enable row level security;
alter table public.budget_months    enable row level security;
alter table public.practices        enable row level security;
alter table public.company_research enable row level security;
alter table public.activity_days    enable row level security;

-- profiles: you see yourself, and people you share a session with; you edit yourself
create policy profiles_self_read on public.profiles for select using (
  id = auth.uid()
  or exists (select 1 from public.sessions s where (s.learner_id = auth.uid() and s.mentor_id = profiles.id)
                                              or (s.mentor_id = auth.uid() and s.learner_id = profiles.id))
);
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy mentor_self_read on public.mentor_profiles for select using (id = auth.uid());
create policy mentor_self_update on public.mentor_profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy avail_read on public.availability for select to authenticated using (true);
create policy avail_insert on public.availability for insert with check (mentor_id = auth.uid() and starts_at > now());
create policy avail_delete on public.availability for delete using (mentor_id = auth.uid() and not booked);

create policy sessions_read on public.sessions for select using (auth.uid() in (learner_id, mentor_id));

create policy scorecards_read on public.scorecards for select using (auth.uid() in (learner_id, mentor_id));
create policy ledger_read on public.credit_ledger for select using (learner_id = auth.uid());
create policy referrals_read on public.referrals for select using (referrer_id = auth.uid());

create policy practices_all on public.practices for all using (learner_id = auth.uid()) with check (learner_id = auth.uid());
create policy research_read on public.company_research for select to authenticated using (true);
create policy activity_read on public.activity_days for select using (learner_id = auth.uid());

-- Only these functions can be called from the app; everything else runs inside them.
revoke execute on all functions in schema public from public, anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.mentor_directory to authenticated;
grant execute on function public.book_session(uuid, boolean, text) to authenticated;
grant execute on function public.cancel_session(uuid) to authenticated;
grant execute on function public.mark_session(uuid, text) to authenticated;
grant execute on function public.submit_scorecard(uuid, jsonb, text, text) to authenticated;
grant execute on function public.my_credits() to authenticated;
grant execute on function public.setting_int(text) to authenticated;  -- used by the mentor directory
grant execute on function public.set_meet_link(uuid, text) to authenticated;
