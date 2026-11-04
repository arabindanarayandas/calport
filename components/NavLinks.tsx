"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";

export type NavItem = { href: string; label: string; short: string; icon: IconName; exact?: boolean };

export function NavLinks({ items, variant }: { items: NavItem[]; variant: "side" | "tabs" }) {
  const path = usePathname();
  const active = (i: NavItem) => path === i.href || (!i.exact && path.startsWith(i.href + "/")) ||
    (i.href === "/sessions" && (path.startsWith("/scorecards") || path.startsWith("/mentor/score")));
  if (variant === "tabs") {
    return (
      <nav className="tabbar" aria-label="Main">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className={`tab${active(i) ? " on" : ""}`} aria-current={active(i) ? "page" : undefined}>
            <Icon name={i.icon} size={20} />{i.short}
          </Link>))}
      </nav>
    );
  }
  return (
    <nav className="nav" aria-label="Main">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={`nav-item${active(i) ? " on" : ""}`} aria-current={active(i) ? "page" : undefined}>
          <Icon name={i.icon} />{i.label}
        </Link>))}
    </nav>
  );
}
