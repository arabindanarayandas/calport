import Link from "next/link";
import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { Alert, Avatar, PageHeader } from "@/components/ui";
import { message, relDay, time } from "@/lib/format";
import { Icon } from "@/components/Icon";
import { submitScorecard } from "../../../actions";

const SKILLS = ["Problem solving", "Communication", "Role knowledge", "Structure", "Confidence"];
const LEVELS = ["Needs work", "Getting there", "Good", "Strong"];

export default async function Score({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb, profile } = await requireMe({ role: "mentor" });
  const { data: s } = await sb.from("sessions").select("*").eq("id", id).eq("mentor_id", profile.id).maybeSingle();
  if (!s) notFound();
  const { data: learner } = await sb.from("profiles").select("full_name, target_role, college, year").eq("id", s.learner_id).single();
  const name = learner?.full_name ?? "Student";
  return (<>
    <div className="eyebrow"><Link href="/sessions" className="row g-1"><Icon name="arrowLeft" size={14} />Sessions</Link></div>
    <PageHeader title="Write scorecard" description="The student sees this. Be specific and kind." />
    <div className="card card-pad row g-3" style={{ marginBottom: 24 }}>
      <Avatar name={name} />
      <div className="grow"><div className="strong">{name}</div><div className="t-small muted">{[learner?.college, learner?.year ? `Year ${learner.year}` : null, learner?.target_role].filter(Boolean).join(" · ")}</div></div>
      <div className="when-col"><span className="strong t-small">{relDay(s.starts_at)}</span><span className="t-small muted">{time(s.starts_at)}</span></div>
    </div>
    <Alert error={message(sp.error)} />
    <form action={submitScorecard} className="card">
      <input type="hidden" name="session_id" value={s.id} />
      <div className="card-head"><h2 className="t-section">Skills</h2><span className="t-small muted">1 needs work · 4 strong</span></div>
      <div className="list" style={{ border: 0, boxShadow: "none", borderRadius: 0 }}>
        {SKILLS.map((k) => (
          <div key={k} className="list-row top skill-row">
            <input type="hidden" name="skill" value={k} />
            <div className="skill-name">{k}</div>
            <div className="grow stack g-2">
              <div className="segment score-seg" role="radiogroup" aria-label={k}>
                {LEVELS.map((l, i) => (
                  <label key={l} className="seg-opt"><input type="radio" name={`score-${k}`} value={i + 1} required /><span className="n">{i + 1}</span><span className="l">{l}</span></label>
                ))}
              </div>
              <input className="input" name="note" placeholder="One line of feedback (optional)" style={{ height: "var(--h-sm)", fontSize: 13 }} />
            </div>
          </div>))}
      </div>
      <div className="card-body fields" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="field"><label htmlFor="strengths">What went well</label><textarea className="textarea" id="strengths" name="strengths" required /></div>
        <div className="field"><label htmlFor="improve">What to work on next</label><textarea className="textarea" id="improve" name="improve" required /></div>
      </div>
      <div className="card-foot"><Link href="/sessions" className="btn ghost">Cancel</Link><button className="btn">Send scorecard</button></div>
    </form>
  </>);
}
