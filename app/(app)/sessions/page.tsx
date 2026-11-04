import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions, type SessionWithPeople } from "@/lib/queries";
import { inr, message, when } from "@/lib/format";
import { Alert } from "@/components/Shell";
import { cancelSession, markSession, setMeetLink } from "../actions";

const OK: Record<string, string> = {
  booked: "Booked. The mentor will add a meeting link before the session.",
  awaiting_payment: "Slot held. Payments are coming soon — we'll contact you.",
  cancelled: "Session cancelled.", marked: "Saved.", link: "Meeting link added.", scored: "Scorecard sent to the student.",
};
const STATUS: Record<string, string> = {
  confirmed: "Confirmed", completed: "Completed", cancelled: "Cancelled", no_show: "Missed", awaiting_payment: "Awaiting payment",
};

export default async function Sessions({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { sb, profile } = await requireMe();
  const sp = await searchParams;
  const all = await mySessions(sb, profile);
  const now = new Date();
  const upcoming = all.filter((s) => ["confirmed", "awaiting_payment"].includes(s.status) && new Date(s.ends_at) > now);
  const toMark = profile.role === "mentor" ? all.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now) : [];
  const past = all.filter((s) => !upcoming.includes(s) && !toMark.includes(s)).reverse();
  const mentor = profile.role === "mentor";
  return (<>
    <div className="head"><h1>Sessions</h1></div>
    <Alert error={message(sp.error)} ok={sp.ok ? OK[sp.ok] : null} />
    {toMark.length > 0 && (<><h2>Needs your scorecard</h2><div className="list" style={{ marginBottom: 24 }}>{toMark.map((s) => (
      <div key={s.id} className="row between">
        <div><strong>{s.other_name}</strong><div className="muted small">{when(s.starts_at)} · {s.topic}</div></div>
        <div className="row">
          <Link href={`/mentor/score/${s.id}`} className="btn sm">Write scorecard</Link>
          <form action={markSession}><input type="hidden" name="session_id" value={s.id} /><button className="btn ghost sm" name="outcome" value="no_show">Student didn&apos;t join</button></form>
        </div>
      </div>))}</div></>)}
    <h2>Upcoming</h2>
    {upcoming.length ? <div className="list" style={{ marginBottom: 24 }}>{upcoming.map((s) => <Upcoming key={s.id} s={s} mentor={mentor} />)}</div>
      : <div className="empty" style={{ marginBottom: 24 }}>Nothing coming up.{!mentor && <> <Link href="/mentors">Book a mentor</Link></>}</div>}
    <h2>Past</h2>
    {past.length ? <div className="list">{past.map((s) => (
      <div key={s.id} className="row between">
        <div><strong>{s.other_name}</strong><div className="muted small">{when(s.starts_at)}</div></div>
        <div className="row"><span className="pill">{STATUS[s.status]}</span>
          {s.scored && <Link href={`/scorecards/${s.id}`} className="btn ghost sm">Scorecard</Link>}</div>
      </div>))}</div> : <div className="empty">No past sessions yet.</div>}
  </>);
}

function Upcoming({ s, mentor }: { s: SessionWithPeople; mentor: boolean }) {
  const hours = (new Date(s.starts_at).getTime() - Date.now()) / 3600e3;
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="row between">
        <div><strong>{s.other_name}</strong><div className="muted small">{s.other_sub}</div></div>
        <div className="row"><span className="pill">{STATUS[s.status]}</span><span className="small">{when(s.starts_at)}</span></div>
      </div>
      {s.topic && <div className="small"><span className="muted">Topic:</span> {s.topic}</div>}
      {mentor && s.kind !== "mentor_free" && <div className="small muted">You earn {inr(s.mentor_payout_inr)} ({s.commission_pct}% Calport fee){s.kind === "credit" ? " · paid by Calport" : ""}</div>}
      <div className="row">
        {s.meet_link ? <a href={s.meet_link} target="_blank" rel="noreferrer" className="btn sm">Join call</a>
          : mentor ? (
            <form action={setMeetLink} className="row" style={{ flex: "1 1 260px" }}>
              <input type="hidden" name="session_id" value={s.id} />
              <input name="link" type="url" placeholder="Paste Google Meet link" required style={{ flex: 1, width: "auto" }} />
              <button className="btn ghost sm">Add link</button>
            </form>) : <span className="muted small">Meeting link will appear here.</span>}
        <form action={cancelSession}><input type="hidden" name="session_id" value={s.id} />
          <button className="btn danger sm">Cancel</button></form>
      </div>
      {!mentor && s.credit_used && hours < 24 && <div className="muted small">Cancelling now won&apos;t return your free session (less than 24 hours to go).</div>}
    </div>
  );
}
