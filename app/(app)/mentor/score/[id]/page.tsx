import { notFound } from "next/navigation";
import { requireMe } from "@/lib/me";
import { Alert } from "@/components/Shell";
import { message, when } from "@/lib/format";
import { submitScorecard } from "../../../actions";

const SKILLS = ["Problem solving", "Communication", "Role knowledge", "Structure", "Confidence"];

export default async function Score({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const { sb, profile } = await requireMe({ role: "mentor" });
  const { data: s } = await sb.from("sessions").select("*").eq("id", id).eq("mentor_id", profile.id).maybeSingle();
  if (!s) notFound();
  const { data: learner } = await sb.from("profiles").select("full_name, target_role").eq("id", s.learner_id).single();
  return (<>
    <div className="head"><h1>Scorecard for {learner?.full_name}</h1><p className="muted">{when(s.starts_at)}{s.topic ? ` · ${s.topic}` : ""}</p></div>
    <Alert error={message(sp.error)} />
    <form action={submitScorecard} className="stack">
      <input type="hidden" name="session_id" value={s.id} />
      <div className="card small soft">Score each skill 1–4. 1 = needs work, 2 = getting there, 3 = good, 4 = strong. The student sees this.</div>
      {SKILLS.map((k) => (
        <div key={k} className="card">
          <input type="hidden" name="skill" value={k} />
          <div className="row between"><strong>{k}</strong>
            <select name="score" defaultValue="" required style={{ width: "auto" }}><option value="" disabled>Score</option>{[1,2,3,4].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <input name="note" placeholder="One line of feedback (optional)" style={{ marginTop: 10 }} />
        </div>))}
      <div className="field"><label>What went well</label><textarea name="strengths" required /></div>
      <div className="field"><label>What to work on next</label><textarea name="improve" required /></div>
      <div><button className="btn">Send scorecard</button></div>
    </form>
  </>);
}
