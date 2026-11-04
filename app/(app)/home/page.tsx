import Link from "next/link";
import { requireMe } from "@/lib/me";
import { myCredits, mySessions } from "@/lib/queries";
import { relDay, time } from "@/lib/format";
import { Alert, Avatar, Empty, Meter, PageHeader, SectionHead, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";

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
    {!profile.profile_completed_at && <Alert error="Finish your profile so your friends' invites and your path work properly." />}
    <PageHeader eyebrow={<>Year {profile.year} · {profile.target_role}</>} title={`Hi ${first}`}
      actions={<Link href="/mentors" className="btn">Book a mentor</Link>} />

    <div className="panel row g-4" style={{ marginBottom: 16 }}>
      <span className="empty-icon" style={{ margin: 0 }}><Icon name="sparkle" /></span>
      <div className="grow"><div className="t-label">This year: {focus}</div><div className="mt-1">{focusText}</div></div>
    </div>

    <div className="cols cols-3">
      <Stat label="Free sessions left" value={credits.balance} foot={`Use with free mentors, or mentors charging up to ₹${credits.price_cap}.`} />
      <Stat label="Friends who joined" value={credits.referral_credits_earned} suffix={`/ ${credits.referral_credits_max}`}
        foot={<><Meter value={credits.referral_credits_earned} max={credits.referral_credits_max} /><div className="mt-3"><Link href="/invite">Invite friends →</Link></div></>} />
      <Stat label="Practices graded" value={graded}
        foot={graded ? <Link href="/practice">Open practice →</Link> : "Your first one unlocks a free session for the friend who invited you."} />
    </div>

    <section className="section">
      <SectionHead title="Upcoming sessions" action={upcoming.length > 0 && <Link href="/sessions" className="btn ghost sm flush-r">View all</Link>} />
      {upcoming.length ? (
        <div className="list">{upcoming.map((s) => (
          <div key={s.id} className="list-row">
            <Avatar name={s.other_name} />
            <div className="list-main"><div className="title truncate">{s.other_name}</div><div className="sub truncate">{s.topic || s.other_sub}</div></div>
            <div className="when-col">
              <span className="strong t-small">{relDay(s.starts_at)}</span><span className="t-small muted tabular">{time(s.starts_at)}</span>
            </div>
          </div>))}
        </div>
      ) : <Empty icon="calendar" title="No sessions booked yet" text="Book a mock interview or a career chat with a senior." action={{ href: "/mentors", label: "Find a mentor" }} />}
    </section>
  </>);
}
