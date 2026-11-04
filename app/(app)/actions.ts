"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireMe } from "@/lib/me";
import { errorCode } from "@/lib/format";

export async function bookSlot(form: FormData) {
  const { sb } = await requireMe({ role: "learner" });
  const mentorId = String(form.get("mentor_id"));
  const { data, error } = await sb.rpc("book_session", {
    p_slot: String(form.get("slot_id")),
    p_use_credit: form.get("pay") !== "paid",
    p_topic: String(form.get("topic") ?? "").slice(0, 300) || null,
  });
  if (error) redirect(`/mentors/${mentorId}?error=${errorCode(error)}`);
  revalidatePath("/sessions");
  redirect(`/sessions?ok=${data?.status === "awaiting_payment" ? "awaiting_payment" : "booked"}`);
}

export async function cancelSession(form: FormData) {
  const { sb } = await requireMe();
  const { error } = await sb.rpc("cancel_session", { p_session: String(form.get("session_id")) });
  if (error) redirect(`/sessions?error=${errorCode(error)}`);
  revalidatePath("/sessions");
  redirect("/sessions?ok=cancelled");
}

export async function markSession(form: FormData) {
  const { sb } = await requireMe({ role: "mentor" });
  const { error } = await sb.rpc("mark_session", {
    p_session: String(form.get("session_id")), p_outcome: String(form.get("outcome")),
  });
  if (error) redirect(`/sessions?error=${errorCode(error)}`);
  redirect("/sessions?ok=marked");
}

export async function setMeetLink(form: FormData) {
  const { sb } = await requireMe({ role: "mentor" });
  const { error } = await sb.rpc("set_meet_link", {
    p_session: String(form.get("session_id")), p_link: String(form.get("link") ?? "").trim(),
  });
  if (error) redirect(`/sessions?error=${errorCode(error)}`);
  redirect("/sessions?ok=link");
}

export async function addSlots(form: FormData) {
  const { sb, profile } = await requireMe({ role: "mentor" });
  const date = String(form.get("date"));              // yyyy-mm-dd (IST)
  const times = form.getAll("time").map(String).filter(Boolean);
  const mins = Math.min(90, Math.max(30, Number(form.get("minutes")) || 45));
  const repeat = Math.min(8, Math.max(1, Number(form.get("weeks")) || 1));
  const rows = [];
  for (let w = 0; w < repeat; w++) {
    for (const t of times) {
      const start = new Date(`${date}T${t}:00+05:30`);
      start.setUTCDate(start.getUTCDate() + 7 * w);
      if (isNaN(start.getTime()) || start.getTime() < Date.now()) continue;
      rows.push({ mentor_id: profile.id, starts_at: start.toISOString(), ends_at: new Date(start.getTime() + mins * 60000).toISOString() });
    }
  }
  if (!rows.length) redirect("/mentor/availability?error=no_slots");
  const { error } = await sb.from("availability").insert(rows);
  if (error) redirect("/mentor/availability?error=unknown");
  redirect(`/mentor/availability?ok=added&n=${rows.length}`);
}

export async function removeSlot(form: FormData) {
  const { sb } = await requireMe({ role: "mentor" });
  await sb.from("availability").delete().eq("id", String(form.get("slot_id"))).eq("booked", false);
  redirect("/mentor/availability?ok=removed");
}

export async function submitScorecard(form: FormData) {
  const { sb } = await requireMe({ role: "mentor" });
  const id = String(form.get("session_id"));
  const skills = form.getAll("skill").map((name, i) => ({
    skill: String(name), score: Number(form.get(`score-${name}`)), note: String(form.getAll("note")[i] ?? ""),
  }));
  const { error } = await sb.rpc("submit_scorecard", {
    p_session: id, p_skills: skills,
    p_strengths: String(form.get("strengths") ?? ""), p_improve: String(form.get("improve") ?? ""),
  });
  if (error) redirect(`/mentor/score/${id}?error=${errorCode(error)}`);
  redirect("/sessions?ok=scored");
}
