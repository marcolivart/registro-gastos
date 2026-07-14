import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#02060b] text-white">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(6,95,70,.55),_#030712_42%)] px-5 pb-32 pt-[max(24px,env(safe-area-inset-top))]">
        <div className="pointer-events-none absolute -left-24 top-12 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-72 h-56 w-56 rounded-full bg-lime-400/5 blur-3xl" />
        <div className="relative z-10">{children}</div>
      </div>
    </main>
  );
}
