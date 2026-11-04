import Link from "next/link";

export function AuthFrame({ children, other }: { children: React.ReactNode; other: { text: string; href: string; label: string } }) {
  return (
    <div className="auth">
      <div className="auth-top">
        <Link href="/" className="brand" style={{ padding: 0 }}><span className="brand-mark">c</span>Calport</Link>
        <div className="row g-2 t-small"><span className="muted">{other.text}</span><Link href={other.href} className="btn secondary sm">{other.label}</Link></div>
      </div>
      <div className="auth-mid"><div className="auth-card">{children}</div></div>
      <div className="auth-foot"><Link href="/terms" className="link">Terms</Link> · <Link href="/privacy" className="link">Privacy</Link></div>
    </div>
  );
}
