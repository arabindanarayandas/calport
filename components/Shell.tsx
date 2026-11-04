import Link from "next/link";
import { NavLinks } from "./NavLinks";

const LEARNER = [
  ["/home", "Home"], ["/practice", "Practice"], ["/mentors", "Mentors"],
  ["/sessions", "Sessions"], ["/invite", "Invite friends"], ["/profile", "Profile"],
];
const MENTOR = [
  ["/mentor", "Dashboard"], ["/mentor/availability", "Availability"], ["/sessions", "Sessions"],
  ["/mentor/earnings", "Earnings"], ["/profile", "Profile"],
];

export function Shell({ role, name, children }: { role: string; name: string; children: React.ReactNode }) {
  const items = role === "mentor" ? MENTOR : LEARNER;
  return (
    <div className="shell">
      <aside className="side">
        <Link href={role === "mentor" ? "/mentor" : "/home"} className="brand">Calport</Link>
        <NavLinks items={items} />
        <div className="side-foot">
          <div>{name || "You"}</div>
          <form action="/auth/signout" method="post"><button className="btn ghost sm" style={{ marginTop: 8 }}>Log out</button></form>
        </div>
      </aside>
      <main className="main"><div className="main-inner">{children}</div></main>
    </div>
  );
}

export function Alert({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) return <div className="alert bad" role="alert">{error}</div>;
  if (ok) return <div className="alert ok" role="status">{ok}</div>;
  return null;
}
