"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

export async function signUp(form: FormData) {
  const role = form.get("role") === "mentor" ? "mentor" : "learner";
  const ref = String(form.get("ref") ?? "").trim();
  const back = `/signup?role=${role}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`;
  const password = String(form.get("password") ?? "");
  if (password.length < 8) redirect(`${back}&error=weak_password`);

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    password,
    options: {
      data: { role, full_name: String(form.get("full_name") ?? "").trim(), ref: role === "learner" ? ref : "" },
      emailRedirectTo: `${await siteUrl()}/auth/callback`,
    },
  });
  if (error) redirect(`${back}&error=${error.code ?? "unknown"}`);
  if (data.user && data.user.identities?.length === 0) redirect(`${back}&error=user_already_exists`);
  if (!data.session) redirect("/login?ok=check_email");
  redirect("/onboarding");
}

export async function logIn(form: FormData) {
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim().toLowerCase(),
    password: String(form.get("password") ?? ""),
  });
  if (error) redirect(`/login?error=${error.code ?? "invalid_credentials"}`);
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/home");
}
