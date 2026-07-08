"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useExpenses } from "@/hooks/useExpenses";
import {
  FONDO_MENSUAL,
  calcularFondoAcumulado,
  euro,
  filtrarPorMes,
  iconoCategoria,
} from "@/lib/helpers";

export default function Home() {
  const { gastos, loading } = useExpenses();
  const [mesActivo, setMesActivo] = useState(new Date());

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

  const gastosMes = filtrarPorMes(gastos, mesActivo);

  const fondo = calcularFondoAcumulado(gastos, mesActivo);

  const totalMes = gastosMes.reduce((acc, g) => acc + Number(g.importe), 0);
  const disponible = fondo.fondoDisponible;
  const porcentaje = Math.min((totalMes / FONDO_MENSUAL) * 100, 100);

  const marc = gastosMes
    .filter((g) => g.pagado_por === "Marc")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const alba = gastosMes
    .filter((g) => g.pagado_por === "Alba")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const conjunta = gastosMes
    .filter((g) => g.pagado_por === "Conjunta")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const ultimos = gastosMes.slice(0, 5);

  return (
    <AppShell>
      <Header />

      <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

      {loading ? (
        <Card>
          <p className="text-slate-400">Cargando datos...</p>
        </Card>
      ) : (
        <>
          <section className="mb-6 rounded-[44px] bg-gradient-to-br from-emerald-300 via-emerald-400 to-lime-300 p-6 text-[#052e1f] shadow-2xl shadow-emerald-500/30">
            <p className="text-sm font-black opacity-70">Fondo del piso</p>

            <h2 className="mt-2 text-6xl font-black tracking-tight">
              {disponible >= 0
                ? euro(disponible)
                : `-${euro(Math.abs(disponible))}`}
            </h2>

            <div className="mt-7">
              <div className="mb-3 flex justify-between text-sm font-black">
                <span>Gastado este mes</span>
                <span>{euro(totalMes)}</span>
              </div>

              <div className="h-4 overflow-hidden rounded-full bg-[#052e1f]/20">
                <div
                  className="h-full rounded-full bg-[#052e1f] transition-all duration-700"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-[24px] bg-white/35 p-4">
                <p className="text-xs font-black opacity-70">Aportación mensual</p>
                <p className="mt-1 text-xl font-black">{euro(FONDO_MENSUAL)}</p>
              </div>

              <div className="rounded-[24px] bg-white/35 p-4">
                <p className="text-xs font-black opacity-70">Ahorro del mes</p>
                <p
                  className={`mt-1 text-xl font-black ${
                    fondo.ahorroMes >= 0 ? "" : "text-red-900"
                  }`}
                >
                  {fondo.ahorroMes >= 0
                    ? euro(fondo.ahorroMes)
                    : `-${euro(Math.abs(fondo.ahorroMes))}`}
                </p>
              </div>
            </div>
          </section>

          <Card className="mb-5 border-emerald-400/20 bg-emerald-400/10">
            <p className="text-sm font-black text-emerald-300">💚 Estado del fondo</p>

            <h3 className="mt-2 text-2xl font-black">
              {disponible >= 300
                ? "El fondo va muy bien."
                : disponible >= 0
                ? "El fondo empieza a estar justo."
                : "Habéis superado el fondo."}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Este mes habéis gastado {euro(totalMes)} de los {euro(FONDO_MENSUAL)}{" "}
              aportados. El saldo acumulado del fondo es de{" "}
              {disponible >= 0
                ? euro(disponible)
                : `-${euro(Math.abs(disponible))}`}.
            </p>
          </Card>

          <Card className="mb-6">
            <p className="mb-4 text-sm font-black text-slate-400">
              Reparto por cuenta
            </p>

            <AccountRow label="Marc" value={marc} total={totalMes} />
            <AccountRow label="Alba" value={alba} total={totalMes} />
            <AccountRow label="Conjunta" value={conjunta} total={totalMes} />
          </Card>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Últimos movimientos</h3>

              <Link href="/gastos" className="text-sm font-black text-emerald-300">
                Ver todo
              </Link>
            </div>

            <div className="space-y-3">
              {ultimos.length === 0 && (
                <p className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 text-slate-400">
                  Todavía no hay gastos este mes.
                </p>
              )}

              {ultimos.map((gasto) => (
                <div
                  key={gasto.id}
                  className="flex items-center justify-between gap-3 rounded-[30px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
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
        </>
      )}

      <BottomNavigation />
    </AppShell>
  );
}

function AccountRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-bold text-slate-300">{label}</span>
        <span className="text-sm font-black">{euro(value)}</span>
      </div>

      <ProgressBar value={percent} />
    </div>
  );
}