import Link from "next/link";
import { requireMe } from "@/lib/me";
import { inr } from "@/lib/format";
import type { MentorCard } from "@/lib/queries";

export default async function Mentors({ searchParams }: { searchParams: Promise<{ q?: string; tier?: string; free?: string }> }) {
  const { sb } = await requireMe({ role: "learner" });
  const sp = await searchParams;
  let query = sb.from("mentor_directory").select("*").order("sessions_completed", { ascending: false });
  if (sp.tier === "senior" || sp.tier === "expert") query = query.eq("tier", sp.tier);
  if (sp.free === "1") query = query.lte("current_price_inr", 999);
  const { data } = await query;
  const term = (sp.q ?? "").toLowerCase();
  const mentors = ((data ?? []) as MentorCard[]).filter((m) =>
    !term || [m.full_name, m.company, m.job_title, m.headline, m.college, ...(m.expertise ?? [])].join(" ").toLowerCase().includes(term));
  return (<>
    <div className="head"><h1>Mentors</h1><p className="muted">Seniors who got placed and professionals who&apos;ve done the job. Book a mock interview or a career chat.</p></div>
    <form className="row" style={{ marginBottom: 18 }}>
      <input name="q" defaultValue={sp.q} placeholder="Search company, role or skill" style={{ flex: "1 1 220px", width: "auto" }} />
      <select name="tier" defaultValue={sp.tier ?? ""} style={{ width: "auto" }}><option value="">Everyone</option><option value="senior">Placed seniors</option><option value="expert">Professionals</option></select>
      <label className="check" style={{ margin: 0 }}><input type="checkbox" name="free" value="1" defaultChecked={sp.free === "1"} /> Free sessions accepted</label>
      <button className="btn ghost">Filter</button>
    </form>
    {mentors.length ? <div className="grid">{mentors.map((m) => (
      <Link key={m.id} href={`/mentors/${m.id}`} className="card" style={{ textDecoration: "none" }}>
        <div className="row between"><strong>{m.full_name}</strong><span className={m.current_price_inr === 0 ? "pill dark" : "pill"}>{m.current_price_inr === 0 ? "Free" : inr(m.current_price_inr)}</span></div>
        <div className="muted small" style={{ margin: "4px 0 10px" }}>{[m.job_title, m.company].filter(Boolean).join(" at ")}</div>
        <p className="small" style={{ marginBottom: 10 }}>{m.headline}</p>
        <div className="row small muted"><span>{m.tier === "senior" ? "Placed senior" : "Professional"}</span>{m.students_mentored > 0 && <span>· mentored {m.students_mentored}</span>}</div>
      </Link>))}</div>
      : <div className="empty">No mentors match yet. New mentors are joining every day.</div>}
  </>);
}
