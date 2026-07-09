"use client";

import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  FONDO_MENSUAL,
  calcularSaldoHastaMes,
  euro,
  filtrarPorMes,
  iconoCategoria,
  totalGastos,
  totalIngresos,
} from "@/lib/helpers";

export default function Home() {
  const { movimientos, loading } = useMovimientos();
  const [mesActivo, setMesActivo] = useState(new Date());

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

  const movimientosMes = filtrarPorMes(movimientos, mesActivo);

  const gastoMes = totalGastos(movimientosMes);
  const ingresoMes = totalIngresos(movimientosMes);
  const saldoFondo = calcularSaldoHastaMes(movimientos, mesActivo);

  const porcentaje = Math.min((gastoMes / FONDO_MENSUAL) * 100, 100);

  const marc = movimientosMes
    .filter((m) => m.persona === "Marc")
    .reduce((acc, m) => acc + Number(m.importe), 0);

  const alba = movimientosMes
    .filter((m) => m.persona === "Alba")
    .reduce((acc, m) => acc + Number(m.importe), 0);

  const conjunta = movimientosMes
    .filter((m) => m.persona === "Conjunta")
    .reduce((acc, m) => acc + Number(m.importe), 0);

  const ultimos = movimientosMes.slice(0, 5);

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
            <p className="text-sm font-black opacity-70">Saldo del fondo</p>

            <h2 className="mt-2 text-6xl font-black tracking-tight">
              {saldoFondo >= 0
                ? euro(saldoFondo)
                : `-${euro(Math.abs(saldoFondo))}`}
            </h2>

            <div className="mt-7">
              <div className="mb-3 flex justify-between text-sm font-black">
                <span>Gastado este mes</span>
                <span>{euro(gastoMes)}</span>
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
                <p className="text-xs font-black opacity-70">
                  Ingresado este mes
                </p>
                <p className="mt-1 text-xl font-black">{euro(ingresoMes)}</p>
              </div>

              <div className="rounded-[24px] bg-white/35 p-4">
                <p className="text-xs font-black opacity-70">Balance del mes</p>
                <p className="mt-1 text-xl font-black">
                  {euro(ingresoMes - gastoMes)}
                </p>
              </div>
            </div>
          </section>

          <Card className="mb-5 border-emerald-400/20 bg-emerald-400/10">
            <p className="text-sm font-black text-emerald-300">
              💚 Estado del fondo
            </p>

            <h3 className="mt-2 text-2xl font-black">
              {saldoFondo >= 300
                ? "El fondo va muy bien."
                : saldoFondo >= 0
                ? "El fondo empieza a estar justo."
                : "Habéis superado el fondo."}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Este mes habéis ingresado {euro(ingresoMes)} y gastado{" "}
              {euro(gastoMes)}. El saldo acumulado del fondo es{" "}
              {saldoFondo >= 0
                ? euro(saldoFondo)
                : `-${euro(Math.abs(saldoFondo))}`}
              .
            </p>
          </Card>

          <Card className="mb-6">
            <p className="mb-4 text-sm font-black text-slate-400">
              Movimientos por persona
            </p>

            <AccountRow label="Marc" value={marc} total={gastoMes + ingresoMes} />
            <AccountRow label="Alba" value={alba} total={gastoMes + ingresoMes} />
            <AccountRow
              label="Conjunta"
              value={conjunta}
              total={gastoMes + ingresoMes}
            />
          </Card>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Últimos movimientos</h3>

              <Link
                href="/movimientos"
                className="text-sm font-black text-emerald-300"
              >
                Ver todo
              </Link>
            </div>

            <div className="space-y-3">
              {ultimos.length === 0 && (
                <p className="rounded-[28px] border border-white/10 bg-white/[0.06] p-5 text-slate-400">
                  Todavía no hay movimientos este mes.
                </p>
              )}

              {ultimos.map((movimiento) => (
                <div
                  key={movimiento.id}
                  className="flex items-center justify-between gap-3 rounded-[30px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
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
                      movimiento.tipo === "ingreso"
                        ? "text-emerald-300"
                        : "text-white"
                    }
                  >
                    {movimiento.tipo === "ingreso" ? "+" : "-"}
                    {euro(Number(movimiento.importe))}
                  </strong>
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