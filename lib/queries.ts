import type { SupabaseClient } from "@supabase/supabase-js";

export type Session = {
  id: string; learner_id: string; mentor_id: string; starts_at: string; ends_at: string; topic: string | null;
  status: string; kind: string; credit_used: boolean; price_inr: number; commission_pct: number;
  mentor_payout_inr: number; calport_pays_inr: number; meet_link: string | null;
};
export type SessionWithPeople = Session & { other_name: string; other_sub: string; scored: boolean };

export type Credits = {
  balance: number; referrals_qualified: number; referrals_pending: number;
  referral_credits_earned: number; referral_credits_max: number; budget_open: boolean; price_cap: number;
};

export async function myCredits(sb: SupabaseClient): Promise<Credits> {
  const { data } = await sb.rpc("my_credits");
  return data as Credits;
}

/** Sessions for the signed-in person, with the other person's name filled in. */
export async function mySessions(sb: SupabaseClient, me: { id: string; role: string }): Promise<SessionWithPeople[]> {
  const col = me.role === "mentor" ? "mentor_id" : "learner_id";
  const { data: rows } = await sb.from("sessions").select("*").eq(col, me.id).order("starts_at", { ascending: true });
  const sessions = (rows ?? []) as Session[];
  if (!sessions.length) return [];
  const { data: cards } = await sb.from("scorecards").select("session_id").in("session_id", sessions.map((s) => s.id));
  const scored = new Set((cards ?? []).map((c) => c.session_id));
  const names = new Map<string, [string, string]>();
  if (me.role === "mentor") {
    const ids = [...new Set(sessions.map((s) => s.learner_id))];
    const { data } = await sb.from("profiles").select("id, full_name, college, year, target_role").in("id", ids);
    (data ?? []).forEach((p) => names.set(p.id, [p.full_name, [p.college, p.year ? `Year ${p.year}` : null, p.target_role].filter(Boolean).join(" · ")]));
  } else {
    const ids = [...new Set(sessions.map((s) => s.mentor_id))];
    const { data } = await sb.from("mentor_directory").select("id, full_name, job_title, company").in("id", ids);
    (data ?? []).forEach((p) => names.set(p.id, [p.full_name, [p.job_title, p.company].filter(Boolean).join(" at ")]));
  }
  return sessions.map((s) => {
    const [n, sub] = names.get(me.role === "mentor" ? s.learner_id : s.mentor_id) ?? ["Unknown", ""];
    return { ...s, other_name: n, other_sub: sub, scored: scored.has(s.id) };
  });
}

export type MentorCard = {
  id: string; full_name: string; college: string | null; tier: string; headline: string | null; company: string | null;
  job_title: string | null; experience_years: number | null; bio: string | null; expertise: string[];
  linkedin_url: string | null; price_inr: number; current_price_inr: number; free_sessions_done: number;
  sessions_completed: number; students_mentored: number;
};
