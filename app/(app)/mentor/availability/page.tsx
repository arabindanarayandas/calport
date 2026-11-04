import { requireMe } from "@/lib/me";
import { Alert, Empty, PageHeader, SectionHead } from "@/components/ui";
import { dayKey, relDay, time } from "@/lib/format";
import { addSlots, removeSlot } from "../../actions";
import { Icon } from "@/components/Icon";

const TIMES = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
const label = (t: string) => { const h = Number(t.slice(0, 2)); return `${h % 12 || 12} ${h < 12 ? "am" : "pm"}`; };
type Slot = { id: string; starts_at: string; ends_at: string; booked: boolean };

export default async function Availability({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; n?: string }> }) {
  const { sb, profile } = await requireMe({ role: "mentor" });
  const sp = await searchParams;
  const { data } = await sb.from("availability").select("*").eq("mentor_id", profile.id)
    .gte("starts_at", new Date().toISOString()).order("starts_at").limit(100);
  const slots = (data ?? []) as Slot[];
  const byDay = new Map<string, Slot[]>();
  slots.forEach((s) => { const k = dayKey(s.starts_at); byDay.set(k, [...(byDay.get(k) ?? []), s]); });
  const today = dayKey(new Date().toISOString());
  const ok = sp.ok === "added" ? `Added ${sp.n} slot${sp.n === "1" ? "" : "s"}.` : sp.ok === "removed" ? "Slot removed." : null;
  return (<>
    <PageHeader title="Availability" description="Add times students can book. All times are India time." />
    <Alert error={sp.error === "no_slots" ? "Pick a future date and at least one time." : sp.error ? "Something went wrong. Please try again." : null} ok={ok} />

    <form action={addSlots} className="card">
      <div className="card-head"><h2 className="t-section">Add slots</h2></div>
      <div className="card-body fields">
        <div className="avail-top">
          <div className="field"><label htmlFor="date">Date</label><input className="input" type="date" id="date" name="date" min={today} defaultValue={today} required /></div>
          <div className="field"><label htmlFor="minutes">Length</label><select className="select" id="minutes" name="minutes" defaultValue="45"><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div>
          <div className="field"><label htmlFor="weeks">Repeat</label><select className="select" id="weeks" name="weeks" defaultValue="1">{[1,2,3,4,6,8].map((w) => <option key={w} value={w}>{w === 1 ? "Just this day" : `Weekly for ${w} weeks`}</option>)}</select></div>
        </div>
        <div className="field">
          <span className="label">Start times</span>
          <div className="chip-grid time-grid">{TIMES.map((t) => (
            <label key={t} className="chip"><input type="checkbox" name="time" value={t} />{label(t)}</label>))}</div>
        </div>
      </div>
      <div className="card-foot"><button className="btn"><Icon name="plus" />Add slots</button></div>
    </form>

    <section className="section">
      <SectionHead title="Your upcoming slots" action={<span className="t-small muted">{slots.filter((s) => !s.booked).length} open · {slots.filter((s) => s.booked).length} booked</span>} />
      {slots.length ? <div className="list">{[...byDay.entries()].map(([k, list]) => (
        <div key={k} className="list-row top day-row">
          <div className="day-label">{relDay(list[0].starts_at)}</div>
          <div className="chips grow">{list.map((s) => s.booked ? (
            <span key={s.id} className="slot booked" title="Booked">{time(s.starts_at)}<span className="t-small">Booked</span></span>
          ) : (
            <form key={s.id} action={removeSlot} className="slot">
              <input type="hidden" name="slot_id" value={s.id} />{time(s.starts_at)}
              <button aria-label={`Remove ${time(s.starts_at)}`} title="Remove"><Icon name="x" size={14} /></button>
            </form>))}</div>
        </div>))}</div>
        : <Empty icon="clock" title="No slots yet" text="Add a few times above so students can book you." />}
    </section>
  </>);
}
