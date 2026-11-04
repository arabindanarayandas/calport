import Link from "next/link";
import { requireMe } from "@/lib/me";
import { Alert } from "@/components/ui";
import { LearnerForm, MentorForm } from "@/components/ProfileForms";
import { message } from "@/lib/format";

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { profile, mentor } = await requireMe({ allowUnonboarded: true });
  const sp = await searchParams;
  const err = sp.error === "adult" ? "Calport is open to students who are 18 or older for now." : message(sp.error);
  const isMentor = profile.role === "mentor" && mentor;
  return (
    <div className="onb">
      <div className="auth-top"><Link href="/" className="brand" style={{ padding: 0 }}><span className="brand-mark">c</span>Calport</Link>
        <form action="/auth/signout" method="post"><button className="btn ghost sm">Log out</button></form></div>
      <div className="onb-inner">
        <div style={{ padding: "32px 0 24px" }}>
          <div className="eyebrow">Takes about 2 minutes</div>
          <h1 className="t-title">{isMentor ? "Set up your mentor profile" : "Tell us about you"}</h1>
          <p className="muted mt-1">{isMentor ? "We review every mentor before they go live." : "This shapes your path. You can change it any time."}</p>
        </div>
        <Alert error={err} />
        <div className="card card-body">
          {isMentor ? <MentorForm p={profile} m={mentor} from="onboarding" /> : <LearnerForm p={profile} from="onboarding" />}
        </div>
      </div>
    </div>
  );
}
