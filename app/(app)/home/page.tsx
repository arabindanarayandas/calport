import Link from "next/link";
import { requireMe } from "@/lib/me";
import { myCredits, mySessions, type SessionWithPeople } from "@/lib/queries";
import { relDay, time } from "@/lib/format";
import { Alert, Avatar, DateTile, Empty, PageHeader, SectionHead, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";

const STEPS: [string, string][] = [
  ["Explore", "Try two or three roles. Talk to a senior about what the work is really like."],
  ["Build", "Pick a direction and build one real project. Start a daily practice habit."],
  ["Land the internship", "Practise for specific companies and get mock interviews before applications open."],
  ["Crack placements", "Mock interviews every week until placement day. Fix your weakest skill first."],
];

function YearCard({ year }: { year: number }) {
  const at = Math.min(Math.max(year, 1), 4) - 1;
  const [focus, text] = STEPS[at];
  return (
    <div className="year-card">
      <div className="year-copy">
        <div className="year-kicker">Year {year} · This year</div>
        <div className="year-title">{focus}</div>
        <p className="year-text">{text}</p>
      </div>
      <ol className="year-track" aria-label="Your four-year path">
        {STEPS.map(([name], i) => (
          <li key={name} className={i < at ? "done" : i === at ? "now" : ""}>
            <span className="bar" />
            <span className="yr">Year {i + 1}</span>
            <span className="nm">{name}</span>
          </li>))}
      </ol>
    </div>
  );
}

function NextSession({ s }: { s: SessionWithPeople }) {
  return (
    <div className="card next-card">
      <div className="next-main">
      <DateTile iso={s.starts_at} dark />
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="t-label">Up next</div>
        <div className="next-title truncate">{s.topic || "Session"}</div>
        <div className="row g-2 mt-2 t-small fg-2" style={{ minWidth: 0 }}>
          <Avatar name={s.other_name} size={22} />
          <span className="truncate"><span className="strong">{s.other_name}</span><span className="muted"> · {relDay(s.starts_at)}, {time(s.starts_at)}</span></span>
        </div>
      </div>
      </div>
      <div className="next-action">
        {s.meet_link
          ? <a href={s.meet_link} target="_blank" rel="noreferrer" className="btn"><Icon name="video" />Join call</a>
          : <span className="badge outline"><Icon name="video" size={12} />Link coming</span>}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { sb, profile } = await requireMe({ role: "learner" });
  const sp = await searchParams;
  const [credits, sessions, practices] = await Promise.all([
    myCredits(sb), mySessions(sb, profile),
    sb.from("practices").select("id, status").eq("learner_id", profile.id),
  ]);
  const upcoming = sessions.filter((s) => s.status === "confirmed" && new Date(s.ends_at) > new Date());
  const [next, ...later] = upcoming;
  const graded = (practices.data ?? []).filter((p) => p.status === "graded").length;
  const first = profile.full_name.split(" ")[0] || "there";
  return (<>
    {sp.welcome && <Alert ok={`Welcome to Calport, ${first}. You have ${credits.balance} free sessions to start.`} />}
    {!profile.profile_completed_at && <Alert error="Finish your profile so your friends' invites and your path work properly." />}
    <PageHeader eyebrow={profile.target_role} title={`Hi ${first}`}
      actions={<Link href="/mentors" className="btn">Book a mentor</Link>} />

    <YearCard year={profile.year ?? 1} />

    <div className="cols cols-3 mt-4">
      <Stat icon="calendar" href="/mentors" label="Free sessions left" value={credits.balance}
        foot={`With free mentors or up to ₹${credits.price_cap}`} />
      <Stat icon="gift" href="/invite" label="Friends who joined" value={credits.referral_credits_earned} suffix={`/ ${credits.referral_credits_max}`}
        meter={{ value: credits.referral_credits_earned, max: credits.referral_credits_max }}
        foot={credits.referral_credits_earned < credits.referral_credits_max ? `${credits.referral_credits_max - credits.referral_credits_earned} more free sessions to earn` : "You've earned them all"} />
      <Stat icon="target" href="/practice" label="Practices graded" value={graded}
        foot={graded ? "Practise for any role or company" : "Your first one helps the friend who invited you"} />
    </div>

    <section className="section">
      <SectionHead title="Upcoming sessions" action={upcoming.length > 0 && <Link href="/sessions" className="btn ghost sm flush-r">View all</Link>} />
      {next ? (
        <div className="stack g-3">
          <NextSession s={next} />
          {later.length > 0 && (
            <div className="list">{later.slice(0, 3).map((s) => (
              <Link key={s.id} href="/sessions" className="list-row row-link">
                <DateTile iso={s.starts_at} />
                <div className="list-main"><div className="title truncate">{s.topic || "Session"}</div>
                  <div className="sub truncate">{s.other_name} · {relDay(s.starts_at)}, {time(s.starts_at)}</div></div>
                <Icon name="chevronRight" className="faint shrink-0" />
              </Link>))}
            </div>)}
        </div>
      ) : <Empty icon="calendar" title="No sessions booked yet" text="Book a mock interview or a career chat with a senior." action={{ href: "/mentors", label: "Find a mentor" }} />}
    </section>
  </>);
}
