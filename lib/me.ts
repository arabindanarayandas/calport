import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export type Profile = {
  id: string; role: "learner" | "mentor" | "admin"; full_name: string; college: string | null;
  year: number | null; branch: string | null; target_role: string | null; phone: string | null;
  referral_code: string; onboarded: boolean; profile_completed_at: string | null;
  is_adult_confirmed: boolean; blocked_until: string | null;
};
export type MentorProfile = {
  id: string; tier: "senior" | "expert"; headline: string | null; company: string | null;
  job_title: string | null; experience_years: number | null; bio: string | null; expertise: string[];
  linkedin_url: string | null; price_inr: number; weekly_limit: number; approved: boolean;
};

/** The signed-in person, or a redirect to log in. Sends un-onboarded people to onboarding. */
export async function requireMe(opts: { allowUnonboarded?: boolean; role?: "learner" | "mentor" } = {}) {
  const sb = await supabaseServer();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("*").eq("id", auth.user.id).single<Profile>();
  if (!profile) redirect("/login?error=no_profile");
  if (!profile.onboarded && !opts.allowUnonboarded) redirect("/onboarding");
  let mentor: MentorProfile | null = null;
  if (profile.role === "mentor") {
    const { data } = await sb.from("mentor_profiles").select("*").eq("id", profile.id).single<MentorProfile>();
    mentor = data;
  }
  if (opts.role && profile.role !== opts.role) redirect(profile.role === "mentor" ? "/mentor" : "/home");
  return { sb, user: auth.user, profile, mentor };
}
