"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items }: { items: string[][] }) {
  const path = usePathname();
  return (
    <nav className="nav">
      {items.map(([href, label]) => {
        const on = path === href || (href !== "/mentor" && path.startsWith(href + "/"));
        return <Link key={href} href={href} className={on ? "on" : ""}>{label}</Link>;
      })}
    </nav>
  );
}
