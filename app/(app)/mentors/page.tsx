import Link from "next/link";
import { requireMe } from "@/lib/me";
import { inr } from "@/lib/format";
import type { MentorCard } from "@/lib/queries";
import { Avatar, Empty, PageHeader } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { AutoForm } from "@/components/AutoForm";

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
  const filtered = Boolean(sp.q || sp.tier || sp.free);
  return (<>
    <PageHeader title="Mentors" description="Seniors who got placed and professionals who've done the job. Book a mock interview or a career chat." />
    <AutoForm className="filters">
      <div className="prefix f-search">
        <span style={{ display: "flex" }}><Icon name="search" /></span>
        <input className="input" name="q" defaultValue={sp.q} placeholder="Search company, role or skill" style={{ paddingLeft: 34 }} />
      </div>
      <select className="select" name="tier" defaultValue={sp.tier ?? ""} aria-label="Who">
        <option value="">Everyone</option><option value="senior">Placed seniors</option><option value="expert">Professionals</option>
      </select>
      <label className="chip"><input type="checkbox" name="free" value="1" defaultChecked={sp.free === "1"} /><span className="hide-sm">Free sessions accepted</span><span className="show-sm">Free sessions</span></label>
      <button className="btn secondary hide-sm">Apply</button>
      {filtered && <Link href="/mentors" className="btn ghost hide-sm">Clear</Link>}
    </AutoForm>
    {mentors.length ? (
      <div className="cols cols-3">{mentors.map((m) => (
        <Link key={m.id} href={`/mentors/${m.id}`} className="card mentor-card">
          <div className="row g-3">
            <Avatar name={m.full_name} size={40} />
            <div className="grow"><div className="strong truncate">{m.full_name}</div><div className="t-small muted truncate">{[m.job_title, m.company].filter(Boolean).join(" · ")}</div></div>
          </div>
          <p className="t-small fg-2 clamp-2 mt-4">{m.headline}</p>
          {m.expertise?.length > 0 && <div className="tags mt-3">{m.expertise.slice(0, 3).map((e) => <span key={e} className="badge outline">{e}</span>)}</div>}
          <div className="mentor-card-foot">
            <span className="t-small muted">{m.tier === "senior" ? "Placed senior" : "Professional"}{m.students_mentored > 0 ? ` · ${m.students_mentored} mentored` : ""}</span>
            {m.current_price_inr === 0 ? <span className="badge solid">Free</span> : <span className="t-num-sm">{inr(m.current_price_inr)}</span>}
          </div>
        </Link>))}
      </div>
    ) : <Empty icon="users" title={filtered ? "No mentors match" : "Mentors are joining"} text={filtered ? "Try a different search or clear the filters." : "New mentors are being approved every day. Check back soon."} action={filtered ? { href: "/mentors", label: "Clear filters" } : undefined} />}
  </>);
}
