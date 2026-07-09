"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MovementModal } from "@/components/shared/MovementModal";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { useMovimientos } from "@/hooks/useMovimientos";
import { euro, filtrarPorMes, iconoCategoria } from "@/lib/helpers";
import { Movimiento } from "@/types/expense";

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

  function cambiarMes(offset: number) {
    const nuevo = new Date(mesActivo);
    nuevo.setMonth(nuevo.getMonth() + offset);
    setMesActivo(nuevo);
  }

  const movimientosMes = filtrarPorMes(movimientos, mesActivo);

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
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <section className="mb-5">
          <h2 className="text-3xl font-black">Movimientos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Ingresos y gastos del fondo.
          </p>
        </section>

        <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

        <div className="mt-5 space-y-3">
          {!loading && movimientosMes.length === 0 && (
            <p className="text-slate-400">No hay movimientos este mes.</p>
          )}

          {movimientosMes.map((movimiento) => (
            <button
              key={movimiento.id}
              onClick={() => {
                setEditing(movimiento);
                setOpen(true);
              }}
              className="w-full rounded-[28px] border border-white/10 bg-white/[0.06] p-4 text-left transition active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl">
                    {iconoCategoria(movimiento.categoria)}
                  </div>

                  <div>
                    <p className="font-black">{movimiento.descripcion}</p>
                    <p className="text-sm text-slate-400">
                      {movimiento.categoria} · {movimiento.persona}
                    </p>
                  </div>
                </div>

                <div className="text-right">
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

                  <p className="text-xs capitalize text-slate-500">
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
          className="fixed bottom-24 left-1/2 z-40 grid h-16 w-16 -translate-x-1/2 place-items-center rounded-[26px] bg-emerald-400 text-4xl text-[#06110c] shadow-2xl shadow-emerald-500/40 active:scale-90"
        >
          +
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
      </div>
    </main>
  );
}