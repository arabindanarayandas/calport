import Link from "next/link";

export default function Landing() {
  return (
    <div className="land">
      <div className="land-nav">
        <strong style={{ fontSize: 18, letterSpacing: "-0.02em" }}>Calport</strong>
        <div className="row"><Link href="/login" className="btn ghost sm">Log in</Link><Link href="/signup" className="btn sm">Sign up</Link></div>
      </div>
      <section className="hero">
        <h1>Prepare for your first job from your first year.</h1>
        <p>Practise for the role you want with AI, get mock interviews from seniors who cracked it, and keep a habit going all four years.</p>
        <div className="row">
          <Link href="/signup" className="btn">I&apos;m a student</Link>
          <Link href="/signup?role=mentor" className="btn ghost">I want to mentor</Link>
        </div>
      </section>
      <section className="grid" style={{ marginTop: 72 }}>
        <div className="card"><h3>Your path, year by year</h3><p className="muted small">Explore roles in first year, build skills in second, land the internship in third, crack placements in fourth.</p></div>
        <div className="card"><h3>Seniors who&apos;ve done it</h3><p className="muted small">Book mock interviews with placed seniors and working professionals. Your first two are free.</p></div>
        <div className="card"><h3>Bring your friends</h3><p className="muted small">Every friend who joins and finishes a first practice earns you another free session, up to 10.</p></div>
      </section>
      <p className="muted small" style={{ marginTop: 64 }}><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></p>
    </div>
  );
}
