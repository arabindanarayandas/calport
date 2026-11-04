// One small icon set, drawn on a 24px grid with a 1.75 stroke so every icon has the same weight.
const P: Record<string, React.ReactNode> = {
  home: <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.25v-6h-5.5v6H5A1.5 1.5 0 0 1 3.5 19z" />,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.75" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.75 20c.7-3.5 3.2-5.5 6.25-5.5s5.55 2 6.25 5.5" /><path d="M15.5 4.7a3.5 3.5 0 0 1 0 6.6" /><path d="M18 14.9c1.7.8 2.8 2.5 3.25 5.1" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M3.5 9.75h17M8 3v4M16 3v4" /></>,
  gift: <><rect x="3.5" y="8" width="17" height="4" rx="1" /><path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7M12 8v12.5" /><path d="M12 8S10.6 3.75 8.25 3.75a2.125 2.125 0 0 0 0 4.25M12 8s1.4-4.25 3.75-4.25a2.125 2.125 0 0 1 0 4.25" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.9-3.7 3.9-5.75 7.5-5.75s6.6 2.05 7.5 5.75" /></>,
  grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  wallet: <><rect x="3.5" y="5.5" width="17" height="14" rx="2" /><path d="M3.5 9.5h17M15.5 14.5h2" /></>,
  logout: <path d="M14.5 4h3A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-3M10 16.5 14.5 12 10 7.5M14.5 12H4.5" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  checkCircle: <><circle cx="12" cy="12" r="8.5" /><path d="m8.25 12.25 2.5 2.5 5-5.25" /></>,
  alert: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.75v5M12 16.25h.01" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 7.75h.01" /></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M17 13.5v4.5A1.5 1.5 0 0 1 15.5 19.5h-9A1.5 1.5 0 0 1 5 18V8.5A1.5 1.5 0 0 1 6.5 7H11" />,
  copy: <><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2" /><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></>,
  video: <><rect x="3" y="6.5" width="13" height="11" rx="2" /><path d="m16 10.5 5-3v9l-5-3" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></>,
  chevronRight: <path d="m9.5 6 6 6-6 6" />,
  x: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  sparkle: <path d="M12 3.5c.5 4.2 2.3 6 6.5 6.5-4.2.5-6 2.3-6.5 6.5-.5-4.2-2.3-6-6.5-6.5 4.2-.5 6-2.3 6.5-6.5zM18.5 15.5c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5z" />,
  share: <><circle cx="17.5" cy="5.5" r="2.5" /><circle cx="6.5" cy="12" r="2.5" /><circle cx="17.5" cy="18.5" r="2.5" /><path d="m8.7 10.8 6.6-4M8.7 13.2l6.6 4" /></>,
  star: <path d="m12 3.75 2.5 5.2 5.7.75-4.15 3.95 1.05 5.65L12 16.55 6.9 19.3l1.05-5.65L3.8 9.7l5.7-.75z" />,
  linkedin: <><rect x="3.5" y="3.5" width="17" height="17" rx="3" /><path d="M8 10.5v6M8 7.5h.01M12 16.5v-3.5a2.5 2.5 0 0 1 5 0v3.5M12 10.5v6" /></>,
};

export type IconName = keyof typeof P;

export function Icon({ name, size, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size ?? 16} height={size ?? 16} fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      {P[name]}
    </svg>
  );
}
