import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

export function DeltaBadge({
  diferencia,
  porcentaje,
  invertido = false,
}: {
  diferencia: number;
  porcentaje: number;
  invertido?: boolean;
}) {
  const estable = Math.abs(diferencia) < 0.005;
  const mejora = invertido ? diferencia < 0 : diferencia > 0;

  const clases = estable
    ? "bg-white/10 text-slate-300"
    : mejora
      ? "bg-emerald-400/15 text-emerald-300"
      : "bg-rose-400/15 text-rose-300";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${clases}`}
    >
      {estable ? (
        <ArrowRight size={13} />
      ) : diferencia > 0 ? (
        <ArrowUpRight size={13} />
      ) : (
        <ArrowDownRight size={13} />
      )}
      {estable ? "Sin cambios" : `${Math.abs(porcentaje).toFixed(0)}%`}
    </span>
  );
}
