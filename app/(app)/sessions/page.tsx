import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions, type SessionWithPeople } from "@/lib/queries";
import { inr, message, relDay, time } from "@/lib/format";
import { Alert, Avatar, Empty, PageHeader, SectionHead, StatusBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { cancelSession, markSession, setMeetLink } from "../actions";

const OK: Record<string, string> = {
  booked: "Booked. The mentor will add a meeting link before the session.",
  awaiting_payment: "Slot held. Payments are coming soon — we'll contact you.",
  cancelled: "Session cancelled.", marked: "Saved.", link: "Meeting link added.", scored: "Scorecard sent to the student.",
};

function When({ s }: { s: SessionWithPeople }) {
  return (
    <div className="when-col">
      <span className="strong t-small">{relDay(s.starts_at)}</span>
      <span className="t-small muted tabular">{time(s.starts_at)}–{time(s.ends_at)}</span>
    </div>
  );
}

export default async function Sessions({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { sb, profile } = await requireMe();
  const sp = await searchParams;
  const all = await mySessions(sb, profile);
  const now = new Date();
  const mentor = profile.role === "mentor";
  const upcoming = all.filter((s) => ["confirmed", "awaiting_payment"].includes(s.status) && new Date(s.starts_at) > now);
  const toMark = mentor ? all.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now) : [];
  const live = !mentor ? all.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now && new Date(s.ends_at) > now) : [];
  const past = all.filter((s) => !upcoming.includes(s) && !toMark.includes(s) && !live.includes(s)).reverse();
  return (<>
    <PageHeader title="Sessions" description={mentor ? "Your mock interviews and career chats with students." : "Your mock interviews and career chats with mentors."}
      actions={!mentor && <Link href="/mentors" className="btn">Book a mentor</Link>} />
    <Alert error={message(sp.error)} ok={sp.ok ? OK[sp.ok] : null} />

    {toMark.length > 0 && (
      <section style={{ marginBottom: 40 }}>
        <SectionHead title="Needs your scorecard" action={<span className="badge warn"><span className="dot" />{toMark.length}</span>} />
        <div className="list">{toMark.map((s) => (
          <div key={s.id} className="list-row wrap-sm">
            <Avatar name={s.other_name} />
            <div className="list-main"><div className="title truncate">{s.other_name}</div><div className="sub truncate">{relDay(s.starts_at)}, {time(s.starts_at)}{s.topic ? ` · ${s.topic}` : ""}</div></div>
            <div className="list-meta">
              <form action={markSession}><input type="hidden" name="session_id" value={s.id} /><button className="btn ghost sm" name="outcome" value="no_show">Didn&apos;t join</button></form>
              <Link href={`/mentor/score/${s.id}`} className="btn sm">Write scorecard</Link>
            </div>
          </div>))}</div>
      </section>)}

    <section>
      <SectionHead title="Upcoming" />
      {[...live, ...upcoming].length ? <div className="list">{[...live, ...upcoming].map((s) => <Upcoming key={s.id} s={s} mentor={mentor} />)}</div>
        : <Empty icon="calendar" title="Nothing coming up" text={mentor ? "Add open times so students can book you." : "Book a mock interview or a career chat."}
            action={mentor ? { href: "/mentor/availability", label: "Add availability" } : { href: "/mentors", label: "Find a mentor" }} />}
    </section>

    <section className="section">
      <SectionHead title="Past" />
      {past.length ? <div className="list">{past.map((s) => (
        <div key={s.id} className="list-row">
          <Avatar name={s.other_name} />
          <div className="list-main"><div className="title truncate">{s.other_name}</div><div className="sub truncate">{relDay(s.starts_at)}, {time(s.starts_at)}{s.topic ? ` · ${s.topic}` : ""}</div></div>
          <div className="list-meta">
            {s.scored ? <Link href={`/scorecards/${s.id}`} className="btn secondary sm">Scorecard</Link> : <StatusBadge status={s.status} />}
          </div>
        </div>))}</div> : <Empty icon="clock" title="No past sessions yet" text="Finished sessions and scorecards will show up here." />}
    </section>
  </>);
}

function Upcoming({ s, mentor }: { s: SessionWithPeople; mentor: boolean }) {
  const hours = (new Date(s.starts_at).getTime() - Date.now()) / 3600e3;
  return (
    <div className="list-row top" style={{ paddingTop: 16, paddingBottom: 16 }}>
      <Avatar name={s.other_name} />
      <div className="list-main">
        <div className="row g-3 between" style={{ alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <div className="row g-2 wrap"><span className="title">{s.other_name}</span><StatusBadge status={s.status} /></div>
            <div className="sub">{s.other_sub}</div>
          </div>
          <When s={s} />
        </div>
        {s.topic && <div className="t-small fg-2 mt-3 topic">{s.topic}</div>}
        {mentor && s.kind !== "mentor_free" && (
          <div className="t-small muted mt-2">You earn <span className="strong" style={{ color: "var(--fg)" }}>{inr(s.mentor_payout_inr)}</span> after the {s.commission_pct}% Calport fee{s.kind === "credit" ? " · paid by Calport" : ""}</div>)}
        <div className="row wrap g-2 mt-4">
          {s.meet_link ? <a href={s.meet_link} target="_blank" rel="noreferrer" className="btn sm"><Icon name="video" />Join call</a>
            : mentor ? (
              <form action={setMeetLink} className="row g-2 grow" style={{ maxWidth: 420 }}>
                <input type="hidden" name="session_id" value={s.id} />
                <input className="input grow" name="link" type="url" placeholder="Paste Google Meet link" required style={{ height: "var(--h-sm)", fontSize: 13 }} />
                <button className="btn secondary sm">Add link</button>
              </form>) : <span className="badge outline"><Icon name="video" size={12} />Meeting link coming</span>}
          <form action={cancelSession} style={{ marginLeft: "auto" }}><input type="hidden" name="session_id" value={s.id} /><button className="btn ghost sm flush-r" style={{ color: "var(--bad)" }}>Cancel</button></form>
        </div>
        {!mentor && s.credit_used && hours < 24 && hours > 0 && <div className="hint mt-2">Cancelling now won&apos;t return your free session (less than 24 hours to go).</div>}
      </div>
    </div>
  );
}
