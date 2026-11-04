import Link from "next/link";

export default function Privacy() {
  return (<>
    <nav className="land-nav"><Link href="/" className="brand" style={{ padding: 0 }}><span className="brand-mark">c</span>Calport</Link></nav>
    <article className="doc"><h1 className="t-title">Privacy policy</h1><p className="muted" style={{ marginTop: 8 }}>Draft — to be replaced with a lawyer-reviewed policy before launch.</p>
      <p>Calport stores your name, email, college, year, branch, target role, optional phone number, your practice answers and scores, and your session history. We use this to run the service: matching you with mentors, grading practice, and sending reminders. We don&apos;t sell your data. Mentors see only what they need for a session you booked with them. To delete your account and data, email us.</p></article>
  </>);
}
