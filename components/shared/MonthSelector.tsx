"use client";

import { nombreMes } from "@/lib/helpers";

type Props = {
  mesActivo: Date;
  onChange: (offset: number) => void;
};

export function MonthSelector({ mesActivo, onChange }: Props) {
  return (
    <section className="mb-5 flex items-center justify-between rounded-[26px] border border-white/10 bg-white/[0.06] p-3">
      <button
        onClick={() => onChange(-1)}
        className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl active:scale-95"
      >
        ‹
      </button>

      <div className="text-center">
        <p className="text-xs font-bold text-slate-400">Mes activo</p>
        <p className="text-lg font-black capitalize">{nombreMes(mesActivo)}</p>
      </div>

      <button
        onClick={() => onChange(1)}
        className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl active:scale-95"
      >
        ›
      </button>
    </section>
  );
}