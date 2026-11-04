import Link from "next/link";
import { message } from "@/lib/format";
import { Alert } from "@/components/ui";
import { AuthFrame } from "@/components/AuthFrame";
import { signUp } from "../auth/actions";

export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string; role?: string; ref?: string }> }) {
  const sp = await searchParams;
  const mentor = sp.role === "mentor";
  const q = (r: string) => `/signup?role=${r}${sp.ref ? `&ref=${sp.ref}` : ""}`;
  return (
    <AuthFrame other={{ text: "Have an account?", href: "/login", label: "Log in" }}>
      <h1 className="t-title">Create your account</h1>
      <p className="muted mt-1">{mentor ? "Mentor juniors from your college and beyond." : "Start preparing for your first job, from any year."}</p>
      <div className="segment mt-6" role="tablist">
        <Link href={q("learner")} className={!mentor ? "on" : ""} role="tab" aria-selected={!mentor}>I&apos;m a student</Link>
        <Link href={q("mentor")} className={mentor ? "on" : ""} role="tab" aria-selected={mentor}>I&apos;ll mentor</Link>
      </div>
      <div className="mt-6">
        <Alert error={message(sp.error)} />
        {sp.ref && !mentor && <Alert info="You were invited by a friend. They earn a free session once you finish your first practice." />}
        <form action={signUp} className="fields">
          <input type="hidden" name="role" value={mentor ? "mentor" : "learner"} />
          <input type="hidden" name="ref" value={sp.ref ?? ""} />
          <div className="field"><label htmlFor="full_name">Full name</label><input className="input lg" id="full_name" name="full_name" required autoComplete="name" /></div>
          <div className="field"><label htmlFor="email">Email</label><input className="input lg" id="email" name="email" type="email" required autoComplete="email" placeholder="you@college.ac.in" /></div>
          <div className="field"><label htmlFor="password">Password</label><input className="input lg" id="password" name="password" type="password" minLength={8} required autoComplete="new-password" /><span className="hint">At least 8 characters.</span></div>
          <button className="btn lg block mt-2">Create account</button>
        </form>
      </div>
      <p className="t-small muted mt-4" style={{ textAlign: "center" }}>By signing up you agree to our <Link href="/terms" className="link">terms</Link> and <Link href="/privacy" className="link">privacy policy</Link>.</p>
    </AuthFrame>
  );
}
