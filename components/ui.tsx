import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export function PageHeader({ title, description, eyebrow, actions }: {
  title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <header className="page-head">
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="t-title">{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="row g-2 shrink-0">{actions}</div>}
    </header>
  );
}

export function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return <div className="section-head"><h2 className="t-section">{title}</h2>{action}</div>;
}

export function Alert({ error, ok, info }: { error?: string | null; ok?: string | null; info?: string | null }) {
  const [kind, text, icon]: [string, string | null | undefined, IconName] =
    error ? ["bad", error, "alert"] : ok ? ["ok", ok, "checkCircle"] : ["", info, "info"];
  if (!text) return null;
  return (
    <div className={`alert ${kind}`} role={error ? "alert" : "status"}>
      <Icon name={icon} /><div className="grow">{text}</div>
    </div>
  );
}

const PASTELS = ["p-blue", "p-green", "p-yellow", "p-purple", "p-peach", "p-pink", "p-teal"];
/** Picks the same soft colour for the same text every time. */
export function pastelFor(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PASTELS[h % PASTELS.length];
}

export function Avatar({ name, size = 36, dark }: { name: string; size?: number; dark?: boolean }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return <span className={`avatar ${dark ? "dark" : pastelFor(name)}`} style={{ "--s": `${size}px` } as React.CSSProperties} aria-hidden="true">{initials}</span>;
}

/** Soft coloured label, as in the reference design. */
export function Tag({ children, tone = "grey" }: { children: React.ReactNode; tone?: "grey" | "blue" | "green" | "yellow" | "purple" | "peach" | "pink" | "teal" }) {
  return <span className={`tag p-${tone}`}>{children}</span>;
}

/** Table with a soft header row. cols: [label, CSS width, class]; children are <Row>s. */
export function Table({ cols, children, empty }: { cols: [string, string, string?][]; children?: React.ReactNode; empty?: React.ReactNode }) {
  const has = Array.isArray(children) ? children.filter(Boolean).length > 0 : Boolean(children);
  return (
    <div className="dt" style={{ "--cols": cols.map((c) => c[1]).join(" ") } as React.CSSProperties}>
      <div className="dt-h">{cols.map(([label, , cls], i) => <div key={i} className={cls}>{label}</div>)}</div>
      {has ? children : <div className="dt-empty">{empty ?? "Nothing here yet."}</div>}
    </div>
  );
}
export function Row({ cells, cols, sub, mine }: { cells: React.ReactNode[]; cols: [string, string, string?][]; sub?: React.ReactNode; mine?: boolean }) {
  return (
    <div className={`dt-r${mine ? " mine" : ""}`}>
      {cells.map((c, i) => <div key={i} className={cols[i]?.[2]}>{c}</div>)}
      {sub && <div className="dt-sub">{sub}</div>}
    </div>
  );
}
export function Who({ name, sub, href }: { name: string; sub?: React.ReactNode; href?: string }) {
  const inner = (<><Avatar name={name} size={32} /><span style={{ minWidth: 0 }}><b className="truncate" style={{ display: "block" }}>{name}</b>{sub && <small className="truncate" style={{ display: "block" }}>{sub}</small>}</span></>);
  return href ? <Link href={href} className="dt-who">{inner}</Link> : <div className="dt-who">{inner}</div>;
}

/** Tabs that are plain links, so the page stays server-rendered. */
export function Tabs({ items }: { items: { href: string; label: string; count?: number | string; on: boolean }[] }) {
  return (
    <nav className="tabs-soft" aria-label="Filter">
      {items.map((t) => <Link key={t.href} href={t.href} className={t.on ? "on" : ""} aria-current={t.on ? "page" : undefined}>{t.label}{t.count !== undefined && <span className="n">{t.count}</span>}</Link>)}
    </nav>
  );
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text?: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} /></div>
      <div className="t-body">{title}</div>
      {text && <p className="muted">{text}</p>}
      {action && <Link href={action.href} className="btn secondary sm">{action.label}</Link>}
    </div>
  );
}

export function Stat({ label, value, suffix, foot, icon, href, meter }: {
  label: string; value: React.ReactNode; suffix?: string; foot?: React.ReactNode;
  icon?: IconName; href?: string; meter?: { value: number; max: number };
}) {
  const body = (<>
    {icon && <span className="icon-tile stat-icon"><Icon name={icon} /></span>}
    {href && <span className="stat-go" aria-hidden="true"><Icon name="arrowRight" size={14} /></span>}
    <div className="stat-value">{value}{suffix && <span className="stat-suffix">{suffix}</span>}</div>
    <div className="stat-label">{label}</div>
    {(meter || foot) && (
      <div className="stat-foot">
        {meter && <Meter value={meter.value} max={meter.max} />}
        {foot && <div className={meter ? "mt-2" : ""}>{foot}</div>}
      </div>)}
  </>);
  return href ? <Link href={href} className="card stat stat-link">{body}</Link> : <div className="card stat">{body}</div>;
}

/** Small calendar tile: month above day number. */
export function DateTile({ iso, dark }: { iso: string; dark?: boolean }) {
  const d = new Date(new Date(iso).getTime() + 5.5 * 3600e3);
  const month = d.toLocaleString("en-IN", { month: "short", timeZone: "UTC" });
  return (
    <span className={`date-tile${dark ? " dark" : ""}`} aria-hidden="true">
      <span className="m">{month}</span><span className="d">{d.getUTCDate()}</span>
    </span>
  );
}

const STATUS: Record<string, [string, "blue" | "green" | "grey" | "pink" | "yellow"]> = {
  confirmed: ["Confirmed", "blue"],
  completed: ["Completed", "green"],
  cancelled: ["Cancelled", "grey"],
  no_show: ["Missed", "pink"],
  awaiting_payment: ["Awaiting payment", "yellow"],
};
export function StatusBadge({ status }: { status: string }) {
  const [label, tone] = STATUS[status] ?? [status, "grey"];
  return <Tag tone={tone}>{label}</Tag>;
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return <div className="meter" role="progressbar" aria-valuenow={value} aria-valuemax={max}><span style={{ width: `${pct}%` }} /></div>;
}
