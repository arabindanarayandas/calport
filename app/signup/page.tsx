import Link from "next/link";
import { message } from "@/lib/format";
import { Alert } from "@/components/Shell";
import { signUp } from "../auth/actions";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string; role?: string; ref?: string }> }) {
  const sp = await searchParams;
  const mentor = sp.role === "mentor";
  const q = (r: string) => `/signup?role=${r}${sp.ref ? `&ref=${sp.ref}` : ""}`;
  return (
    <div className="auth"><div className="auth-box">
      <Link href="/" className="brand" style={{ display: "block", padding: "0 0 24px" }}>Calport</Link>
      <div className="tabs"><Link href="/login">Log in</Link><Link href="/signup" className="on">Create account</Link></div>
      <div className="tabs">
        <Link href={q("learner")} className={!mentor ? "on" : ""}>I&apos;m a student</Link>
        <Link href={q("mentor")} className={mentor ? "on" : ""}>I&apos;ll mentor</Link>
      </div>
      <Alert error={message(sp.error)} />
      {sp.ref && !mentor && <div className="alert">You were invited by a friend. They earn a free session once you finish your first practice.</div>}
      <form action={signUp}>
        <input type="hidden" name="role" value={mentor ? "mentor" : "learner"} />
        <input type="hidden" name="ref" value={sp.ref ?? ""} />
        <div className="field"><label htmlFor="full_name">Full name</label><input id="full_name" name="full_name" required autoComplete="name" /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
        <button className="btn" style={{ width: "100%" }}>Create account</button>
        <p className="muted small" style={{ marginTop: 12 }}>By signing up you agree to our <Link href="/terms">terms</Link> and <Link href="/privacy">privacy policy</Link>.</p>
      </form>
    </div></div>
  );
}
