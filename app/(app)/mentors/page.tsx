import Link from "next/link";
import { requireMe } from "@/lib/me";
import { inr } from "@/lib/format";
import type { MentorCard } from "@/lib/queries";
import { Empty, PageHeader, Row, Table, Tag, Who } from "@/components/ui";

const COLS: [string, string, string?][] = [["Mentor", "minmax(0,1.6fr)", "main"], ["Type", "130px"], ["Helps with", "minmax(0,1.3fr)", "hide-m"], ["Mentored", "100px", "hide-m"], ["Price", "90px"], ["", "90px", "acts"]];
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
    <PageHeader title={<span className="row g-3">Mentors<span className="tag p-grey">{mentors.length}</span></span>} description="Seniors who got placed and professionals who've done the job. Book a mock interview or a career chat." />
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
      <Table cols={COLS}>
        {mentors.map((m) => (
          <Row key={m.id} cols={COLS} cells={[
            <Who key="w" name={m.full_name} href={`/mentors/${m.id}`} sub={[m.job_title, m.company].filter(Boolean).join(" · ")} />,
            m.tier === "senior" ? <Tag key="t" tone="green">Placed senior</Tag> : <Tag key="t" tone="purple">Professional</Tag>,
            <div key="e" className="row g-1" style={{ overflow: "hidden", flexWrap: "nowrap" }}>{(m.expertise ?? []).slice(0, 2).map((e) => <span key={e} className="chip-soft">{e}</span>)}</div>,
            <span key="s" className="tabular">{m.students_mentored > 0 ? m.students_mentored : <span className="muted">New</span>}</span>,
            m.current_price_inr === 0 ? <Tag key="p" tone="teal">Free</Tag> : <span key="p" className="t-num-sm">{inr(m.current_price_inr)}</span>,
            <Link key="b" href={`/mentors/${m.id}`} className="btn sm">Book</Link>,
          ]} />))}
      </Table>
    ) : <Empty icon="users" title={filtered ? "No mentors match" : "Mentors are joining"} text={filtered ? "Try a different search or clear the filters." : "New mentors are being approved every day. Check back soon."} action={filtered ? { href: "/mentors", label: "Clear filters" } : undefined} />}
  </>);
}
