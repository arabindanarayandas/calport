import { requireMe } from "@/lib/me";

export default async function Practice() {
  await requireMe({ role: "learner" });
  return (<>
    <div className="head"><h1>Practice</h1><p className="muted">Paste a job description, and Calport researches the company, builds a plan and gives you a graded practice round.</p></div>
    <div className="empty">AI practice is switching on soon.</div>
  </>);
}
