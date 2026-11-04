"use client";
// A GET form that re-submits itself when a select or checkbox changes, so filters apply instantly.
export function AutoForm({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <form className={className} onChange={(e) => {
      const t = e.target as unknown as HTMLInputElement;
      if (t.tagName === "SELECT" || t.type === "checkbox") (e.currentTarget as HTMLFormElement).requestSubmit();
    }}>{children}</form>
  );
}
