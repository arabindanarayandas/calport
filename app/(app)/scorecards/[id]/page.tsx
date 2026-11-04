import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { day, time } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { PageHeader } from "@/components/ui";

type Skill = { skill: string; score: number; note?: string };
const LABEL = ["", "Needs work", "Getting there", "Good", "Strong"];

function Dots({ n }: { n: number }) {
  return <span className="dots" aria-label={`${n} of 4`}>{[1, 2, 3, 4].map((i) => <span key={i} className={i <= n ? "on" : ""} />)}</span>;
}

export default async function Scorecard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { sb } = await requireMe();
  const { data: sc } = await sb.from("scorecards").select("*").eq("session_id", id).maybeSingle();
  if (!sc) notFound();
  const { data: s } = await sb.from("sessions").select("starts_at, topic").eq("id", id).single();
  const overall = Number(sc.overall);
  return (<>
    <div className="eyebrow"><Link href="/sessions" className="row g-1"><Icon name="arrowLeft" size={14} />Sessions</Link></div>
    <PageHeader title="Scorecard" description={<>{s && `${day(s.starts_at)}, ${time(s.starts_at)}`}{s?.topic ? ` · ${s.topic}` : ""}</>} />
    <div className="split">
      <div className="list">
        {(sc.skills as Skill[]).map((k) => (
          <div key={k.skill} className="list-row">
            <div className="list-main">
              <div className="row between g-3"><span className="title">{k.skill}</span><span className="row g-3 shrink-0"><span className="t-small muted">{LABEL[k.score]}</span><Dots n={k.score} /></span></div>
              {k.note && <p className="t-small fg-2 mt-1">{k.note}</p>}
            </div>
          </div>))}
      </div>
      <div className="stack g-4">
        <div className="card card-pad">
          <div className="t-label">Overall</div>
          <div className="t-num mt-2">{overall.toFixed(1)}<span className="muted" style={{ fontSize: 15, fontWeight: 500, letterSpacing: 0, marginLeft: 4 }}>/ 4</span></div>
          <div className="meter mt-3"><span style={{ width: `${(overall / 4) * 100}%` }} /></div>
        </div>
        <div className="card card-pad"><div className="t-label">What went well</div><p className="pre mt-2 fg-2">{sc.strengths || "—"}</p></div>
        <div className="card card-pad"><div className="t-label">Work on next</div><p className="pre mt-2 fg-2">{sc.improve || "—"}</p></div>
      </div>
    </div>
  </>);
}
