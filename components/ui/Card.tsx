import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[32px] border border-white/10 bg-white/[0.065] p-5 shadow-xl shadow-black/20 backdrop-blur-xl ${className}`}
    >
      {children}
    </section>
  );
}
