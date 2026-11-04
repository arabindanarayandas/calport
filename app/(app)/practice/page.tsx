import { requireMe } from "@/lib/me";
import { Empty, PageHeader } from "@/components/ui";

export default async function Practice() {
  await requireMe({ role: "learner" });
  return (<>
    <PageHeader title="Practice" description="Paste a job description, and Calport researches the company, builds a plan and gives you a graded practice round." />
    <Empty icon="target" title="AI practice is switching on soon" text="You'll be able to practise for any role and company, and get a scorecard on every answer." />
  </>);
}
