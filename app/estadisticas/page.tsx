"use client";

import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useExpenses } from "@/hooks/useExpenses";
import { euro, filtrarPorMes, iconoCategoria } from "@/lib/helpers";

export default function EstadisticasPage() {
  const { gastos, loading } = useExpenses();
  const gastosMes = filtrarPorMes(gastos, new Date());

  const total = gastosMes.reduce((acc, g) => acc + Number(g.importe), 0);

  const porCuenta = ["Marc", "Alba", "Conjunta"].map((nombre) => ({
    nombre,
    total: gastosMes
      .filter((g) => g.pagado_por === nombre)
      .reduce((acc, g) => acc + Number(g.importe), 0),
  }));

  const categorias = Object.entries(
    gastosMes.reduce<Record<string, number>>((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.importe);
      return acc;
    }, {})
  )
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <h2 className="mb-5 text-3xl font-black">Estadísticas</h2>

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">
            Pagado por cuenta
          </p>

          <div className="space-y-3">
            {porCuenta.map((item) => (
              <StatRow
                key={item.nombre}
                nombre={item.nombre}
                valor={item.total}
                total={total}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">Categorías</p>

          {categorias.length === 0 && !loading && (
            <p className="text-sm text-slate-400">
              Todavía no hay datos este mes.
            </p>
          )}

          <div className="space-y-3">
            {categorias.map((item) => (
              <StatRow
                key={item.categoria}
                nombre={`${iconoCategoria(item.categoria)} ${item.categoria}`}
                valor={item.total}
                total={total}
              />
            ))}
          </div>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function StatRow({
  nombre,
  valor,
  total,
}: {
  nombre: string;
  valor: number;
  total: number;
}) {
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-300">{nombre}</span>
        <span className="text-sm font-black">{euro(valor)}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-slate-500">{porcentaje}% del total</p>
    </div>
  );
}