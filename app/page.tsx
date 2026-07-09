"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Wallet, ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  APORTACION_POR_PERSONA,
  FONDO_MENSUAL,
  calcularSaldoHastaMes,
  euro,
  filtrarPorMes,
  iconoCategoria,
  mesKey,
  totalGastos,
  totalIngresos,
} from "@/lib/helpers";
import { Movimiento } from "@/types/expense";

export default function Home() {
  const { movimientos, loading, crearMovimiento } = useMovimientos();
  const [mesActivo, setMesActivo] = useState(new Date());
  const [generando, setGenerando] = useState(false);

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

  const movimientosMes = filtrarPorMes(movimientos, mesActivo);
  const gastoMes = totalGastos(movimientosMes);
  const ingresoMes = totalIngresos(movimientosMes);
  const saldoFondo = calcularSaldoHastaMes(movimientos, mesActivo);
  const balanceMes = ingresoMes - gastoMes;
  const porcentaje = Math.min((gastoMes / FONDO_MENSUAL) * 100, 100);

  const mesActivoKey = mesKey(mesActivo);
  const fechaAportacion = new Date(
    mesActivo.getFullYear(),
    mesActivo.getMonth(),
    1
  )
    .toISOString()
    .slice(0, 10);

  const aportacionMarcExiste = movimientos.some(
    (m) =>
      mesKey(new Date(m.fecha)) === mesActivoKey &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Marc"
  );

  const aportacionAlbaExiste = movimientos.some(
    (m) =>
      mesKey(new Date(m.fecha)) === mesActivoKey &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Alba"
  );

  const faltanAportaciones = !aportacionMarcExiste || !aportacionAlbaExiste;

  async function generarAportaciones() {
    try {
      setGenerando(true);

      const nuevasAportaciones: Omit<Movimiento, "id">[] = [];

      if (!aportacionMarcExiste) {
        nuevasAportaciones.push({
          fecha: fechaAportacion,
          tipo: "ingreso",
          importe: APORTACION_POR_PERSONA,
          categoria: "Aportación",
          descripcion: "Aportación mensual Marc",
          persona: "Marc",
        });
      }

      if (!aportacionAlbaExiste) {
        nuevasAportaciones.push({
          fecha: fechaAportacion,
          tipo: "ingreso",
          importe: APORTACION_POR_PERSONA,
          categoria: "Aportación",
          descripcion: "Aportación mensual Alba",
          persona: "Alba",
        });
      }

      for (const movimiento of nuevasAportaciones) {
        await crearMovimiento(movimiento);
      }
    } catch (error) {
      console.error(error);
      alert("Error generando aportaciones.");
    } finally {
      setGenerando(false);
    }
  }

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
          <section className="mb-5 overflow-hidden rounded-[46px] bg-gradient-to-br from-emerald-300 via-emerald-400 to-lime-300 p-6 text-[#052e1f] shadow-2xl shadow-emerald-500/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-black opacity-70">Saldo del fondo</p>
                <h2 className="mt-2 text-6xl font-black tracking-tight">
                  {saldoFondo >= 0
                    ? euro(saldoFondo)
                    : `-${euro(Math.abs(saldoFondo))}`}
                </h2>
              </div>

              <div className="grid h-14 w-14 place-items-center rounded-[24px] bg-[#052e1f]/10">
                <Wallet size={30} strokeWidth={3} />
              </div>
            </div>

            <div className="mt-7 rounded-[30px] bg-white/35 p-4 backdrop-blur">
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

              <p className="mt-3 text-xs font-black opacity-70">
                {porcentaje.toFixed(0)}% de la aportación mensual usado
              </p>
            </div>
          </section>

          {faltanAportaciones && (
            <Card className="mb-5 border-emerald-400/30 bg-emerald-400/10">
              <div className="flex gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-[#06110c]">
                  <Sparkles size={24} strokeWidth={3} />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-black text-emerald-300">
                    Nuevo mes
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Faltan aportaciones
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    Genera las aportaciones de Marc y Alba para este mes.
                  </p>
                </div>
              </div>

              <button
                onClick={generarAportaciones}
                disabled={generando}
                className="mt-5 h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#06110c] active:scale-[0.98] disabled:opacity-60"
              >
                {generando ? "Generando..." : "Generar aportaciones"}
              </button>
            </Card>
          )}

          <section className="mb-5 grid grid-cols-2 gap-3">
            <MiniMetric
              icon={<ArrowUpRight size={20} />}
              label="Ingresos"
              value={ingresoMes}
              positive
            />
            <MiniMetric
              icon={<ArrowDownRight size={20} />}
              label="Gastos"
              value={gastoMes}
            />
          </section>

          <Card className="mb-5">
            <p className="text-sm font-black text-slate-400">Balance del mes</p>
            <h3
              className={`mt-2 text-3xl font-black ${
                balanceMes >= 0 ? "text-emerald-300" : "text-red-300"
              }`}
            >
              {balanceMes >= 0
                ? `+${euro(balanceMes)}`
                : `-${euro(Math.abs(balanceMes))}`}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              {balanceMes >= 0
                ? "Este mes estáis sumando dinero al fondo común."
                : "Este mes estáis gastando más de lo ingresado."}
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

          <section className="mb-6 grid grid-cols-3 gap-3">
            <QuickAction href="/movimientos" icon="＋" label="Movimiento" />
            <QuickAction href="/ajustes" icon="💚" label="Aportar" />
            <QuickAction href="/estadisticas" icon="📊" label="Stats" />
          </section>

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

      <Link
        href="/movimientos"
        className="fixed bottom-24 right-[calc(50%-200px)] z-40 grid h-16 w-16 place-items-center rounded-[26px] bg-emerald-400 text-[#06110c] shadow-2xl shadow-emerald-500/40 active:scale-90"
      >
        <Plus size={32} strokeWidth={4} />
      </Link>

      <BottomNavigation />
    </AppShell>
  );
}

function MiniMetric({
  icon,
  label,
  value,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[30px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10">
      <div
        className={`mb-3 grid h-10 w-10 place-items-center rounded-2xl ${
          positive
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-red-400/15 text-red-300"
        }`}
      >
        {icon}
      </div>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black">{euro(value)}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[26px] border border-white/10 bg-white/[0.07] p-4 text-center shadow-xl shadow-black/10 active:scale-[0.98]"
    >
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-xs font-black text-slate-300">{label}</p>
    </Link>
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