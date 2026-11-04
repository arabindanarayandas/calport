import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions } from "@/lib/queries";
import { inr, relDay, time } from "@/lib/format";
import { Alert, Avatar, Empty, PageHeader, SectionHead, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";

export default async function MentorHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { sb, profile, mentor } = await requireMe({ role: "mentor" });
  const sp = await searchParams;
  const sessions = await mySessions(sb, profile);
  const { count: openSlots } = await sb.from("availability").select("id", { count: "exact", head: true })
    .eq("mentor_id", profile.id).eq("booked", false).gte("starts_at", new Date().toISOString());
  const now = new Date();
  const done = sessions.filter((s) => s.status === "completed");
  const students = new Set(done.map((s) => s.learner_id)).size;
  const upcoming = sessions.filter((s) => s.status === "confirmed" && new Date(s.starts_at) > now);
  const toScore = sessions.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now).length;
  const freeUsed = Math.min(sessions.filter((s) => s.kind === "mentor_free" && s.status !== "cancelled").length, 2);
  const earned = done.filter((s) => s.kind !== "mentor_free").reduce((a, s) => a + s.mentor_payout_inr, 0);
  return (<>
    {sp.welcome && <Alert ok="Thanks for joining. We'll review your profile and let you know when you're live." />}
    {mentor && !mentor.approved && !sp.welcome && <Alert info="Your profile is under review. You can add availability now — students will see it once you're approved." />}
    {toScore > 0 && (
      <div className="alert warn"><Icon name="alert" /><div className="grow">{toScore} session{toScore > 1 ? "s need" : " needs"} a scorecard.</div>
        <Link href="/sessions" className="btn secondary sm" style={{ marginTop: -5, marginBottom: -5 }}>Review</Link></div>)}
    <PageHeader eyebrow={mentor?.headline} title={`Hi ${profile.full_name.split(" ")[0]}`}
      actions={<Link href="/mentor/availability" className="btn"><Icon name="plus" />Add availability</Link>} />

    <div className="cols cols-4">
      <Stat label="Students mentored" value={students} foot="Shown on your profile" />
      <Stat label="Sessions done" value={done.length} foot={`${upcoming.length} coming up`} />
      <Stat label="Free sessions given" value={freeUsed} suffix="/ 2" foot={mentor?.price_inr ? `Then ${inr(mentor.price_inr)} a session` : "You've chosen to stay free"} />
      <Stat label="Earned" value={inr(earned)} foot={<Link href="/mentor/earnings">See earnings →</Link>} />
    </div>

    <section className="section">
      <SectionHead title="Upcoming" action={<Link href="/mentor/availability" className="btn ghost sm flush-r">{openSlots ?? 0} open slots</Link>} />
      {upcoming.length ? <div className="list">{upcoming.slice(0, 5).map((s) => (
        <div key={s.id} className="list-row">
          <Avatar name={s.other_name} />
          <div className="list-main"><div className="title truncate">{s.other_name}</div><div className="sub truncate">{s.topic || s.other_sub}</div></div>
          <div className="when-col"><span className="strong t-small">{relDay(s.starts_at)}</span><span className="t-small muted tabular">{time(s.starts_at)}</span></div>
        </div>))}</div>
        : <Empty icon="calendar" title="No sessions booked yet" text="Share your profile with juniors to get your first booking." action={{ href: "/mentor/availability", label: "Add availability" }} />}
    </section>
  </>);
}
