import Link from "next/link";
import { requireMe } from "@/lib/me";
import { mySessions } from "@/lib/queries";
import { inr, when } from "@/lib/format";
import { Alert } from "@/components/Shell";

export default async function MentorHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { sb, profile, mentor } = await requireMe({ role: "mentor" });
  const sp = await searchParams;
  const sessions = await mySessions(sb, profile);
  const { count: openSlots } = await sb.from("availability").select("id", { count: "exact", head: true })
    .eq("mentor_id", profile.id).eq("booked", false).gte("starts_at", new Date().toISOString());
  const now = new Date();
  const done = sessions.filter((s) => s.status === "completed");
  const students = new Set(done.map((s) => s.learner_id)).size;
  const upcoming = sessions.filter((s) => s.status === "confirmed" && new Date(s.ends_at) > now);
  const toScore = sessions.filter((s) => s.status === "confirmed" && new Date(s.starts_at) <= now).length;
  const freeUsed = sessions.filter((s) => s.kind === "mentor_free" && s.status !== "cancelled").length;
  const earned = done.filter((s) => s.kind !== "mentor_free").reduce((a, s) => a + s.mentor_payout_inr, 0);
  return (<>
    {sp.welcome && <Alert ok="Thanks for joining. We'll review your profile and let you know when you're live." />}
    {mentor && !mentor.approved && !sp.welcome && <Alert error="Your profile is under review. You can add availability now — students will see it once you're approved." />}
    <div className="head"><h1>Hi {profile.full_name.split(" ")[0]}</h1><p className="muted">{mentor?.headline}</p></div>
    <div className="grid" style={{ marginBottom: 20 }}>
      <div className="card"><div className="muted small">Students mentored</div><div className="big">{students}</div></div>
      <div className="card"><div className="muted small">Sessions done</div><div className="big">{done.length}</div></div>
      <div className="card"><div className="muted small">Free sessions given</div><div className="big">{Math.min(freeUsed, 2)} / 2</div>
        <p className="muted small" style={{ margin: 0 }}>{mentor?.price_inr ? `Then ${inr(mentor.price_inr)} per session` : "You've chosen to stay free"}</p></div>
      <div className="card"><div className="muted small">Earned</div><div className="big">{inr(earned)}</div></div>
    </div>
    {toScore > 0 && <Alert error={`${toScore} session${toScore > 1 ? "s need" : " needs"} a scorecard.`} />}
    <div className="row between"><h2>Upcoming</h2><Link href="/mentor/availability" className="btn ghost sm">{openSlots ?? 0} open slots · add more</Link></div>
    {upcoming.length ? <div className="list">{upcoming.map((s) => (
      <div key={s.id} className="row between"><div><strong>{s.other_name}</strong><div className="muted small">{s.other_sub}{s.topic ? ` · ${s.topic}` : ""}</div></div>
        <div className="small">{when(s.starts_at)}</div></div>))}</div>
      : <div className="empty">No sessions booked yet. Share your profile with juniors to get your first booking.</div>}
  </>);
}
