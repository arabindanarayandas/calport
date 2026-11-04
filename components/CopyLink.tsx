"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="row g-2">
      <input id="ref-link" readOnly value={link} className="input mono grow" onFocus={(e) => e.target.select()} />
      <button type="button" className="btn shrink-0" style={{ minWidth: 96 }} onClick={async () => {
        try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
      }}>
        <Icon name={copied ? "check" : "copy"} />{copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
