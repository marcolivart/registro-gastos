"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { nombreMes } from "@/lib/helpers";

type Props = {
  mesActivo: Date;
  onChange: (offset: number) => void;
};

export function MonthSelector({ mesActivo, onChange }: Props) {
  return (
    <section className="mb-5 flex items-center justify-between rounded-[25px] border border-white/10 bg-white/[0.06] p-2.5 shadow-lg shadow-black/10 backdrop-blur">
      <button
        onClick={() => onChange(-1)}
        aria-label="Mes anterior"
        className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.08] text-slate-300 active:scale-95"
      >
        <ChevronLeft size={21} />
      </button>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
          Mes activo
        </p>
        <p className="mt-0.5 text-base font-black capitalize">{nombreMes(mesActivo)}</p>
      </div>

      <button
        onClick={() => onChange(1)}
        aria-label="Mes siguiente"
        className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.08] text-slate-300 active:scale-95"
      >
        <ChevronRight size={21} />
      </button>
    </section>
  );
}
