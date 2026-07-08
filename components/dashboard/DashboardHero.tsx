import { Home, Wallet } from "lucide-react";
import { euro, FONDO_COMUN } from "@/lib/helpers";

type Props = {
  total: number;
  disponible: number;
  porcentaje: number;
};

export function DashboardHero({ total, disponible, porcentaje }: Props) {
  return (
    <section className="mb-5 overflow-hidden rounded-[42px] bg-gradient-to-br from-emerald-300 via-emerald-400 to-lime-300 p-6 text-[#06110c] shadow-2xl shadow-emerald-500/25">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Home size={20} strokeWidth={3} />
            <p className="text-sm font-black opacity-70">Nuestro Piso</p>
          </div>

          <p className="text-sm font-black opacity-70">Fondo común</p>

          <h2 className="mt-2 text-5xl font-black tracking-tight">
            {euro(FONDO_COMUN)}
          </h2>
        </div>

        <div className="grid h-13 w-13 place-items-center rounded-[22px] bg-[#06110c]/10">
          <Wallet size={28} strokeWidth={3} />
        </div>
      </div>

      <div className="mt-7 rounded-[30px] bg-white/35 p-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-black">Gastado</span>
          <span className="text-sm font-black">{euro(total)}</span>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-[#06110c]/15">
          <div
            className="h-full rounded-full bg-[#06110c] transition-all duration-700"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="mt-5">
          <p className="text-sm font-black opacity-70">
            {disponible >= 0 ? "Disponible" : "Fondo superado"}
          </p>
          <p className="text-3xl font-black">
            {disponible >= 0
              ? euro(disponible)
              : `${euro(Math.abs(disponible))} extra`}
          </p>
        </div>
      </div>
    </section>
  );
}