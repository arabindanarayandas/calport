import Link from "next/link";

export default function Terms() {
  return (<>
    <nav className="land-nav"><Link href="/" className="brand" style={{ padding: 0 }}><span className="brand-mark">c</span>Calport</Link></nav>
    <article className="doc"><h1 className="t-title">Terms</h1><p className="muted" style={{ marginTop: 8 }}>Draft — to be replaced with lawyer-reviewed terms before launch.</p>
      <p>Calport is for students aged 18 and over. Mentors share their own experience and must not share confidential interview material from any employer. Free sessions are subject to the limits shown in the app. Missing two booked sessions pauses booking for 7 days.</p></article>
  </>);
}
