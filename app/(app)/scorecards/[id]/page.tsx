import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { when } from "@/lib/format";

type Skill = { skill: string; score: number; note?: string };
const LABEL = ["", "Needs work", "Getting there", "Good", "Strong"];

export default async function Scorecard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireMe();
  const { data: sc } = await sb.from("scorecards").select("*").eq("session_id", id).maybeSingle();
  if (!sc) notFound();
  const { data: s } = await sb.from("sessions").select("starts_at, topic").eq("id", id).single();
  return (<>
    <div className="head"><h1>Scorecard</h1><p className="muted">{s && when(s.starts_at)}{s?.topic ? ` · ${s.topic}` : ""}</p></div>
    <div className="card" style={{ marginBottom: 14 }}><div className="muted small">Overall</div><div className="big">{Number(sc.overall).toFixed(1)} <span className="muted" style={{ fontSize: 16 }}>/ 4</span></div></div>
    <div className="list" style={{ marginBottom: 14 }}>{(sc.skills as Skill[]).map((k) => (
      <div key={k.skill}><div className="row between"><strong>{k.skill}</strong><span className="pill">{k.score} · {LABEL[k.score]}</span></div>
        {k.note && <p className="muted small" style={{ margin: "6px 0 0" }}>{k.note}</p>}</div>))}</div>
    <div className="grid">
      <div className="card"><h3>What went well</h3><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{sc.strengths || "—"}</p></div>
      <div className="card"><h3>Work on next</h3><p className="muted" style={{ whiteSpace: "pre-wrap" }}>{sc.improve || "—"}</p></div>
    </div>
  </>);
}
