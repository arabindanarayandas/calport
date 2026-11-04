import { requireMe } from "@/lib/me";
import { myCredits } from "@/lib/queries";
import { CopyLink } from "@/components/CopyLink";

export default async function Invite() {
  const { sb, profile } = await requireMe({ role: "learner" });
  const c = await myCredits(sb);
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calport.ai";
  const link = `${site}/signup?ref=${profile.referral_code}`;
  const left = c.referral_credits_max - c.referral_credits_earned;
  const wa = `https://wa.me/?text=${encodeURIComponent(`I'm preparing for placements on Calport — AI practice plus mock interviews with seniors. Sign up with my link: ${link}`)}`;
  return (<>
    <div className="head"><h1>Invite friends</h1><p className="muted">Each friend who completes their profile and finishes a first practice earns you one free session, up to {c.referral_credits_max}.</p></div>
    <div className="card" style={{ marginBottom: 14 }}>
      <label>Your link</label>
      <CopyLink link={link} />
      <a href={wa} target="_blank" rel="noreferrer" className="btn ghost" style={{ marginTop: 10 }}>Share on WhatsApp</a>
    </div>
    <div className="grid">
      <div className="card"><div className="muted small">Free sessions earned</div><div className="big">{c.referral_credits_earned} / {c.referral_credits_max}</div>
        <div className="meter" style={{ marginTop: 8 }}><span style={{ width: `${(c.referral_credits_earned / c.referral_credits_max) * 100}%` }} /></div></div>
      <div className="card"><div className="muted small">Friends still to finish</div><div className="big">{c.referrals_pending}</div><p className="muted small">They count once they finish their first practice.</p></div>
      <div className="card"><div className="muted small">Left to earn</div><div className="big">{left}</div>{left === 0 && <p className="muted small">You&apos;ve hit the maximum. Thank you!</p>}</div>
    </div>
  </>);
}
