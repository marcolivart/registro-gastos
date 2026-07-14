import { ReactNode } from "react";

export function MetricCard({
  icon,
  label,
  value,
  detail,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10 ${className}`}
    >
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
      {detail && <div className="mt-3">{detail}</div>}
    </div>
  );
}
