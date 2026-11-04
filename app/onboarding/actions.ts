"use server";
import { redirect } from "next/navigation";
import { requireMe } from "@/lib/me";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

export async function saveLearner(form: FormData) {
  const { sb, profile } = await requireMe({ allowUnonboarded: true });
  const back = form.get("from") === "profile" ? "/profile" : "/onboarding";
  if (form.get("adult") !== "on") redirect(`${back}?error=adult`);
  const { error } = await sb.from("profiles").update({
    full_name: s(form, "full_name"), college: s(form, "college"), year: Number(s(form, "year")) || null,
    branch: s(form, "branch"), target_role: s(form, "target_role"), phone: s(form, "phone") || null,
    is_adult_confirmed: true, onboarded: true,
  }).eq("id", profile.id);
  if (error) redirect(`${back}?error=unknown`);
  redirect(back === "/profile" ? "/profile?ok=saved" : "/home?welcome=1");
}

export async function saveMentor(form: FormData) {
  const { sb, profile } = await requireMe({ allowUnonboarded: true });
  const back = form.get("from") === "profile" ? "/profile" : "/onboarding";
  const price = Math.max(0, Math.round(Number(s(form, "price_inr")) || 0));
  const weekly = Math.min(20, Math.max(1, Math.round(Number(s(form, "weekly_limit")) || 3)));
  const p1 = await sb.from("profiles").update({
    full_name: s(form, "full_name"), college: s(form, "college"), phone: s(form, "phone") || null, onboarded: true,
  }).eq("id", profile.id);
  const p2 = await sb.from("mentor_profiles").update({
    headline: s(form, "headline"), company: s(form, "company"), job_title: s(form, "job_title"),
    experience_years: Number(s(form, "experience_years")) || 0, bio: s(form, "bio"),
    expertise: s(form, "expertise").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8),
    linkedin_url: s(form, "linkedin_url") || null, price_inr: price, weekly_limit: weekly,
  }).eq("id", profile.id);
  if (p1.error || p2.error) redirect(`${back}?error=unknown`);
  redirect(back === "/profile" ? "/profile?ok=saved" : "/mentor?welcome=1");
}
