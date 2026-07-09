import Link from "next/link";
import { Movimiento } from "@/types/expense";
import { euro, iconoCategoria } from "@/lib/helpers";

type Props = {
  gastos: Movimiento[];
};

export function RecentExpenses({ gastos }: Props) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-black">Últimos movimientos</h3>

        <Link href="/movimientos" className="text-sm font-black text-emerald-300">
          Ver todo
        </Link>
      </div>

      <div className="space-y-3">
        {gastos.length === 0 && (
          <p className="rounded-[28px] border border-white/10 bg-white/[0.05] p-5 text-slate-400">
            Todavía no hay movimientos este mes.
          </p>
        )}

        {gastos.map((movimiento) => (
          <div
            key={movimiento.id}
            className="flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/15 text-xl">
                {iconoCategoria(movimiento.categoria)}
              </div>

              <div>
                <p className="font-black">{movimiento.descripcion}</p>
                <p className="text-sm text-slate-400">
                  {movimiento.categoria} · {movimiento.persona}
                </p>
              </div>
            </div>

            <strong
              className={
                movimiento.tipo === "ingreso" ? "text-emerald-300" : "text-white"
              }
            >
              {movimiento.tipo === "ingreso" ? "+" : "-"}
              {euro(Number(movimiento.importe))}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}