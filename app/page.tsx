"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { DeltaBadge } from "@/components/ui/DeltaBadge";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMovimientos } from "@/hooks/useMovimientos";
import { usePagosRecurrentes } from "@/hooks/usePagosRecurrentes";
import { proximaFecha, formatFechaISO } from "@/lib/recurrencia";
import {
  APORTACION_POR_PERSONA,
  FONDO_MENSUAL,
  calcularSaldoHastaMes,
  compararCategorias,
  compararValores,
  desplazarMes,
  euro,
  formatFechaCorta,
  gastosPorCategoria,
  iconoCategoria,
  mesKey,
  resumenMes,
  totalPorPersona,
} from "@/lib/helpers";
import { Movimiento } from "@/types/expense";

export default function Home() {
  const { movimientos, loading, crearMovimiento } = useMovimientos();
  const { pagos: pagosRecurrentes } = usePagosRecurrentes();
  const [mesActivo, setMesActivo] = useState(new Date());
  const [generando, setGenerando] = useState(false);

  const proximosPagos = pagosRecurrentes
    .filter((pago) => pago.activo)
    .map((pago) => ({ pago, fecha: proximaFecha(pago) }))
    .filter((item): item is { pago: (typeof pagosRecurrentes)[number]; fecha: Date } => item.fecha !== null)
    .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
    .slice(0, 5);

  function cambiarMes(offset: number) {
    setMesActivo((actual) => desplazarMes(actual, offset));
  }

  const resumenActual = resumenMes(movimientos, mesActivo);
  const resumenAnterior = resumenMes(movimientos, desplazarMes(mesActivo, -1));
  const comparacionGasto = compararValores(
    resumenActual.gastos,
    resumenAnterior.gastos
  );
  const saldoFondo = calcularSaldoHastaMes(movimientos, mesActivo);
  const porcentajeUsado = Math.min(
    (resumenActual.gastos / Math.max(resumenActual.ingresos || FONDO_MENSUAL, 1)) *
      100,
    100
  );
  const disponibleMes = resumenActual.ingresos - resumenActual.gastos;
  const categorias = gastosPorCategoria(resumenActual.movimientos);
  const categoriaPrincipal = categorias[0];
  const comparativasCategoria = compararCategorias(movimientos, mesActivo);
  const mayorSubida = [...comparativasCategoria]
    .filter((item) => item.diferencia > 0)
    .sort((a, b) => b.diferencia - a.diferencia)[0];
  const mayorBajada = [...comparativasCategoria]
    .filter((item) => item.diferencia < 0)
    .sort((a, b) => a.diferencia - b.diferencia)[0];
  const gastosPersona = totalPorPersona(resumenActual.movimientos, "gasto");
  const totalGastosPersona = gastosPersona.reduce((acc, item) => acc + item.total, 0);
  const ultimos = resumenActual.movimientos.slice(0, 5);

  const keyMes = mesKey(mesActivo);
  const aportacionMarcExiste = movimientos.some(
    (m) =>
      mesKey(new Date(`${m.fecha}T12:00:00`)) === keyMes &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Marc"
  );
  const aportacionAlbaExiste = movimientos.some(
    (m) =>
      mesKey(new Date(`${m.fecha}T12:00:00`)) === keyMes &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Alba"
  );
  const faltanAportaciones = !aportacionMarcExiste || !aportacionAlbaExiste;

  async function generarAportaciones() {
    if (!faltanAportaciones || generando) return;

    setGenerando(true);
    const fecha = `${mesActivo.getFullYear()}-${String(
      mesActivo.getMonth() + 1
    ).padStart(2, "0")}-01`;

    try {
      const pendientes: Omit<Movimiento, "id">[] = [];

      if (!aportacionMarcExiste) {
        pendientes.push({
          fecha,
          tipo: "ingreso",
          importe: APORTACION_POR_PERSONA,
          categoria: "Aportación",
          descripcion: "Aportación mensual Marc",
          persona: "Marc",
        });
      }

      if (!aportacionAlbaExiste) {
        pendientes.push({
          fecha,
          tipo: "ingreso",
          importe: APORTACION_POR_PERSONA,
          categoria: "Aportación",
          descripcion: "Aportación mensual Alba",
          persona: "Alba",
        });
      }

      for (const movimiento of pendientes) {
        await crearMovimiento(movimiento);
      }
    } catch (error) {
      console.error(error);
      alert("No se han podido generar las aportaciones.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <AppShell>
      <Header />
      <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {faltanAportaciones && (
            <Card className="mb-5 border-emerald-400/30 bg-emerald-400/10">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-[#052e1f]">
                  <Sparkles size={24} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-300">Nuevo mes</p>
                  <h2 className="mt-1 text-xl font-black">Faltan aportaciones</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Registra las aportaciones pendientes de Marc y Alba sin duplicarlas.
                  </p>
                </div>
              </div>

              <button
                onClick={generarAportaciones}
                disabled={generando}
                className="mt-5 h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#052e1f] active:scale-[0.98] disabled:opacity-60"
              >
                {generando ? "Generando..." : "Generar aportaciones"}
              </button>
            </Card>
          )}

          <section className="mb-5 overflow-hidden rounded-[44px] bg-gradient-to-br from-emerald-300 via-emerald-400 to-lime-300 p-6 text-[#052e1f] shadow-2xl shadow-emerald-500/25">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-black opacity-65">Saldo acumulado</p>
                <h2 className="mt-2 break-words text-5xl font-black tracking-tight">
                  {euro(saldoFondo)}
                </h2>
              </div>
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[23px] bg-[#052e1f]/10">
                <Wallet size={29} strokeWidth={3} />
              </div>
            </div>

            <div className="mt-7 rounded-[29px] bg-white/35 p-4 backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm font-black">
                <span>Gastado este mes</span>
                <span>{euro(resumenActual.gastos)}</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-[#052e1f]/15">
                <div
                  className="h-full rounded-full bg-[#052e1f] transition-all duration-700"
                  style={{ width: `${porcentajeUsado}%` }}
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black opacity-60">Balance mensual</p>
                  <p className="mt-1 text-2xl font-black">{euro(disponibleMes)}</p>
                </div>
                <span className="rounded-full bg-[#052e1f]/10 px-3 py-1.5 text-xs font-black">
                  {porcentajeUsado.toFixed(0)}% usado
                </span>
              </div>
            </div>
          </section>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <MetricCard
              icon={<ArrowUpRight size={20} className="text-emerald-300" />}
              label="Ingresos"
              value={euro(resumenActual.ingresos)}
              detail={<span className="text-xs text-slate-500">Este mes</span>}
            />
            <MetricCard
              icon={<ArrowDownRight size={20} className="text-rose-300" />}
              label="Gastos"
              value={euro(resumenActual.gastos)}
              detail={
                <DeltaBadge
                  diferencia={comparacionGasto.diferencia}
                  porcentaje={comparacionGasto.porcentaje}
                  invertido
                />
              }
            />
          </section>

          <Card className="mb-5 border-emerald-400/15 bg-gradient-to-br from-emerald-400/10 to-transparent">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
                {comparacionGasto.diferencia <= 0 ? (
                  <TrendingDown size={22} />
                ) : (
                  <TrendingUp size={22} />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-emerald-300">Resumen inteligente</p>
                <h3 className="mt-1 text-xl font-black">
                  {comparacionGasto.diferencia < 0
                    ? `Habéis gastado ${euro(Math.abs(comparacionGasto.diferencia))} menos.`
                    : comparacionGasto.diferencia > 0
                      ? `Habéis gastado ${euro(comparacionGasto.diferencia)} más.`
                      : "El gasto se mantiene igual."}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {mayorBajada
                    ? `${iconoCategoria(mayorBajada.categoria)} ${mayorBajada.categoria} es la mayor bajada: ${euro(Math.abs(mayorBajada.diferencia))} menos que el mes anterior.`
                    : mayorSubida
                      ? `${iconoCategoria(mayorSubida.categoria)} ${mayorSubida.categoria} es la mayor subida: ${euro(mayorSubida.diferencia)} más.`
                      : "Añade movimientos de varios meses para obtener comparativas más precisas."}
                </p>
              </div>
            </div>
          </Card>

          <section className="mb-5 grid grid-cols-2 gap-3">
            <MetricCard
              icon={<CircleDollarSign size={20} className="text-emerald-300" />}
              label="Mayor categoría"
              value={categoriaPrincipal ? categoriaPrincipal.categoria : "Sin datos"}
              detail={
                categoriaPrincipal ? (
                  <span className="text-xs font-bold text-slate-400">
                    {iconoCategoria(categoriaPrincipal.categoria)} {euro(categoriaPrincipal.total)}
                  </span>
                ) : undefined
              }
            />
            <MetricCard
              icon={<ReceiptText size={20} className="text-sky-300" />}
              label="Movimientos"
              value={String(resumenActual.cantidad)}
              detail={<span className="text-xs text-slate-500">Registrados este mes</span>}
            />
          </section>

          <Card className="mb-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-400">Quién ha pagado los gastos</p>
                <p className="mt-1 text-xs text-slate-500">Sin mezclar las aportaciones</p>
              </div>
              <Link href="/estadisticas" className="text-xs font-black text-emerald-300">
                Analizar
              </Link>
            </div>

            {gastosPersona.map((item) => (
              <AccountRow
                key={item.persona}
                label={item.persona}
                value={item.total}
                total={totalGastosPersona}
              />
            ))}
          </Card>

          <Card className="mb-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-slate-400">Facturas y suscripciones</p>
                <h3 className="mt-1 text-xl font-black">Próximos pagos</h3>
              </div>
              <Link href="/pagos-recurrentes" className="text-xs font-black text-emerald-300">
                Ver todo
              </Link>
            </div>

            {proximosPagos.length === 0 ? (
              <p className="text-sm leading-relaxed text-slate-400">
                No tienes pagos recurrentes activos. Añade Netflix, alquiler o cualquier gasto
                fijo para dejar de introducirlo a mano.
              </p>
            ) : (
              <div className="space-y-3">
                {proximosPagos.map(({ pago, fecha }) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lg">
                        {pago.icono || iconoCategoria(pago.categoria)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-black">{pago.nombre}</p>
                        <p className="text-xs text-slate-500">
                          {formatFechaCorta(formatFechaISO(fecha))}
                        </p>
                      </div>
                    </div>
                    <strong
                      className={pago.tipo === "ingreso" ? "text-emerald-300" : "text-white"}
                    >
                      {pago.tipo === "ingreso" ? "+" : "-"}
                      {euro(Number(pago.importe))}
                    </strong>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <section className="mb-6 grid grid-cols-3 gap-3">
            <QuickAction href="/movimientos" icon="＋" label="Movimiento" />
            <QuickAction href="/estadisticas" icon="📊" label="Estadísticas" />
            <QuickAction href="/ajustes" icon="💚" label="Aportaciones" />
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-black">Últimos movimientos</h3>
              <Link href="/movimientos" className="text-sm font-black text-emerald-300">
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
                  className="flex items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-xl">
                      {iconoCategoria(movimiento.categoria)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black">{movimiento.descripcion}</p>
                      <p className="truncate text-sm text-slate-400">
                        {movimiento.categoria} · {movimiento.persona} · {formatFechaCorta(movimiento.fecha)}
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
        </>
      )}

      <Link
        href="/movimientos"
        aria-label="Añadir movimiento"
        className="fixed bottom-24 left-1/2 z-40 ml-[145px] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-[25px] bg-emerald-400 text-[#052e1f] shadow-2xl shadow-emerald-500/35 active:scale-90"
      >
        <Plus size={31} strokeWidth={4} />
      </Link>

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
  const percent = total > 0 ? (value / total) * 100 : 0;

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

function QuickAction({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-[25px] border border-white/10 bg-white/[0.07] p-4 text-center shadow-xl shadow-black/10 active:scale-[0.98]"
    >
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-xs font-black text-slate-300">{label}</p>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-72 rounded-[44px] bg-white/10" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-36 rounded-[28px] bg-white/10" />
        <div className="h-36 rounded-[28px] bg-white/10" />
      </div>
      <div className="h-44 rounded-[34px] bg-white/10" />
    </div>
  );
}
