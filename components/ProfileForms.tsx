import type { MentorProfile, Profile } from "@/lib/me";
import { ROLES, YEARS } from "@/lib/options";
import { saveLearner, saveMentor } from "@/app/onboarding/actions";

export function LearnerForm({ p, from }: { p: Profile; from: "onboarding" | "profile" }) {
  return (
    <form action={saveLearner}>
      <input type="hidden" name="from" value={from} />
      <div className="field"><label>Full name</label><input name="full_name" defaultValue={p.full_name} required /></div>
      <div className="two">
        <div className="field"><label>College</label><input name="college" defaultValue={p.college ?? ""} placeholder="IIT Guwahati" required /></div>
        <div className="field"><label>Year</label>
          <select name="year" defaultValue={p.year ?? ""} required>
            <option value="" disabled>Pick one</option>
            {YEARS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select></div>
      </div>
      <div className="two">
        <div className="field"><label>Branch</label><input name="branch" defaultValue={p.branch ?? ""} placeholder="Computer Science" required /></div>
        <div className="field"><label>Role you&apos;re aiming for</label>
          <select name="target_role" defaultValue={p.target_role ?? ""} required>
            <option value="" disabled>Pick one</option>
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select></div>
      </div>
      <div className="field"><label>WhatsApp number (optional, for session reminders)</label><input name="phone" defaultValue={p.phone ?? ""} placeholder="+91 98xxxxxxxx" /></div>
      <div className="field"><label className="check"><input type="checkbox" name="adult" defaultChecked={p.is_adult_confirmed} required /> I confirm I am 18 or older.</label></div>
      <button className="btn">{from === "onboarding" ? "Start preparing" : "Save"}</button>
    </form>
  );
}

export function MentorForm({ p, m, from }: { p: Profile; m: MentorProfile; from: "onboarding" | "profile" }) {
  return (
    <form action={saveMentor}>
      <input type="hidden" name="from" value={from} />
      <div className="two">
        <div className="field"><label>Full name</label><input name="full_name" defaultValue={p.full_name} required /></div>
        <div className="field"><label>College you studied at</label><input name="college" defaultValue={p.college ?? ""} required /></div>
      </div>
      <div className="field"><label>One-line headline</label><input name="headline" defaultValue={m.headline ?? ""} placeholder="Ex-placement coordinator, now APM at a fintech" required /></div>
      <div className="two">
        <div className="field"><label>Company</label><input name="company" defaultValue={m.company ?? ""} required /></div>
        <div className="field"><label>Job title</label><input name="job_title" defaultValue={m.job_title ?? ""} required /></div>
      </div>
      <div className="two">
        <div className="field"><label>Years of work experience</label><input name="experience_years" type="number" min={0} max={40} defaultValue={m.experience_years ?? 0} /></div>
        <div className="field"><label>LinkedIn URL</label><input name="linkedin_url" type="url" defaultValue={m.linkedin_url ?? ""} placeholder="https://linkedin.com/in/…" /></div>
      </div>
      <div className="field"><label>What you can help with (comma separated)</label><input name="expertise" defaultValue={m.expertise.join(", ")} placeholder="Product sense, Resume review, SQL" /></div>
      <div className="field"><label>About you</label><textarea name="bio" defaultValue={m.bio ?? ""} placeholder="Your background in your own words. Don't promise insider questions — share your experience." /></div>
      <div className="two">
        <div className="field"><label>Your price per session after your first 2 (₹)</label><input name="price_inr" type="number" min={0} step={1} defaultValue={m.price_inr} /><p className="muted small" style={{ marginTop: 6 }}>Put 0 to always stay free. Students can use their free sessions with you if you charge ₹999 or less.</p></div>
        <div className="field"><label>Max sessions per week</label><input name="weekly_limit" type="number" min={1} max={20} defaultValue={m.weekly_limit} /></div>
      </div>
      <div className="field"><label>WhatsApp number (optional)</label><input name="phone" defaultValue={p.phone ?? ""} /></div>
      <div className="card soft small" style={{ marginBottom: 16 }}>
        <strong>How you earn.</strong> Your first 2 sessions are free. After that, Calport keeps 25% of your price for paid sessions 1–10, 20% for 11–20, and 10% from then on.
      </div>
      <button className="btn">{from === "onboarding" ? "Submit for review" : "Save"}</button>
    </form>
  );
}
