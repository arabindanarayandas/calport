import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions } from "@/lib/queries";
import { inr, relDay, time } from "@/lib/format";
import { Alert, DateTile, Empty, PageHeader, SectionHead, Stat } from "@/components/ui";
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
      <Stat icon="users" label="Students mentored" value={students} foot="Shown on your profile" />
      <Stat icon="calendar" href="/sessions" label="Sessions done" value={done.length} foot={`${upcoming.length} coming up`} />
      <Stat icon="gift" label="Free sessions given" value={freeUsed} suffix="/ 2" foot={mentor?.price_inr ? `Then ${inr(mentor.price_inr)} a session` : "You've chosen to stay free"} />
      <Stat icon="wallet" href="/mentor/earnings" label="Earned" value={inr(earned)} foot="Paid out once payments go live" />
    </div>

    <section className="section">
      <SectionHead title="Upcoming" action={<Link href="/mentor/availability" className="btn ghost sm flush-r">{openSlots ?? 0} open slots</Link>} />
      {upcoming.length ? <div className="list">{upcoming.slice(0, 5).map((s) => (
        <Link key={s.id} href="/sessions" className="list-row row-link">
          <DateTile iso={s.starts_at} />
          <div className="list-main"><div className="title truncate">{s.other_name}</div><div className="sub truncate">{relDay(s.starts_at)}, {time(s.starts_at)}{s.topic ? ` · ${s.topic}` : ""}</div></div>
          <Icon name="chevronRight" className="faint shrink-0" />
        </Link>))}</div>
        : <Empty icon="calendar" title="No sessions booked yet" text="Share your profile with juniors to get your first booking." action={{ href: "/mentor/availability", label: "Add availability" }} />}
    </section>
  </>);
}
