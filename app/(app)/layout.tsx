import { requireMe } from "@/lib/me";
import { Shell } from "@/components/Shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireMe();
  return <Shell role={profile.role} name={profile.full_name}>{children}</Shell>;
}
