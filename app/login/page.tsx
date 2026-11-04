import Link from "next/link";
import { message } from "@/lib/format";
import { Alert } from "@/components/Shell";
import { logIn } from "../auth/actions";

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string; ok?: string; next?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="auth"><div className="auth-box">
      <Link href="/" className="brand" style={{ display: "block", padding: "0 0 24px" }}>Calport</Link>
      <div className="tabs"><Link href="/login" className="on">Log in</Link><Link href="/signup">Create account</Link></div>
      <Alert error={message(sp.error)} ok={message(sp.ok)} />
      <form action={logIn}>
        <input type="hidden" name="next" value={sp.next ?? ""} />
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
        <button className="btn" style={{ width: "100%" }}>Log in</button>
      </form>
    </div></div>
  );
}
