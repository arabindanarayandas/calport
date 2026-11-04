import { requireMe } from "@/lib/me";
import { Alert } from "@/components/Shell";
import { LearnerForm, MentorForm } from "@/components/ProfileForms";
import { message } from "@/lib/format";

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { profile, mentor } = await requireMe({ allowUnonboarded: true });
  const sp = await searchParams;
  const err = sp.error === "adult" ? "Calport is open to students who are 18 or older for now." : message(sp.error);
  return (
    <div className="auth" style={{ placeItems: "start center" }}><div style={{ width: "100%", maxWidth: 620, paddingTop: 32 }}>
      <div className="brand" style={{ padding: "0 0 24px" }}>Calport</div>
      {profile.role === "mentor" && mentor ? (<>
        <h1>Set up your mentor profile</h1>
        <p className="muted">Students see this when they choose who to book. We review every mentor before they go live.</p>
        <Alert error={err} />
        <MentorForm p={profile} m={mentor} from="onboarding" />
      </>) : (<>
        <h1>Tell us about you</h1>
        <p className="muted">This shapes your path. You can change it any time.</p>
        <Alert error={err} />
        <LearnerForm p={profile} from="onboarding" />
      </>)}
    </div></div>
  );
}
