import type { MentorProfile, Profile } from "@/lib/me";
import { ROLES, YEARS } from "@/lib/options";
import { saveLearner, saveMentor } from "@/app/onboarding/actions";

function Section({ title, text, children }: { title: string; text?: string; children: React.ReactNode }) {
  return (
    <div className="form-section">
      <div><h3>{title}</h3>{text && <p>{text}</p>}</div>
      <div className="fields">{children}</div>
    </div>
  );
}

export function LearnerForm({ p, from }: { p: Profile; from: "onboarding" | "profile" }) {
  return (
    <form action={saveLearner}>
      <input type="hidden" name="from" value={from} />
      <Section title="About you" text="Mentors see your name when you book.">
        <div className="field"><label htmlFor="full_name">Full name</label><input className="input" id="full_name" name="full_name" defaultValue={p.full_name} required /></div>
      </Section>
      <Section title="Your studies" text="This shapes your path and what you practise.">
        <div className="fields-2">
          <div className="field"><label htmlFor="college">College</label><input className="input" id="college" name="college" defaultValue={p.college ?? ""} placeholder="IIT Guwahati" required /></div>
          <div className="field"><label htmlFor="year">Year</label>
            <select className="select" id="year" name="year" defaultValue={p.year ?? ""} required>
              <option value="" disabled>Pick one</option>
              {YEARS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select></div>
        </div>
        <div className="fields-2">
          <div className="field"><label htmlFor="branch">Branch</label><input className="input" id="branch" name="branch" defaultValue={p.branch ?? ""} placeholder="Computer Science" required /></div>
          <div className="field"><label htmlFor="target_role">Role you&apos;re aiming for</label>
            <select className="select" id="target_role" name="target_role" defaultValue={p.target_role ?? ""} required>
              <option value="" disabled>Pick one</option>
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select></div>
        </div>
      </Section>
      <Section title="Reminders" text="We'll only message you about your sessions.">
        <div className="field"><label htmlFor="phone">WhatsApp number <span className="opt">(optional)</span></label><input className="input" id="phone" name="phone" type="tel" defaultValue={p.phone ?? ""} placeholder="+91 98xxx xxxxx" /></div>
      </Section>
      <Section title="Age">
        <label className="checkbox"><input type="checkbox" name="adult" defaultChecked={p.is_adult_confirmed} required />I confirm I am 18 or older.</label>
      </Section>
      <div className="form-actions"><button className="btn">{from === "onboarding" ? "Start preparing" : "Save changes"}</button></div>
    </form>
  );
}

export function MentorForm({ p, m, from }: { p: Profile; m: MentorProfile; from: "onboarding" | "profile" }) {
  return (
    <form action={saveMentor}>
      <input type="hidden" name="from" value={from} />
      <Section title="About you" text="Students see this when they choose who to book.">
        <div className="fields-2">
          <div className="field"><label htmlFor="full_name">Full name</label><input className="input" id="full_name" name="full_name" defaultValue={p.full_name} required /></div>
          <div className="field"><label htmlFor="college">College you studied at</label><input className="input" id="college" name="college" defaultValue={p.college ?? ""} required /></div>
        </div>
        <div className="field"><label htmlFor="headline">One-line headline</label><input className="input" id="headline" name="headline" defaultValue={m.headline ?? ""} placeholder="Ex-placement coordinator, now APM at a fintech" required /></div>
        <div className="field"><label htmlFor="bio">About you</label><textarea className="textarea" id="bio" name="bio" defaultValue={m.bio ?? ""} placeholder="Your background in your own words." />
          <span className="hint">Don&apos;t promise insider questions — share your experience.</span></div>
      </Section>
      <Section title="Your work">
        <div className="fields-2">
          <div className="field"><label htmlFor="company">Company</label><input className="input" id="company" name="company" defaultValue={m.company ?? ""} required /></div>
          <div className="field"><label htmlFor="job_title">Job title</label><input className="input" id="job_title" name="job_title" defaultValue={m.job_title ?? ""} required /></div>
        </div>
        <div className="fields-2">
          <div className="field"><label htmlFor="experience_years">Years of work experience</label><input className="input" id="experience_years" name="experience_years" type="number" min={0} max={40} defaultValue={m.experience_years ?? 0} /></div>
          <div className="field"><label htmlFor="linkedin_url">LinkedIn URL</label><input className="input" id="linkedin_url" name="linkedin_url" type="url" defaultValue={m.linkedin_url ?? ""} placeholder="https://linkedin.com/in/…" /></div>
        </div>
        <div className="field"><label htmlFor="expertise">What you can help with</label><input className="input" id="expertise" name="expertise" defaultValue={m.expertise.join(", ")} placeholder="Product sense, Resume review, SQL" />
          <span className="hint">Separate with commas. Up to 8.</span></div>
      </Section>
      <Section title="Sessions and pricing" text="Your first 2 sessions are free. After that you charge your price.">
        <div className="fields-2">
          <div className="field"><label htmlFor="price_inr">Price per session</label>
            <div className="prefix"><span>₹</span><input className="input" id="price_inr" name="price_inr" type="number" min={0} step={1} defaultValue={m.price_inr} /></div>
            <span className="hint">Put 0 to always stay free.</span></div>
          <div className="field"><label htmlFor="weekly_limit">Max sessions per week</label><input className="input" id="weekly_limit" name="weekly_limit" type="number" min={1} max={20} defaultValue={m.weekly_limit} /></div>
        </div>
        <div className="panel t-small fg-2">
          <div className="strong" style={{ color: "var(--fg)" }}>How you earn</div>
          <dl style={{ margin: "8px 0 0" }}>
            <div className="kv"><dt>Paid sessions 1–10</dt><dd>Calport keeps 25%</dd></div>
            <div className="kv"><dt>Paid sessions 11–20</dt><dd>Calport keeps 20%</dd></div>
            <div className="kv"><dt>From then on</dt><dd>Calport keeps 10%</dd></div>
          </dl>
          <p className="muted" style={{ marginTop: 8 }}>Students can use their free sessions with you if you charge ₹999 or less.</p>
        </div>
      </Section>
      <Section title="Reminders">
        <div className="field"><label htmlFor="phone">WhatsApp number <span className="opt">(optional)</span></label><input className="input" id="phone" name="phone" type="tel" defaultValue={p.phone ?? ""} /></div>
      </Section>
      <div className="form-actions"><button className="btn">{from === "onboarding" ? "Submit for review" : "Save changes"}</button></div>
    </form>
  );
}
