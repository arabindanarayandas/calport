import { requireMe } from "@/lib/me";
import { mySessions } from "@/lib/queries";
import { inr, when } from "@/lib/format";

export default async function Earnings() {
  const { sb, profile } = await requireMe({ role: "mentor" });
  const sessions = await mySessions(sb, profile);
  const paid = sessions.filter((s) => s.kind !== "mentor_free" && s.status !== "cancelled");
  const done = paid.filter((s) => s.status === "completed" || s.status === "no_show");
  const n = paid.length;
  const nextRate = n < 10 ? 25 : n < 20 ? 20 : 10;
  return (<>
    <div className="head"><h1>Earnings</h1><p className="muted">Payouts start once payments go live. Every completed session below is recorded and will be paid.</p></div>
    <div className="grid" style={{ marginBottom: 20 }}>
      <div className="card"><div className="muted small">Earned so far</div><div className="big">{inr(done.reduce((a, s) => a + s.mentor_payout_inr, 0))}</div></div>
      <div className="card"><div className="muted small">Paid sessions</div><div className="big">{n}</div></div>
      <div className="card"><div className="muted small">Calport fee on your next session</div><div className="big">{nextRate}%</div>
        <p className="muted small" style={{ margin: 0 }}>{n < 10 ? `${10 - n} more until it drops to 20%` : n < 20 ? `${20 - n} more until it drops to 10%` : "Lowest rate"}</p></div>
    </div>
    <div className="card soft small" style={{ marginBottom: 20 }}>Calport fee: 25% on paid sessions 1–10, 20% on 11–20, 10% after that. When a student uses a free session with you, Calport pays you the same amount.</div>
    <h2>History</h2>
    {paid.length ? <div className="list">{paid.slice().reverse().map((s) => (
      <div key={s.id} className="row between"><div><strong>{s.other_name}</strong><div className="muted small">{when(s.starts_at)} · {s.kind === "credit" ? "Paid by Calport" : "Paid by student"} · {s.commission_pct}% fee</div></div>
        <div>{inr(s.mentor_payout_inr)}</div></div>))}</div>
      : <div className="empty">No paid sessions yet. Your first 2 sessions are free.</div>}
  </>);
}
