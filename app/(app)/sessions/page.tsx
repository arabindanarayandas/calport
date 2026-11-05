import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions, type SessionWithPeople } from "@/lib/queries";
import { inr, message, relDay, time } from "@/lib/format";
import { Alert, PageHeader, Row, SectionHead, StatusBadge, Table, Tabs, Tag, Who } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { cancelSession, markSession, setMeetLink } from "../actions";

const OK: Record<string, string> = {
  booked: "Booked. The mentor will add a meeting link before the session.",
  awaiting_payment: "Slot held. Payments are coming soon — we'll contact you.",
  cancelled: "Session cancelled.", marked: "Saved.", link: "Meeting link added.", scored: "Scorecard sent to the student.",
};

type Col = [string, string, string?];

function When({ s }: { s: SessionWithPeople }) {
  return <span style={{ display: "block", whiteSpace: "nowrap" }}><span className="strong">{relDay(s.starts_at)}</span><br /><span className="t-small muted tabular">{time(s.starts_at)}–{time(s.ends_at)}</span></span>;
}
function Topic({ s }: { s: SessionWithPeople }) {
  return s.topic ? <span className="chip-soft" title={s.topic}>{s.topic}</span> : <span className="muted">—</span>;
}

export default async function Sessions({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; tab?: string }> }) {
  const { sb, profile } = await requireMe();
  const sp = await searchParams;
  const all = await mySessions(sb, profile);
  const now = new Date();
  const mentor = profile.role === "mentor";
  const toMark = mentor ? all.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now) : [];
  const upcoming = all.filter((s) => ["confirmed", "awaiting_payment"].includes(s.status) && new Date(s.ends_at) > now && !toMark.includes(s));
  const past = all.filter((s) => !upcoming.includes(s) && !toMark.includes(s)).reverse();
  const tab = sp.tab === "past" ? "past" : "upcoming";
  const person = mentor ? "Student" : "Mentor";

  const upCols: Col[] = [[person, "minmax(0,1.5fr)", "main"], ["When", "150px"], ["Topic", "minmax(0,1fr)", "hide-m"], ["Status", "150px"], ["", "220px", "acts"]];
  const pastCols: Col[] = [[person, "minmax(0,1.5fr)", "main"], ["When", "150px"], ["Topic", "minmax(0,1fr)", "hide-m"], ["Status", "130px"], ["", "140px", "acts"]];
  const markCols: Col[] = [["Student", "minmax(0,1.5fr)", "main"], ["When", "150px"], ["Topic", "minmax(0,1fr)", "hide-m"], ["", "280px", "acts"]];

  return (<>
    <PageHeader title={<span className="row g-3">Sessions<span className="tag p-grey">{all.length}</span></span>}
      description={mentor ? "Your mock interviews and career chats with students." : "Your mock interviews and career chats with mentors."}
      actions={!mentor && <Link href="/mentors" className="btn">Book a mentor</Link>} />
    <Alert error={message(sp.error)} ok={sp.ok ? OK[sp.ok] : null} />

    {toMark.length > 0 && (
      <section style={{ marginBottom: 32 }}>
        <SectionHead title="Needs your scorecard" action={<Tag tone="yellow">{toMark.length} to score</Tag>} />
        <Table cols={markCols}>
          {toMark.map((s) => (
            <Row key={s.id} cols={markCols} cells={[
              <Who key="w" name={s.other_name} sub={s.other_sub} />, <When key="t" s={s} />, <Topic key="p" s={s} />,
              <>
                <form action={markSession}><input type="hidden" name="session_id" value={s.id} /><button className="btn ghost sm" name="outcome" value="no_show">Didn&apos;t join</button></form>
                <Link href={`/mentor/score/${s.id}`} className="btn sm">Write scorecard</Link>
              </>,
            ]} />))}
        </Table>
      </section>)}

    <Tabs items={[
      { href: "/sessions", label: "Upcoming", count: upcoming.length, on: tab === "upcoming" },
      { href: "/sessions?tab=past", label: "Past", count: past.length, on: tab === "past" },
    ]} />

    {tab === "upcoming" ? (
      <Table cols={upCols} empty={<>
        <div className="strong" style={{ color: "var(--fg)" }}>Nothing coming up</div>
        <div className="mt-1">{mentor ? "Add open times so students can book you." : "Book a mock interview or a career chat."}</div>
        <Link href={mentor ? "/mentor/availability" : "/mentors"} className="btn secondary sm mt-4">{mentor ? "Add availability" : "Find a mentor"}</Link>
      </>}>
        {upcoming.map((s) => {
          const hours = (new Date(s.starts_at).getTime() - Date.now()) / 3600e3;
          const notes: React.ReactNode[] = [];
          if (mentor && s.kind !== "mentor_free") notes.push(<span key="e">You earn <span className="strong" style={{ color: "var(--fg)" }}>{inr(s.mentor_payout_inr)}</span> after the {s.commission_pct}% Calport fee{s.kind === "credit" ? " · paid by Calport" : ""}</span>);
          if (!mentor && s.credit_used && hours < 24 && hours > 0) notes.push(<span key="c">Cancelling now won&apos;t return your free session (less than 24 hours to go).</span>);
          const sub = (mentor && !s.meet_link) || notes.length ? (
            <div className="row wrap g-3 t-small muted">
              {mentor && !s.meet_link && (
                <form action={setMeetLink} className="row g-2" style={{ flex: "1 1 320px", maxWidth: 440 }}>
                  <input type="hidden" name="session_id" value={s.id} />
                  <input className="input grow" name="link" type="url" placeholder="Paste the Google Meet link" required style={{ height: "var(--h-sm)", fontSize: 13 }} />
                  <button className="btn secondary sm">Add link</button>
                </form>)}
              {notes}
            </div>) : undefined;
          return (
            <Row key={s.id} cols={upCols} sub={sub} cells={[
              <Who key="w" name={s.other_name} sub={s.other_sub} />, <When key="t" s={s} />, <Topic key="p" s={s} />,
              <StatusBadge key="b" status={s.status} />,
              <>
                {s.meet_link ? <a href={s.meet_link} target="_blank" rel="noreferrer" className="btn sm"><Icon name="video" />Join</a>
                  : !mentor && <span className="t-small muted">Link coming</span>}
                <form action={cancelSession}><input type="hidden" name="session_id" value={s.id} /><button className="btn ghost sm" style={{ color: "var(--bad)" }}>Cancel</button></form>
              </>,
            ]} />);
        })}
      </Table>
    ) : (
      <Table cols={pastCols} empty="Finished sessions and scorecards will show up here.">
        {past.map((s) => (
          <Row key={s.id} cols={pastCols} cells={[
            <Who key="w" name={s.other_name} sub={s.other_sub} />, <When key="t" s={s} />, <Topic key="p" s={s} />,
            <StatusBadge key="b" status={s.status} />,
            s.scored ? <Link key="a" href={`/scorecards/${s.id}`} className="btn secondary sm">Scorecard</Link> : <span key="a" />,
          ]} />))}
      </Table>
    )}
  </>);
}
