"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Plus, Scale } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MovementModal } from "@/components/shared/MovementModal";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { AppShell } from "@/components/ui/AppShell";
import { MetricCard } from "@/components/ui/MetricCard";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  desplazarMes,
  euro,
  filtrarPorMes,
  formatFechaCorta,
  iconoCategoria,
  resumenMes,
} from "@/lib/helpers";
import { Movimiento } from "@/types/expense";

type Filtro = "todos" | "gasto" | "ingreso";

export default function MovimientosPage() {
  const {
    movimientos,
    loading,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
  } = useMovimientos();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Movimiento | null>(null);
  const [mesActivo, setMesActivo] = useState(new Date());
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const resumen = resumenMes(movimientos, mesActivo);
  const movimientosFiltrados = useMemo(() => {
    const delMes = filtrarPorMes(movimientos, mesActivo);
    return filtro === "todos" ? delMes : delMes.filter((m) => m.tipo === filtro);
  }, [filtro, mesActivo, movimientos]);

  function cambiarMes(offset: number) {
    setMesActivo((actual) => desplazarMes(actual, offset));
  }

  async function guardar(movimiento: Omit<Movimiento, "id">) {
    if (editing) {
      await actualizarMovimiento(editing.id, movimiento);
    } else {
      await crearMovimiento(movimiento);
    }

    setEditing(null);
    setOpen(false);
  }

  async function borrar() {
    if (!editing) return;
    if (!confirm("¿Eliminar este movimiento?")) return;

    await eliminarMovimiento(editing.id);
    setEditing(null);
    setOpen(false);
  }

  return (
    <AppShell>
      <Header />

      <section className="mb-5">
        <p className="text-sm font-black text-emerald-300">Historial completo</p>
        <h2 className="mt-1 text-3xl font-black">Movimientos</h2>
      </section>

      <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

      <section className="mb-5 grid grid-cols-3 gap-2">
        <CompactMetric
          label="Ingresos"
          value={resumen.ingresos}
          icon={<ArrowUpRight size={17} />}
          positive
        />
        <CompactMetric
          label="Gastos"
          value={resumen.gastos}
          icon={<ArrowDownRight size={17} />}
        />
        <CompactMetric
          label="Balance"
          value={resumen.balance}
          icon={<Scale size={17} />}
          positive={resumen.balance >= 0}
        />
      </section>

      <div className="mb-5 grid grid-cols-3 gap-2 rounded-[24px] border border-white/10 bg-white/[0.05] p-2">
        {([
          ["todos", "Todos"],
          ["gasto", "Gastos"],
          ["ingreso", "Ingresos"],
        ] as const).map(([valor, etiqueta]) => (
          <button
            key={valor}
            onClick={() => setFiltro(valor)}
            className={`h-10 rounded-2xl text-xs font-black transition ${
              filtro === valor
                ? "bg-emerald-400 text-[#052e1f]"
                : "text-slate-400 active:bg-white/10"
            }`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {!loading && movimientosFiltrados.length === 0 && (
          <p className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] p-6 text-center text-sm text-slate-500">
            No hay movimientos con este filtro.
          </p>
        )}

        {movimientosFiltrados.map((movimiento) => (
          <button
            key={movimiento.id}
            onClick={() => {
              setEditing(movimiento);
              setOpen(true);
            }}
            className="w-full rounded-[28px] border border-white/10 bg-white/[0.065] p-4 text-left shadow-xl shadow-black/10 transition active:scale-[0.98]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl ${
                    movimiento.tipo === "ingreso"
                      ? "bg-emerald-400/15"
                      : "bg-white/10"
                  }`}
                >
                  {iconoCategoria(movimiento.categoria)}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-black">{movimiento.descripcion}</p>
                  <p className="truncate text-sm text-slate-400">
                    {movimiento.categoria} · {movimiento.persona}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-600">
                    {formatFechaCorta(movimiento.fecha)}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p
                  className={`font-black ${
                    movimiento.tipo === "ingreso"
                      ? "text-emerald-300"
                      : "text-white"
                  }`}
                >
                  {movimiento.tipo === "ingreso" ? "+" : "-"}
                  {euro(Number(movimiento.importe))}
                </p>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {movimiento.tipo}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        aria-label="Añadir movimiento"
        className="fixed bottom-24 left-1/2 z-40 ml-[145px] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-[25px] bg-emerald-400 text-[#052e1f] shadow-2xl shadow-emerald-500/35 active:scale-90"
      >
        <Plus size={31} strokeWidth={4} />
      </button>

      <MovementModal
        open={open}
        movimiento={editing}
        onClose={() => {
          setEditing(null);
          setOpen(false);
        }}
        onSave={guardar}
        onDelete={editing ? borrar : undefined}
      />

      <BottomNavigation />
    </AppShell>
  );
}

function CompactMetric({
  label,
  value,
  icon,
  positive = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  positive?: boolean;
}) {
  return (
    <MetricCard
      icon={
        <span className={positive ? "text-emerald-300" : "text-rose-300"}>
          {icon}
        </span>
      }
      label={label}
      value={euro(value)}
      className="min-w-0 p-3 [&>div]:mb-3"
    />
  );
}
