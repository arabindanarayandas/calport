import { requireMe } from "@/lib/me";
import { Alert } from "@/components/Shell";
import { day, time } from "@/lib/format";
import { addSlots, removeSlot } from "../../actions";

const TIMES = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];

export default async function Availability({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string; n?: string }> }) {
  const { sb, profile } = await requireMe({ role: "mentor" });
  const sp = await searchParams;
  const { data: slots } = await sb.from("availability").select("*").eq("mentor_id", profile.id)
    .gte("starts_at", new Date().toISOString()).order("starts_at").limit(100);
  const today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10);
  const ok = sp.ok === "added" ? `Added ${sp.n} slot${sp.n === "1" ? "" : "s"}.` : sp.ok === "removed" ? "Slot removed." : null;
  return (<>
    <div className="head"><h1>Availability</h1><p className="muted">Add times students can book. All times are India time.</p></div>
    <Alert error={sp.error === "no_slots" ? "Pick a future date and at least one time." : sp.error ? "Something went wrong." : null} ok={ok} />
    <form action={addSlots} className="card" style={{ marginBottom: 20 }}>
      <div className="two">
        <div className="field"><label>Date</label><input type="date" name="date" min={today} defaultValue={today} required /></div>
        <div className="two">
          <div className="field"><label>Length</label><select name="minutes" defaultValue="45"><option value="30">30 min</option><option value="45">45 min</option><option value="60">60 min</option></select></div>
          <div className="field"><label>Repeat weekly</label><select name="weeks" defaultValue="1">{[1,2,3,4,6,8].map((w) => <option key={w} value={w}>{w === 1 ? "Just this day" : `${w} weeks`}</option>)}</select></div>
        </div>
      </div>
      <label>Start times</label>
      <div className="row" style={{ marginBottom: 14 }}>{TIMES.map((t) => (
        <label key={t} className="check pill" style={{ margin: 0, padding: "4px 10px" }}><input type="checkbox" name="time" value={t} style={{ marginTop: 2 }} />{t}</label>))}</div>
      <button className="btn">Add slots</button>
    </form>
    <h2>Your upcoming slots</h2>
    {slots?.length ? <div className="list">{slots.map((s) => (
      <div key={s.id} className="row between"><div>{day(s.starts_at)}, {time(s.starts_at)}–{time(s.ends_at)}</div>
        {s.booked ? <span className="pill dark">Booked</span> :
          <form action={removeSlot}><input type="hidden" name="slot_id" value={s.id} /><button className="btn ghost sm">Remove</button></form>}
      </div>))}</div> : <div className="empty">No slots yet. Add a few above.</div>}
  </>);
}
