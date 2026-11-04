import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { myCredits, type MentorCard } from "@/lib/queries";
import { day, inr, message, time } from "@/lib/format";
import { Alert } from "@/components/Shell";
import { bookSlot } from "../../actions";

export default async function MentorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb } = await requireMe({ role: "learner" });
  const { data: m } = await sb.from("mentor_directory").select("*").eq("id", id).maybeSingle<MentorCard>();
  if (!m) notFound();
  const soon = new Date(Date.now() + 2 * 3600e3).toISOString();
  const [{ data: slots }, credits] = await Promise.all([
    sb.from("availability").select("id, starts_at, ends_at").eq("mentor_id", id).eq("booked", false).gte("starts_at", soon).order("starts_at").limit(30),
    myCredits(sb),
  ]);
  const price = m.current_price_inr;
  const canUseFree = credits.balance > 0 && (price === 0 || (price <= credits.price_cap && credits.budget_open));
  const freeNote = price === 0 ? "Uses 1 of your free sessions."
    : price > credits.price_cap ? `Free sessions only work with mentors charging ${inr(credits.price_cap)} or less.`
    : !credits.budget_open ? "This month's free sessions with paid mentors are used up."
    : `Uses 1 free session. Calport pays ${m.full_name.split(" ")[0]} for you.`;
  return (<>
    <div className="head">
      <div className="row"><h1>{m.full_name}</h1><span className="pill">{m.tier === "senior" ? "Placed senior" : "Professional"}</span></div>
      <p className="muted">{[m.job_title, m.company].filter(Boolean).join(" at ")}{m.college ? ` · ${m.college}` : ""}</p>
    </div>
    <Alert error={message(sp.error)} />
    <div className="grid split">
      <div className="stack">
        <div className="card"><h2>About</h2><p>{m.headline}</p>{m.bio && <p className="muted" style={{ whiteSpace: "pre-wrap" }}>{m.bio}</p>}
          {m.expertise?.length > 0 && <div className="row">{m.expertise.map((e) => <span key={e} className="pill">{e}</span>)}</div>}
          {m.linkedin_url && <p style={{ marginTop: 12 }}><a href={m.linkedin_url} target="_blank" rel="noreferrer">LinkedIn ↗</a></p>}</div>
        <div className="card soft small">Mentors share their own experience. They don&apos;t share confidential interview questions from their employer.</div>
      </div>
      <div className="card">
        <div className="muted small">Price</div>
        <div className="big">{price === 0 ? "Free" : inr(price)}</div>
        <p className="muted small">{m.sessions_completed} sessions done · you have {credits.balance} free left</p>
        <h3 style={{ marginTop: 16 }}>Pick a time</h3>
        {slots?.length ? (
          <form action={bookSlot}>
            <input type="hidden" name="mentor_id" value={m.id} />
            <div className="stack" style={{ gap: 6, maxHeight: 260, overflow: "auto", margin: "8px 0 12px" }}>
              {slots.map((s, i) => (
                <label key={s.id} className="check" style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", margin: 0 }}>
                  <input type="radio" name="slot_id" value={s.id} defaultChecked={i === 0} required /> {day(s.starts_at)}, {time(s.starts_at)}–{time(s.ends_at)}
                </label>))}
            </div>
            <div className="field"><label>What do you want to work on?</label><textarea name="topic" placeholder="e.g. Mock PM interview for PhonePe APM, product sense round" style={{ minHeight: 70 }} /></div>
            <button className="btn" name="pay" value="free" disabled={!canUseFree} style={{ width: "100%" }}>Book with a free session</button>
            <p className="muted small" style={{ marginTop: 6 }}>{freeNote}</p>
            {price > 0 && <button className="btn ghost" disabled style={{ width: "100%", marginTop: 6 }}>Pay {inr(price)} — coming soon</button>}
          </form>
        ) : <p className="muted small" style={{ marginTop: 8 }}>No open slots right now. Check back soon.</p>}
      </div>
    </div>
  </>);
}
