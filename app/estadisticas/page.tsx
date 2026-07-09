"use client";

import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  euro,
  filtrarPorMes,
  iconoCategoria,
  totalGastos,
  totalIngresos,
} from "@/lib/helpers";

export default function EstadisticasPage() {
  const { movimientos, loading } = useMovimientos();

  const movimientosMes = filtrarPorMes(movimientos, new Date());

  const gastosMes = movimientosMes.filter((m) => m.tipo === "gasto");
  const ingresosMes = movimientosMes.filter((m) => m.tipo === "ingreso");

  const totalGastado = totalGastos(movimientosMes);
  const totalIngresado = totalIngresos(movimientosMes);
  const balance = totalIngresado - totalGastado;

  const porPersona = ["Marc", "Alba", "Conjunta"].map((nombre) => ({
    nombre,
    total: movimientosMes
      .filter((m) => m.persona === nombre)
      .reduce((acc, m) => acc + Number(m.importe), 0),
  }));

  const categorias = Object.entries(
    gastosMes.reduce<Record<string, number>>((acc, m) => {
      acc[m.categoria] = (acc[m.categoria] || 0) + Number(m.importe);
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
            Resumen del mes
          </p>

          <div className="space-y-3">
            <StatLine label="Ingresos" value={totalIngresado} positive />
            <StatLine label="Gastos" value={totalGastado} />
            <StatLine label="Balance" value={balance} positive={balance >= 0} />
          </div>
        </section>

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">
            Movimientos por persona
          </p>

          <div className="space-y-3">
            {porPersona.map((item) => (
              <StatRow
                key={item.nombre}
                nombre={item.nombre}
                valor={item.total}
                total={totalIngresado + totalGastado}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">
            Gastos por categoría
          </p>

          {categorias.length === 0 && !loading && (
            <p className="text-sm text-slate-400">
              Todavía no hay gastos este mes.
            </p>
          )}

          <div className="space-y-3">
            {categorias.map((item) => (
              <StatRow
                key={item.categoria}
                nombre={`${iconoCategoria(item.categoria)} ${item.categoria}`}
                valor={item.total}
                total={totalGastado}
              />
            ))}
          </div>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}

function StatLine({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <strong className={positive ? "text-emerald-300" : "text-white"}>
        {value >= 0 ? euro(value) : `-${euro(Math.abs(value))}`}
      </strong>
    </div>
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