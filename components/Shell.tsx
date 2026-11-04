import Link from "next/link";
import { NavLinks, type NavItem } from "./NavLinks";
import { Avatar } from "./ui";
import { Icon } from "./Icon";

export { Alert } from "./ui";

const LEARNER: NavItem[] = [
  { href: "/home", label: "Home", short: "Home", icon: "home" },
  { href: "/practice", label: "Practice", short: "Practice", icon: "target" },
  { href: "/mentors", label: "Mentors", short: "Mentors", icon: "users" },
  { href: "/sessions", label: "Sessions", short: "Sessions", icon: "calendar" },
  { href: "/invite", label: "Invite friends", short: "Invite", icon: "gift" },
  { href: "/profile", label: "Profile", short: "Profile", icon: "user" },
];
const MENTOR: NavItem[] = [
  { href: "/mentor", label: "Dashboard", short: "Home", icon: "grid", exact: true },
  { href: "/mentor/availability", label: "Availability", short: "Slots", icon: "clock" },
  { href: "/sessions", label: "Sessions", short: "Sessions", icon: "calendar" },
  { href: "/mentor/earnings", label: "Earnings", short: "Earnings", icon: "wallet" },
  { href: "/profile", label: "Profile", short: "Profile", icon: "user" },
];

function Brand({ href }: { href: string }) {
  return <Link href={href} className="brand"><span className="brand-mark">c</span>Calport</Link>;
}

function LogOut({ withLabel }: { withLabel?: boolean }) {
  return (
    <form action="/auth/signout" method="post">
      <button className={withLabel ? "btn ghost sm" : "btn ghost icon sm"} aria-label="Log out" title="Log out">
        <Icon name="logout" />{withLabel && "Log out"}
      </button>
    </form>
  );
}

export function Shell({ role, name, children }: { role: string; name: string; children: React.ReactNode }) {
  const items = role === "mentor" ? MENTOR : LEARNER;
  const home = role === "mentor" ? "/mentor" : "/home";
  return (
    <div className="shell">
      <aside className="side">
        <Brand href={home} />
        <NavLinks items={items} variant="side" />
        <div className="side-foot">
          <Avatar name={name || "You"} size={32} />
          <div className="who"><div className="truncate strong">{name || "You"}</div><div className="muted">{role === "mentor" ? "Mentor" : "Student"}</div></div>
          <LogOut />
        </div>
      </aside>
      <header className="topbar">
        <Brand href={home} />
        <div className="row g-1"><Avatar name={name || "You"} size={28} /><LogOut /></div>
      </header>
      <main className="main"><div className="main-inner">{children}</div></main>
      <NavLinks items={items} variant="tabs" />
    </div>
  );
}
