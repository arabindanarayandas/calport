import { requireMe } from "@/lib/me";
import { myCredits } from "@/lib/queries";
import { CopyLink } from "@/components/CopyLink";
import { Meter, PageHeader, Stat } from "@/components/ui";
import { Icon } from "@/components/Icon";

const STEPS = [
  ["Share your link", "Send it to friends and juniors on WhatsApp or anywhere else."],
  ["They finish a first practice", "They sign up, complete their profile and finish one practice."],
  ["You get a free session", "One per friend, up to 10. Use it for a mock interview."],
];

export default async function Invite() {
  const { sb, profile } = await requireMe({ role: "learner" });
  const c = await myCredits(sb);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calport.ai";
  const link = `${site}/signup?ref=${profile.referral_code}`;
  const left = c.referral_credits_max - c.referral_credits_earned;
  const wa = `https://wa.me/?text=${encodeURIComponent(`I'm preparing for placements on Calport — AI practice plus mock interviews with seniors. Sign up with my link: ${link}`)}`;
  return (<>
    <PageHeader title="Invite friends" description={`Each friend who completes their profile and finishes a first practice earns you one free session, up to ${c.referral_credits_max}.`} />
    <div className="card">
      <div className="card-body">
        <label className="label" htmlFor="ref-link">Your invite link</label>
        <div className="mt-2"><CopyLink link={link} /></div>
      </div>
      <div className="card-foot" style={{ justifyContent: "space-between" }}>
        <span className="t-small muted">Your code <span className="mono" style={{ color: "var(--fg)" }}>{profile.referral_code}</span></span>
        <a href={wa} target="_blank" rel="noreferrer" className="btn secondary sm"><Icon name="share" />Share on WhatsApp</a>
      </div>
    </div>

    <div className="cols cols-3 mt-4">
      <Stat label="Free sessions earned" value={c.referral_credits_earned} suffix={`/ ${c.referral_credits_max}`} foot={<Meter value={c.referral_credits_earned} max={c.referral_credits_max} />} />
      <Stat label="Friends still to finish" value={c.referrals_pending} foot="They count once they finish their first practice." />
      <Stat label="Left to earn" value={left} foot={left === 0 ? "You've hit the maximum. Thank you!" : "Keep sharing to earn more."} />
    </div>

    <section className="section">
      <h2 className="t-section" style={{ marginBottom: 12 }}>How it works</h2>
      <div className="cols cols-3">
        {STEPS.map(([t, d], i) => (
          <div key={t} className="card card-pad"><span className="step-num">{i + 1}</span><div className="strong mt-3">{t}</div><p className="t-small muted mt-1">{d}</p></div>
        ))}
      </div>
    </section>
  </>);
}
