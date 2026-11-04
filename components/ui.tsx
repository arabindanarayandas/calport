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

export function Avatar({ name, size = 36, dark }: { name: string; size?: number; dark?: boolean }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return <span className={`avatar${dark ? " dark" : ""}`} style={{ "--s": `${size}px` } as React.CSSProperties} aria-hidden="true">{initials}</span>;
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

export function Stat({ label, value, suffix, foot }: { label: string; value: React.ReactNode; suffix?: string; foot?: React.ReactNode }) {
  return (
    <div className="card stat">
      <div className="t-label">{label}</div>
      <div className="t-num">{value}{suffix && <span className="muted" style={{ fontSize: 15, fontWeight: 500, letterSpacing: 0, marginLeft: 4 }}>{suffix}</span>}</div>
      {foot && <div className="stat-foot">{foot}</div>}
    </div>
  );
}

const STATUS: Record<string, [string, string]> = {
  confirmed: ["Confirmed", "ok"],
  completed: ["Completed", ""],
  cancelled: ["Cancelled", "outline"],
  no_show: ["Missed", "bad"],
  awaiting_payment: ["Awaiting payment", "warn"],
};
export function StatusBadge({ status }: { status: string }) {
  const [label, cls] = STATUS[status] ?? [status, ""];
  return <span className={`badge ${cls}`}>{cls === "ok" || cls === "warn" || cls === "bad" ? <span className="dot" /> : null}{label}</span>;
}

export function Meter({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return <div className="meter" role="progressbar" aria-valuenow={value} aria-valuemax={max}><span style={{ width: `${pct}%` }} /></div>;
}
