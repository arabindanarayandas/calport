"""Tests Calport's money and access rules against a local Postgres.

Run:  python3 supabase/tests/test_rules.py "postgresql://postgres@/postgres?host=/tmp/pg&port=5433"
Creates a scratch database, applies the stub + migration, and checks every agreed rule.
"""
import sys, uuid, pathlib, datetime as dt
import psycopg

ROOT = pathlib.Path(__file__).resolve().parents[1]
ADMIN_DSN = sys.argv[1] if len(sys.argv) > 1 else "postgresql://postgres@/postgres?host=/tmp/pg&port=5433"
DB = "calport_test"

with psycopg.connect(ADMIN_DSN, autocommit=True) as a:
    a.execute(f"drop database if exists {DB}")
    a.execute(f"create database {DB}")

dsn = ADMIN_DSN.replace("/postgres?", f"/{DB}?")
conn = psycopg.connect(dsn, autocommit=True)
conn.execute((ROOT / "tests/stub_supabase.sql").read_text())
conn.execute((ROOT / "migrations/0001_init.sql").read_text())
# Supabase grants table access to signed-in users by default; RLS then decides rows.
conn.execute("grant select, insert, update, delete on all tables in schema public to authenticated")
conn.execute("grant usage, select on all sequences in schema public to authenticated")

passed = 0
def ok(cond, msg):
    global passed
    if not cond:
        raise AssertionError(msg)
    passed += 1
    print("  ok ", msg)

def q(sql, args=(), one=True):
    cur = conn.execute(sql, args)
    if cur.description is None:
        return None
    rows = cur.fetchall()
    return rows[0][0] if one and rows else rows

def as_user(uid, sql, args=()):
    """Run sql as a signed-in user (RLS applies). Returns rows or raises."""
    with conn.transaction():
        conn.execute("set local role authenticated")
        conn.execute("select set_config('request.jwt.claim.sub', %s, true)", (str(uid),))
        cur = conn.execute(sql, args)
        return cur.fetchall() if cur.description else None

def err_code(uid, sql, args=()):
    try:
        as_user(uid, sql, args)
    except psycopg.Error as e:
        return str(e).split("\n")[0]
    return None

def signup(role="learner", name="Test", ref=None):
    uid = uuid.uuid4()
    meta = {"role": role, "full_name": name}
    if ref: meta["ref"] = ref
    q("insert into auth.users (id, email, raw_user_meta_data) values (%s, %s, %s::jsonb)",
      (uid, f"{uid}@t.dev", psycopg.types.json.Json(meta)))
    return uid

def onboard(uid, complete=True):
    as_user(uid, """update profiles set onboarded = true, college = 'IIT Guwahati', year = 3,
                    branch = 'CSE', target_role = 'Product', is_adult_confirmed = %s where id = %s""",
            (complete, uid))

def make_mentor(price=0, approved=True, weekly=10):
    m = signup("mentor", "Mentor")
    q("update mentor_profiles set price_inr = %s, approved = %s, weekly_limit = %s where id = %s",
      (price, approved, weekly, m))
    return m

def slot(m, days=3, hour=0):
    start = dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=days, hours=hour)
    return q("insert into availability (mentor_id, starts_at, ends_at) values (%s, %s, %s) returning id",
             (m, start, start + dt.timedelta(minutes=45)))

def book(uid, s, credit=True):
    return as_user(uid, "select kind, status, price_inr, commission_pct, mentor_payout_inr, calport_pays_inr, id from book_session(%s, %s)", (s, credit))[0]

def balance(uid):
    return q("select credit_balance(%s)", (uid,))

def grade_first_practice(uid):
    pid = as_user(uid, "insert into practices (learner_id, role) values (%s, 'APM') returning id", (uid,))[0][0]
    q("update practices set status = 'graded', score = 7.5 where id = %s", (pid,))   # server (no user) grades

print("Sign-up")
a = signup(name="Aarav"); onboard(a)
ok(balance(a) == 2, "new learner starts with 2 free sessions")
mt = signup("mentor")
ok(q("select count(*) from credit_ledger where learner_id = %s", (mt,)) == 0, "mentors get no learner credits")

print("Referrals")
code = q("select referral_code from profiles where id = %s", (a,))
f1 = signup(ref=code.lower())
ok(q("select status from referrals where referred_id = %s", (f1,)) == "pending", "referral recorded as pending at sign-up (code is case-insensitive)")
grade_first_practice(f1)
ok(balance(a) == 2, "no credit yet: friend practised but profile incomplete")
onboard(f1)
ok(balance(a) == 3, "credit granted once friend completes profile AND first practice")
f2 = signup(ref=code); onboard(f2)
ok(balance(a) == 3, "no credit when friend completes profile but hasn't practised")
pid = as_user(f2, "insert into practices (learner_id, role) values (%s, 'APM') returning id", (f2,))[0][0]
as_user(f2, "update practices set status = 'graded', score = 10 where id = %s", (pid,))
ok(q("select status from practices where id = %s", (pid,)) == "draft", "learner cannot mark their own practice as graded")
ok(balance(a) == 3, "self-grading does not unlock a referral credit")
q("update practices set status = 'graded' where id = %s", (pid,))
ok(balance(a) == 4, "credit granted when server grades the practice")
for i in range(11):
    f = signup(ref=code); onboard(f); grade_first_practice(f)
ok(q("select count(*) from referrals where referrer_id = %s and status = 'qualified'", (a,)) == 13, "all 13 referrals qualify")
ok(balance(a) == 12, "referral credits capped at 10 (2 signup + 10 = 12)")
ok(as_user(a, "select my_credits()")[0][0]["referral_credits_earned"] == 10, "my_credits shows 10 of 10 earned")
self_ref = q("select count(*) from referrals where referrer_id = referred_id")
ok(self_ref == 0, "nobody can refer themselves")

print("Profile guards")
as_user(a, "update profiles set role = 'admin', blocked_until = null, no_show_count = 0 where id = %s", (a,))
ok(q("select role from profiles where id = %s", (a,)) == "learner", "learner cannot change their own role")
as_user(mt, "update mentor_profiles set approved = true where id = %s", (mt,))
ok(q("select approved from mentor_profiles where id = %s", (mt,)) is False, "mentor cannot approve themselves")
ok(as_user(a, "select count(*) from credit_ledger where learner_id <> %s", (a,))[0][0] == 0, "learner cannot see other people's credits")
e = err_code(a, "insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind) values (%s, %s, now(), now(), 'mentor_free')", (a, mt))
ok(e is not None and "row-level security" in e, "sessions can't be created directly, only through booking")
e = err_code(a, "insert into credit_ledger (learner_id, delta, reason) values (%s, 50, 'admin')", (a,))
ok(e is not None, "learner cannot give themselves free sessions")

print("Booking: mentor's first 2 free, then paid with credit")
b = signup(name="Bina"); onboard(b)
m = make_mentor(price=800)
ok(as_user(b, "select current_price_inr from mentor_directory where id = %s", (m,))[0][0] == 0, "directory shows ₹0 while mentor is in their first 2")
r1 = book(b, slot(m, 3))
ok(r1[0] == "mentor_free" and r1[5] == 0, "mentor session 1 is free, Calport pays nothing")
ok(balance(b) == 1, "it uses one of the learner's free sessions")
e = err_code(b, "select book_session(%s, true)", (slot(m, 4),))
ok(e and "already_booked_this_mentor" in e, "one upcoming session per mentor per learner")
c = signup(); onboard(c)
r2 = book(c, slot(m, 4))
ok(r2[0] == "mentor_free", "mentor session 2 is free")
d = signup(); onboard(d)
r3 = book(d, slot(m, 5))
ok(r3[0] == "credit" and r3[2] == 800 and r3[3] == 25, "session 3: paid mentor, learner's free session, 25% cut")
ok(r3[4] == 600 and r3[5] == 600, "mentor gets ₹600 (price minus cut), Calport pays ₹600")
ok(q("select spent_inr from budget_months where month = ist_month(now())") == 600, "₹600 counted against this month's budget")

print("Price cap ₹999")
hi = make_mentor(price=1500)
q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status) select %s, %s, now() - interval '30 days', now() - interval '30 days', 'mentor_free', 'completed' from generate_series(1,2)", (a, hi))
e = err_code(d, "select book_session(%s, true)", (slot(hi, 6),))
ok(e and "mentor_above_free_cap" in e, "free session refused for a mentor above ₹999")
r = book(d, slot(hi, 6, 1), credit=False)
ok(r[0] == "paid" and r[1] == "awaiting_payment" and r[4] == 1125, "learner can book them as paid (awaiting payment), mentor gets ₹1,125")
ok(balance(d) == 1, "paid booking doesn't use a free session")
cap = make_mentor(price=999)
q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status) select %s, %s, now() - interval '30 days', now() - interval '30 days', 'mentor_free', 'completed' from generate_series(1,2)", (a, cap))
ok(book(a, slot(cap, 7))[0] == "credit", "₹999 exactly is allowed")

print("Commission tiers 25 / 20 / 10")
t = make_mentor(price=500)
def fake_paid(mentor, n):
    q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status, price_inr) select %s, %s, now() - interval '30 days', now() - interval '30 days', 'credit', 'completed', 500 from generate_series(1, %s)", (a, mentor, n))
q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status) select %s, %s, now() - interval '40 days', now() - interval '40 days', 'mentor_free', 'completed' from generate_series(1,2)", (a, t))
fake_paid(t, 9)
l1 = signup(); onboard(l1)
ok(book(l1, slot(t, 8))[3] == 25, "10th paid session: still 25%")
l2 = signup(); onboard(l2)
ok(book(l2, slot(t, 8, 2))[3] == 20, "11th paid session: 20%")
fake_paid(t, 8)
l3 = signup(); onboard(l3)
ok(book(l3, slot(t, 9))[3] == 20, "20th paid session: still 20%")
l4 = signup(); onboard(l4)
r = book(l4, slot(t, 9, 2))
ok(r[3] == 10 and r[4] == 450, "21st paid session onwards: 10%, mentor gets ₹450")

print("Monthly budget ₹20,000")
q("update budget_months set spent_inr = 15800 where month = ist_month(now())")
bm = make_mentor(price=400)
q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status) select %s, %s, now() - interval '30 days', now() - interval '30 days', 'mentor_free', 'completed' from generate_series(1,2)", (a, bm))
l9 = signup(); onboard(l9)
book(l9, slot(bm, 10, 3))
ok(q("select alert_80_at is not null from budget_months where month = ist_month(now())") is True, "80% alert flagged when spending crosses ₹16,000")
q("update budget_months set spent_inr = 19800 where month = ist_month(now())")
l5 = signup(); onboard(l5)
e = err_code(l5, "select book_session(%s, true)", (slot(bm, 10),))
ok(e and "budget_used_up" in e, "free session on a paid mentor refused once the ₹20,000 would be exceeded (19,800 + 300)")
ok(as_user(l5, "select my_credits()")[0][0]["budget_open"] is True, "budget shows open while under limit")
free_m = make_mentor(price=0)
ok(book(l5, slot(free_m, 10))[0] == "mentor_free", "free mentors still bookable when budget is used up")

print("Cancelling")
q("update budget_months set spent_inr = 0 where month = ist_month(now())")
cm = make_mentor(price=600)
q("insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status) select %s, %s, now() - interval '30 days', now() - interval '30 days', 'mentor_free', 'completed' from generate_series(1,2)", (a, cm))
l6 = signup(); onboard(l6)
s = book(l6, slot(cm, 5))
spent = q("select spent_inr from budget_months where month = ist_month(now())")
as_user(l6, "select cancel_session(%s)", (s[6],))
ok(balance(l6) == 2, "cancel 24h+ ahead: free session returned")
ok(q("select spent_inr from budget_months where month = ist_month(now())") == spent - s[5], "cancel: Calport budget released")
late = q("insert into availability (mentor_id, starts_at, ends_at) values (%s, now() + interval '3 hours', now() + interval '4 hours') returning id", (cm,))
s2 = book(l6, late)
as_user(l6, "select cancel_session(%s)", (s2[6],))
ok(balance(l6) == 1, "cancel within 24h: free session is lost")
other = signup(); onboard(other)
e = err_code(other, "select cancel_session(%s)", (s2[6],))
ok(e and "not_your_session" in e, "strangers cannot cancel your session")

print("No-shows")
nm = make_mentor(price=0)
l7 = signup(); onboard(l7)
for i in range(2):
    sid = q("""insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status)
               values (%s, %s, now() - interval '1 hour', now() - interval '15 minutes', 'mentor_free', 'confirmed') returning id""", (l7, nm))
    as_user(nm, "select mark_session(%s, 'no_show')", (sid,))
ok(q("select blocked_until > now() from profiles where id = %s", (l7,)) is True, "2 no-shows block booking for 7 days")
e = err_code(l7, "select book_session(%s, true)", (slot(free_m, 11),))
ok(e and "blocked_no_shows" in e, "blocked learner cannot book")

print("Other limits")
poor = signup(); onboard(poor)
q("insert into credit_ledger (learner_id, delta, reason) values (%s, -2, 'admin')", (poor,))
e = err_code(poor, "select book_session(%s, true)", (slot(free_m, 12),))
ok(e and "no_free_sessions_left" in e, "no free sessions left → can't use one")
un = make_mentor(price=0, approved=False)
e = err_code(a, "select book_session(%s, true)", (slot(un, 3),))
ok(e and "mentor_not_approved" in e, "unapproved mentors can't be booked")
ok(as_user(a, "select count(*) from mentor_directory where id = %s", (un,))[0][0] == 0, "unapproved mentors hidden from directory")
wk = make_mentor(price=0, weekly=1)
book(a, slot(wk, 14))
l8 = signup(); onboard(l8)
e = err_code(l8, "select book_session(%s, true)", (slot(wk, 14, 1),))
ok(e and "mentor_week_full" in e, "mentor's weekly limit respected")
nb = signup()
e = err_code(nb, "select book_session(%s, true)", (slot(free_m, 13),))
ok(e and "finish_onboarding" in e, "must finish onboarding before booking")

print("Scorecards")
sid = q("""insert into sessions (learner_id, mentor_id, starts_at, ends_at, kind, status)
           values (%s, %s, now() - interval '1 hour', now(), 'mentor_free', 'confirmed') returning id""", (a, nm))
sk = '[{"skill":"Problem solving","score":3},{"skill":"Communication","score":4}]'
as_user(nm, "select submit_scorecard(%s, %s::jsonb, 'Clear', 'Structure')", (sid, sk))
ok(q("select overall from scorecards where session_id = %s", (sid,)) == 3.5, "scorecard saved with average 3.5")
ok(q("select status from sessions where id = %s", (sid,)) == "completed", "scoring marks the session completed")
ok(len(as_user(a, "select * from scorecards where session_id = %s", (sid,))) == 1, "learner can read their scorecard")
ok(len(as_user(other, "select * from scorecards where session_id = %s", (sid,))) == 0, "others cannot")

print("Locked-down functions")
for fn in ["ensure_budget_month(current_date)", "maybe_qualify_referral(gen_random_uuid())", "credit_balance(gen_random_uuid())"]:
    e = err_code(a, f"select {fn}")
    ok(e and "permission denied" in e, f"signed-in users can't call {fn.split('(')[0]} directly")
with conn.transaction():
    conn.execute("set local role anon")
    try:
        conn.execute("select book_session(gen_random_uuid(), true)"); e = None
    except psycopg.Error as ex:
        e = str(ex)
ok(e and "permission denied" in e, "logged-out visitors can't book")

print(f"\nAll {passed} checks passed.")
