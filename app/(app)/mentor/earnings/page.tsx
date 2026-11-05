import { requireMe } from "@/lib/me";
import { mySessions } from "@/lib/queries";
import { inr, relDay, time } from "@/lib/format";
import { Empty, PageHeader, Row, SectionHead, Stat, Table, Tag, Who } from "@/components/ui";

const HCOLS: [string, string, string?][] = [["Student", "minmax(0,1.5fr)", "main"], ["Paid by", "150px"], ["Fee", "70px", "hide-m"], ["Status", "170px"], ["You get", "100px", "right"]];

const TIERS = [["Paid sessions 1–10", 25, 0, 10], ["Paid sessions 11–20", 20, 10, 20], ["From then on", 10, 20, Infinity]] as const;

export default async function Earnings() {
  const { sb, profile } = await requireMe({ role: "mentor" });
  const sessions = await mySessions(sb, profile);
  const paid = sessions.filter((s) => s.kind !== "mentor_free" && s.status !== "cancelled");
  const done = paid.filter((s) => s.status === "completed" || s.status === "no_show");
  const n = paid.length;
  const nextRate = n < 10 ? 25 : n < 20 ? 20 : 10;
  return (<>
    <PageHeader title="Earnings" description="Payouts start once payments go live. Every completed session below is recorded and will be paid." />
    <div className="cols cols-3">
      <Stat icon="wallet" label="Earned so far" value={inr(done.reduce((a, s) => a + s.mentor_payout_inr, 0))} foot={`${done.length} completed paid session${done.length === 1 ? "" : "s"}`} />
      <Stat icon="calendar" label="Paid sessions" value={n} foot="Including upcoming" />
      <Stat icon="target" label="Calport fee on your next session" value={`${nextRate}%`} foot={n < 10 ? `${10 - n} more until it drops to 20%` : n < 20 ? `${20 - n} more until it drops to 10%` : "You're on the lowest rate"} />
    </div>

    <div className="card mt-4">
      <div className="card-head"><h2 className="t-section">Calport fee</h2><span className="t-small muted">The more you mentor, the less we keep</span></div>
      <div className="list" style={{ border: 0, boxShadow: "none", borderRadius: 0 }}>
        {TIERS.map(([label, pct, lo, hi]) => {
          const on = n >= lo && n < hi;
          return (
            <div key={label} className="list-row" style={{ minHeight: 52 }}>
              <div className="list-main">{label}</div>
              {on && <span className="badge solid">You&apos;re here</span>}
              <span className="t-num-sm" style={{ width: 48, textAlign: "right" }}>{pct}%</span>
            </div>);
        })}
      </div>
      <div className="card-foot t-small muted" style={{ justifyContent: "flex-start" }}>When a student uses a free session with you, Calport pays you the same amount.</div>
    </div>

    <section className="section">
      <SectionHead title="History" />
      {paid.length ? <Table cols={HCOLS}>{paid.slice().reverse().map((s) => (
        <Row key={s.id} cols={HCOLS} cells={[
          <Who key="w" name={s.other_name} sub={`${relDay(s.starts_at)}, ${time(s.starts_at)}`} />,
          s.kind === "credit" ? <Tag key="k" tone="blue">Paid by Calport</Tag> : <Tag key="k" tone="purple">Paid by student</Tag>,
          <span key="f" className="tabular muted">{s.commission_pct}%</span>,
          s.status !== "confirmed" ? <Tag key="st" tone="green">Earned</Tag> : new Date(s.starts_at) > new Date() ? <Tag key="st" tone="grey">Upcoming</Tag> : <Tag key="st" tone="yellow">Awaiting scorecard</Tag>,
          <span key="a" className="t-num-sm">{inr(s.mentor_payout_inr)}</span>,
        ]} />))}</Table>
        : <Empty icon="wallet" title="No paid sessions yet" text="Your first 2 sessions are free. Paid sessions will appear here." />}
    </section>
  </>);
}
