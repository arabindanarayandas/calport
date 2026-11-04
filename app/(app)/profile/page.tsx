import { requireMe } from "@/lib/me";
import { Alert } from "@/components/Shell";
import { LearnerForm, MentorForm } from "@/components/ProfileForms";
import { message } from "@/lib/format";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const { profile, mentor, user } = await requireMe();
  const sp = await searchParams;
  return (<>
    <div className="head"><h1>Profile</h1><p className="muted">{user.email}</p></div>
    {mentor && !mentor.approved && <Alert error="Your profile is under review. Students will see you once we approve it — usually within a day." />}
    <Alert error={sp.error === "adult" ? "Calport is open to students who are 18 or older for now." : message(sp.error)} ok={sp.ok ? "Saved." : null} />
    <div className="card">
      {mentor ? <MentorForm p={profile} m={mentor} from="profile" /> : <LearnerForm p={profile} from="profile" />}
    </div>
  </>);
}
