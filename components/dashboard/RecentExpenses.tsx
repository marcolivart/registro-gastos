import Link from "next/link";
import { Gasto } from "@/types/expense";
import { euro, iconoCategoria } from "@/lib/helpers";

type Props = {
  gastos: Gasto[];
};

export function RecentExpenses({ gastos }: Props) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black">Últimos movimientos</h3>

        <Link href="/gastos" className="text-sm font-black text-emerald-300">
          Ver todo
        </Link>
      </div>

      <div className="space-y-3">
        {gastos.length === 0 && (
          <p className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 text-slate-400">
            Todavía no hay gastos este mes.
          </p>
        )}

        {gastos.map((gasto) => (
          <div
            key={gasto.id}
            className="flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-xl">
                {iconoCategoria(gasto.categoria)}
              </div>

              <div>
                <p className="font-black">{gasto.descripcion}</p>
                <p className="text-sm text-slate-400">
                  {gasto.categoria} · {gasto.pagado_por}
                </p>
              </div>
            </div>

            <strong>{euro(Number(gasto.importe))}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}