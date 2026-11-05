import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { myCredits, type MentorCard } from "@/lib/queries";
import { dayKey, inr, message, relDay, time } from "@/lib/format";
import { Alert, Avatar, Tag } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { bookSlot } from "../../actions";

type Slot = { id: string; starts_at: string; ends_at: string };

export default async function MentorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb } = await requireMe({ role: "learner" });
  const { data: m } = await sb.from("mentor_directory").select("*").eq("id", id).maybeSingle<MentorCard>();
  if (!m) notFound();
  const soon = new Date(Date.now() + 2 * 3600e3).toISOString();
  const [{ data: slotRows }, credits] = await Promise.all([
    sb.from("availability").select("id, starts_at, ends_at").eq("mentor_id", id).eq("booked", false).gte("starts_at", soon).order("starts_at").limit(40),
    myCredits(sb),
  ]);
  const slots = (slotRows ?? []) as Slot[];
  const byDay = new Map<string, Slot[]>();
  slots.forEach((s) => { const k = dayKey(s.starts_at); byDay.set(k, [...(byDay.get(k) ?? []), s]); });

  const price = m.current_price_inr;
  const first = m.full_name.split(" ")[0];
  const canUseFree = credits.balance > 0 && (price === 0 || (price <= credits.price_cap && credits.budget_open));
  const freeNote = credits.balance === 0 ? "You've used your free sessions. Invite friends to earn more."
    : price === 0 ? "Uses 1 of your free sessions."
    : price > credits.price_cap ? `Free sessions only work with mentors charging ${inr(credits.price_cap)} or less.`
    : !credits.budget_open ? "This month's free sessions with paid mentors are used up."
    : `Uses 1 free session. Calport pays ${first} for you.`;
  const mins = slots[0] ? Math.round((new Date(slots[0].ends_at).getTime() - new Date(slots[0].starts_at).getTime()) / 60000) : 45;

  return (<>
    <div className="eyebrow"><Link href="/mentors" className="row g-1"><Icon name="arrowLeft" size={14} />Mentors</Link></div>
    <header className="row g-4" style={{ marginBottom: 32 }}>
      <Avatar name={m.full_name} size={56} />
      <div className="grow">
        <div className="row wrap g-2"><h1 className="t-title">{m.full_name}</h1>{m.tier === "senior" ? <Tag tone="green">Placed senior</Tag> : <Tag tone="purple">Professional</Tag>}</div>
        <p className="muted mt-1">{[m.job_title, m.company].filter(Boolean).join(" at ")}{m.college ? ` · ${m.college}` : ""}</p>
      </div>
    </header>
    <Alert error={message(sp.error)} />

    <div className="split">
      <div className="stack g-4">
        <div className="card card-body">
          <h2 className="t-section">About</h2>
          <p className="mt-3">{m.headline}</p>
          {m.bio && <p className="fg-2 pre mt-3" style={{ lineHeight: "22px" }}>{m.bio}</p>}
          {m.expertise?.length > 0 && <div className="tags mt-4">{m.expertise.map((e) => <span key={e} className="chip-soft">{e}</span>)}</div>}
          {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="btn secondary sm mt-4" style={{ alignSelf: "flex-start" }}><Icon name="linkedin" />LinkedIn<Icon name="external" /></a>}
        </div>
        <div className="trio">
          <div className="card card-pad"><div className="t-label">Sessions done</div><div className="t-num mt-2">{m.sessions_completed}</div></div>
          <div className="card card-pad"><div className="t-label">Students mentored</div><div className="t-num mt-2">{m.students_mentored}</div></div>
          <div className="card card-pad"><div className="t-label">Experience</div><div className="t-num mt-2">{m.experience_years ?? 0}<span className="muted" style={{ fontSize: 15, fontWeight: 500, marginLeft: 4, letterSpacing: 0 }}>yrs</span></div></div>
        </div>
        <div className="panel row g-3 t-small fg-2"><Icon name="info" /><span>Mentors share their own experience. They don&apos;t share confidential interview questions from their employer.</span></div>
      </div>

      <aside className="card book-card">
        <div className="card-head">
          <div><div className="t-label">Price per session</div><div className="t-num" style={{ fontSize: 24, lineHeight: "30px" }}>{price === 0 ? "Free" : inr(price)}</div></div>
          <span className="badge">{mins} min</span>
        </div>
        {slots.length ? (
          <form action={bookSlot}>
            <input type="hidden" name="mentor_id" value={m.id} />
            <div className="card-body stack g-5">
              <div>
                <div className="label">Pick a time</div>
                <div className="slot-days mt-3">
                  {[...byDay.entries()].map(([k, list], di) => (
                    <div key={k}>
                      <div className="t-label" style={{ marginBottom: 8 }}>{relDay(list[0].starts_at)}</div>
                      <div className="chip-grid">
                        {list.map((s, i) => (
                          <label key={s.id} className="chip"><input type="radio" name="slot_id" value={s.id} defaultChecked={di === 0 && i === 0} required />{time(s.starts_at)}</label>
                        ))}
                      </div>
                    </div>))}
                </div>
                <div className="hint mt-3">India time</div>
              </div>
              <div className="field">
                <label htmlFor="topic">What do you want to work on? <span className="opt">(optional)</span></label>
                <textarea className="textarea" id="topic" name="topic" placeholder="e.g. Mock PM interview for PhonePe APM, product sense round" style={{ minHeight: 76 }} />
              </div>
            </div>
            <div className="card-foot stack g-2" style={{ alignItems: "stretch" }}>
              <button className="btn block" name="pay" value="free" disabled={!canUseFree}>Book with a free session</button>
              {price > 0 && <button className="btn secondary block" disabled>Pay {inr(price)} · coming soon</button>}
              <div className="row between g-3 mt-1 t-small" style={{ alignItems: "flex-start" }}><span className="muted">{freeNote}</span><span className="shrink-0 strong tabular">{credits.balance} left</span></div>
            </div>
          </form>
        ) : (
          <div className="card-body"><div className="empty" style={{ padding: "28px 16px" }}><div className="empty-icon"><Icon name="clock" /></div><div className="t-body">No open times</div><p className="muted">{first} hasn&apos;t added new slots yet. Check back soon.</p></div></div>
        )}
      </aside>
    </div>
  </>);
}
