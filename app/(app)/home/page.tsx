import Link from "next/link";
import { requireMe } from "@/lib/me";
import { myCredits, mySessions } from "@/lib/queries";
import { when } from "@/lib/format";
import { Alert } from "@/components/Shell";

const FOCUS: Record<number, [string, string]> = {
  1: ["Explore", "Try two or three roles. Talk to a senior about what the work is really like."],
  2: ["Build", "Pick a direction and build one real project. Start a daily practice habit."],
  3: ["Land the internship", "Practise for specific companies and get mock interviews before applications open."],
  4: ["Crack placements", "Mock interviews every week until placement day. Fix your weakest skill first."],
  5: ["Crack placements", "Mock interviews every week until placement day. Fix your weakest skill first."],
};

export default async function Home({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { sb, profile } = await requireMe({ role: "learner" });
  const sp = await searchParams;
  const [credits, sessions, practices] = await Promise.all([
    myCredits(sb), mySessions(sb, profile),
    sb.from("practices").select("id, status").eq("learner_id", profile.id),
  ]);
  const upcoming = sessions.filter((s) => s.status === "confirmed" && new Date(s.ends_at) > new Date()).slice(0, 3);
  const graded = (practices.data ?? []).filter((p) => p.status === "graded").length;
  const [focus, focusText] = FOCUS[profile.year ?? 1];
  const first = profile.full_name.split(" ")[0] || "there";
  return (<>
    {sp.welcome && <Alert ok={`Welcome to Calport, ${first}. You have ${credits.balance} free sessions to start.`} />}
    <div className="head"><h1>Hi {first}</h1><p className="muted">Year {profile.year} · {profile.target_role}</p></div>
    <div className="grid" style={{ marginBottom: 14 }}>
      <div className="card"><div className="muted small">This year: {focus}</div><p style={{ marginTop: 6 }}>{focusText}</p></div>
      <div className="card"><div className="muted small">Free sessions left</div><div className="big">{credits.balance}</div>
        <Link href="/mentors" className="btn sm" style={{ marginTop: 8 }}>Book a mentor</Link></div>
      <div className="card"><div className="muted small">Friends who joined</div>
        <div className="big">{credits.referral_credits_earned}<span className="muted" style={{ fontSize: 16 }}> / {credits.referral_credits_max}</span></div>
        <div className="meter" style={{ margin: "8px 0" }}><span style={{ width: `${(credits.referral_credits_earned / credits.referral_credits_max) * 100}%` }} /></div>
        <Link href="/invite" className="small">Invite friends → earn free sessions</Link></div>
    </div>
    {!profile.profile_completed_at && <Alert error="Finish your profile so your friends' invites and your path work properly." />}
    <div className="card" style={{ marginBottom: 14 }}>
      <div className="row between"><h2 style={{ margin: 0 }}>Practice</h2><Link href="/practice" className="btn ghost sm">Open</Link></div>
      <p className="muted small" style={{ marginTop: 8, marginBottom: 0 }}>{graded ? `${graded} practice${graded > 1 ? "s" : ""} graded.` : "You haven't done a practice yet. Your first one also unlocks a free session for the friend who invited you."}</p>
    </div>
    <h2>Upcoming sessions</h2>
    {upcoming.length ? (
      <div className="list">{upcoming.map((s) => (
        <div key={s.id} className="row between"><div><strong>{s.other_name}</strong><div className="muted small">{s.other_sub}</div></div>
          <div className="small">{when(s.starts_at)}</div></div>))}
      </div>
    ) : <div className="empty">No sessions booked yet. <Link href="/mentors">Find a mentor</Link></div>}
  </>);
}
