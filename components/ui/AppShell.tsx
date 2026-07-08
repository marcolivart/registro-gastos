import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[radial-gradient(circle_at_top,_#064e3b,_#030712_45%)] px-5 pb-28 pt-7">
        {children}
      </div>
    </main>
  );
}