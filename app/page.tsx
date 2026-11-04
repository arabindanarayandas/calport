import Link from "next/link";
import { Icon } from "@/components/Icon";

const FEATURES = [
  ["Your path, year by year", "Explore roles in first year, build skills in second, land the internship in third, crack placements in fourth."],
  ["Seniors who've done it", "Book mock interviews with placed seniors and working professionals. Your first two are free."],
  ["Bring your friends", "Every friend who joins and finishes a first practice earns you another free session, up to 10."],
];

export default function Landing() {
  return (
    <div>
      <nav className="land-nav">
        <Link href="/" className="brand" style={{ padding: 0 }}><span className="brand-mark">c</span>Calport</Link>
        <div className="row g-2"><Link href="/login" className="btn ghost sm">Log in</Link><Link href="/signup" className="btn sm">Sign up</Link></div>
      </nav>
      <section className="hero">
        <h1>Prepare for your first job from your first year.</h1>
        <p>Practise for the role you want with AI, get mock interviews from seniors who cracked it, and keep a habit going all four years.</p>
        <div className="row wrap g-3">
          <Link href="/signup" className="btn lg">I&apos;m a student <Icon name="arrowRight" /></Link>
          <Link href="/signup?role=mentor" className="btn secondary lg">I want to mentor</Link>
        </div>
      </section>
      <section className="features">
        <div className="cols cols-3">
          {FEATURES.map(([t, d], i) => (
            <div key={t} className="card feature"><div className="num">0{i + 1}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>
      <footer className="land-foot"><span>© Calport</span><span className="row g-4"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span></footer>
    </div>
  );
}
