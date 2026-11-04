import Link from "next/link";
import { message } from "@/lib/format";
import { Alert } from "@/components/ui";
import { AuthFrame } from "@/components/AuthFrame";
import { logIn } from "../auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthFrame other={{ text: "New to Calport?", href: "/signup", label: "Create account" }}>
      <h1 className="t-title">Log in</h1>
      <p className="muted mt-1">Welcome back. Pick up where you left off.</p>
      <div className="mt-6">
        <Alert error={message(sp.error)} ok={message(sp.ok)} />
        <form action={logIn} className="fields">
          <input type="hidden" name="next" value={sp.next ?? ""} />
          <div className="field"><label htmlFor="email">Email</label><input className="input lg" id="email" name="email" type="email" required autoComplete="email" placeholder="you@college.ac.in" /></div>
          <div className="field"><label htmlFor="password">Password</label><input className="input lg" id="password" name="password" type="password" required autoComplete="current-password" /></div>
          <button className="btn lg block mt-2">Log in</button>
        </form>
      </div>
      <p className="t-small muted mt-6" style={{ textAlign: "center" }}>Don&apos;t have an account? <Link href="/signup" className="link" style={{ color: "var(--fg)" }}>Sign up</Link></p>
    </AuthFrame>
  );
}
