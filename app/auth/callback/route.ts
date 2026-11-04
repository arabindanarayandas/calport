import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Where the "confirm your email" link lands.
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sb = await supabaseServer();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  let ok = false;
  if (code) ok = !(await sb.auth.exchangeCodeForSession(code)).error;
  else if (tokenHash && type) ok = !(await sb.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  return NextResponse.redirect(new URL(ok ? "/onboarding" : "/login?error=email_not_confirmed", url.origin));
}
