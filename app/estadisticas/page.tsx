"use client";

import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  CircleDollarSign,
  PiggyBank,
  ReceiptText,
  Users,
} from "lucide-react";
import { DonutChart } from "@/components/charts/DonutChart";
import { MonthlyTrend } from "@/components/charts/MonthlyTrend";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  compararCategorias,
  compararValores,
  desplazarMes,
  euro,
  evolucionMensual,
  gastosPorCategoria,
  iconoCategoria,
  nombreMes,
  resumenMes,
  totalPorPersona,
} from "@/lib/helpers";

export default function EstadisticasPage() {
  const { movimientos, loading } = useMovimientos();
  const [mesActivo, setMesActivo] = useState(new Date());

  const actual = resumenMes(movimientos, mesActivo);
  const mesAnterior = desplazarMes(mesActivo, -1);
  const anterior = resumenMes(movimientos, mesAnterior);
  const comparacionGastos = compararValores(actual.gastos, anterior.gastos);
  const comparacionIngresos = compararValores(actual.ingresos, anterior.ingresos);
  const comparacionBalance = compararValores(actual.balance, anterior.balance);
  const categorias = gastosPorCategoria(actual.movimientos);
  const comparativasCategoria = compararCategorias(movimientos, mesActivo);
  const evolucion = evolucionMensual(movimientos, mesActivo, 6);
  const gastosPersona = totalPorPersona(actual.movimientos, "gasto");
  const ingresosPersona = totalPorPersona(actual.movimientos, "ingreso");
  const mayorCategoria = categorias[0];
  const mayorSubida = [...comparativasCategoria]
    .filter((item) => item.diferencia > 0)
    .sort((a, b) => b.diferencia - a.diferencia)[0];
  const mayorAhorro = [...comparativasCategoria]
    .filter((item) => item.diferencia < 0)
    .sort((a, b) => a.diferencia - b.diferencia)[0];

  function cambiarMes(offset: number) {
    setMesActivo((actual) => desplazarMes(actual, offset));
  }

  return (
    <AppShell>
      <Header />

      <div className="mb-5">
        <p className="text-sm font-black text-emerald-300">Análisis financiero</p>
        <h2 className="mt-1 text-3xl font-black">Estadísticas</h2>
      </div>

      <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 rounded-[34px] bg-white/10" />
          <div className="h-72 rounded-[34px] bg-white/10" />
          <div className="h-64 rounded-[34px] bg-white/10" />
        </div>
      ) : (
        <>
          <section className="mb-5 grid grid-cols-2 gap-3">
            <MetricCard
              icon={<ArrowUpRight size={20} className="text-emerald-300" />}
              label="Ingresos"
              value={euro(actual.ingresos)}
              detail={
                <DeltaBadge
                  diferencia={comparacionIngresos.diferencia}
                  porcentaje={comparacionIngresos.porcentaje}
                />
              }
            />
            <MetricCard
              icon={<ArrowDownRight size={20} className="text-rose-300" />}
              label="Gastos"
              value={euro(actual.gastos)}
              detail={
                <DeltaBadge
                  diferencia={comparacionGastos.diferencia}
                  porcentaje={comparacionGastos.porcentaje}
                  invertido
                />
              }
            />
          </section>

          <Card className="mb-5 overflow-hidden border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 to-transparent">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black text-emerald-300">Balance mensual</p>
                <p
                  className={`mt-2 text-4xl font-black ${
                    actual.balance >= 0 ? "text-white" : "text-rose-300"
                  }`}
                >
                  {actual.balance >= 0 ? "+" : ""}
                  {euro(actual.balance)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Frente a {nombreMes(mesAnterior)}
                </p>
              </div>
              <DeltaBadge
                diferencia={comparacionBalance.diferencia}
                porcentaje={comparacionBalance.porcentaje}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
              <div>
                <p className="text-xs font-bold text-slate-500">Mes anterior</p>
                <p className="mt-1 text-lg font-black">{euro(anterior.balance)}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500">Diferencia</p>
                <p
                  className={`mt-1 text-lg font-black ${
                    comparacionBalance.diferencia >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }`}
                >
                  {comparacionBalance.diferencia >= 0 ? "+" : ""}
                  {euro(comparacionBalance.diferencia)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="mb-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-400">Gasto por categorías</p>
                <h3 className="mt-1 text-xl font-black">Dónde se va el dinero</h3>
              </div>
              <CircleDollarSign className="text-emerald-300" size={23} />
            </div>

            {categorias.length > 0 ? (
              <DonutChart items={categorias} />
            ) : (
              <EmptyState text="No hay gastos en el mes seleccionado." />
            )}
          </Card>

          <Card className="mb-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-400">Últimos 6 meses</p>
                <h3 className="mt-1 text-xl font-black">Evolución mensual</h3>
              </div>
              <CalendarRange className="text-sky-300" size={23} />
            </div>
            <MonthlyTrend items={evolucion} />
          </Card>

          <Card className="mb-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-400">Mes contra mes</p>
                <h3 className="mt-1 text-xl font-black">Comparativa por categoría</h3>
              </div>
              <ReceiptText className="text-amber-300" size={23} />
            </div>

            {comparativasCategoria.length === 0 ? (
              <EmptyState text="Aún no hay categorías para comparar." />
            ) : (
              <div className="space-y-4">
                {comparativasCategoria.map((item) => {
                  const maximo = Math.max(item.actual, item.anterior, 1);
                  return (
                    <div
                      key={item.categoria}
                      className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">
                            {iconoCategoria(item.categoria)} {item.categoria}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {euro(item.anterior)} → {euro(item.actual)}
                          </p>
                        </div>
                        <DeltaBadge
                          diferencia={item.diferencia}
                          porcentaje={item.porcentaje}
                          invertido
                        />
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Mes actual</span>
                            <span>{euro(item.actual)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-emerald-400"
                              style={{ width: `${(item.actual / maximo) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mb-1 flex justify-between text-[11px] font-bold text-slate-500">
                            <span>Mes anterior</span>
                            <span>{euro(item.anterior)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-slate-500"
                              style={{ width: `${(item.anterior / maximo) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-slate-400">Gastos pagados</p>
                <Users size={19} className="text-rose-300" />
              </div>
              <PersonBreakdown items={gastosPersona} total={actual.gastos} />
            </Card>
            <Card className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-black text-slate-400">Ingresos</p>
                <PiggyBank size={19} className="text-emerald-300" />
              </div>
              <PersonBreakdown items={ingresosPersona} total={actual.ingresos} />
            </Card>
          </section>

          <Card className="mb-4 border-sky-400/15 bg-sky-400/5">
            <p className="text-sm font-black text-sky-300">Lectura rápida</p>
            <h3 className="mt-2 text-xl font-black">
              {comparacionGastos.diferencia < 0
                ? `Buen mes: ${euro(Math.abs(comparacionGastos.diferencia))} menos de gasto.`
                : comparacionGastos.diferencia > 0
                  ? `El gasto ha aumentado ${euro(comparacionGastos.diferencia)}.`
                  : "El gasto total no ha cambiado."}
            </h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
              {mayorCategoria && (
                <p>
                  {iconoCategoria(mayorCategoria.categoria)} La categoría principal es{" "}
                  <strong>{mayorCategoria.categoria}</strong> con {euro(mayorCategoria.total)}.
                </p>
              )}
              {mayorAhorro && (
                <p>
                  💚 El mayor ahorro está en <strong>{mayorAhorro.categoria}</strong>:{" "}
                  {euro(Math.abs(mayorAhorro.diferencia))} menos.
                </p>
              )}
              {mayorSubida && (
                <p>
                  ⚠️ La mayor subida está en <strong>{mayorSubida.categoria}</strong>:{" "}
                  {euro(mayorSubida.diferencia)} más.
                </p>
              )}
            </div>
          </Card>
        </>
      )}

      <BottomNavigation />
    </AppShell>
  );
}

function PersonBreakdown({
  items,
  total,
}: {
  items: { persona: string; total: number }[];
  total: number;
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const porcentaje = total > 0 ? (item.total / total) * 100 : 0;
        return (
          <div key={item.persona}>
            <div className="mb-1.5 flex justify-between gap-2 text-xs">
              <span className="font-bold text-slate-400">{item.persona}</span>
              <span className="font-black">{euro(item.total)}</span>
            </div>
            <ProgressBar value={porcentaje} />
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-5 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
