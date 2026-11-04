"use client";
import { useState } from "react";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="row">
      <input readOnly value={link} className="mono small" style={{ flex: "1 1 240px", width: "auto" }} onFocus={(e) => e.target.select()} />
      <button type="button" className="btn" onClick={async () => { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); }}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
