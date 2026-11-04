const TZ = "Asia/Kolkata";

export const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
  });

export const day = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { timeZone: TZ, weekday: "short", day: "numeric", month: "short" });

export const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

/** Turns a database error code into something a student can understand. */
const MESSAGES: Record<string, string> = {
  not_signed_in: "Please log in again.",
  learners_only: "Only learners can book sessions.",
  finish_onboarding: "Finish setting up your profile first.",
  blocked_no_shows: "You missed two sessions, so booking is paused for 7 days.",
  slot_not_found: "That slot no longer exists.",
  slot_taken: "Someone just booked that slot. Pick another one.",
  slot_too_soon: "Slots must be booked at least 2 hours ahead.",
  mentor_not_approved: "This mentor isn't live yet.",
  already_booked_this_mentor: "You already have an upcoming session with this mentor.",
  mentor_week_full: "This mentor is full for that week. Try another week.",
  no_free_sessions_left: "You've used your free sessions. Refer a friend to earn more.",
  mentor_above_free_cap: "Free sessions work with mentors charging ₹999 or less.",
  budget_used_up: "This month's free sessions with paid mentors are used up. Free mentors are still open, or try again on the 1st.",
  session_not_found: "That session doesn't exist.",
  not_your_session: "That isn't your session.",
  cannot_cancel: "This session can't be cancelled now.",
  already_marked: "You've already marked this session.",
  session_not_started: "You can do this once the session has started.",
  bad_scores: "Give every skill a score from 1 to 4.",
  bad_link: "The link should start with https://",
  invalid_credentials: "Wrong email or password.",
  email_not_confirmed: "Confirm your email first. Check your inbox for our link.",
  user_already_exists: "An account with this email already exists. Log in instead.",
  weak_password: "Use at least 8 characters for your password.",
  check_email: "Check your inbox and click the link to confirm your email.",
  no_profile: "Something went wrong with your account. Contact us.",
};

export function errorCode(e: unknown): string {
  const msg = (e as { message?: string; code?: string })?.message ?? String(e);
  const code = (e as { code?: string })?.code;
  if (code && MESSAGES[code]) return code;
  const found = Object.keys(MESSAGES).find((k) => msg.includes(k));
  return found ?? "unknown";
}
export const message = (code?: string | null) =>
  code ? MESSAGES[code] ?? "Something went wrong. Please try again." : null;
