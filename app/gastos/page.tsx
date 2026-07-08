"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { ExpenseModal } from "@/components/shared/ExpenseModal";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { useExpenses } from "@/hooks/useExpenses";
import { euro, filtrarPorMes, iconoCategoria } from "@/lib/helpers";
import { Gasto } from "@/types/expense";

export default function GastosPage() {
  const { gastos, loading, crearGasto, actualizarGasto, eliminarGasto } =
    useExpenses();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [mesActivo, setMesActivo] = useState(new Date());

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

  const gastosMes = filtrarPorMes(gastos, mesActivo);

  async function guardar(gasto: Omit<Gasto, "id">) {
    if (editing) {
      await actualizarGasto(editing.id, gasto);
    } else {
      await crearGasto(gasto);
    }

    setEditing(null);
  }

  async function borrar() {
    if (!editing) return;
    if (!confirm("¿Seguro que quieres eliminar este gasto?")) return;

    await eliminarGasto(editing.id);
    setEditing(null);
    setOpen(false);
  }

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <section className="mb-5">
          <h2 className="text-3xl font-black">Gastos</h2>
          <p className="mt-1 text-sm text-slate-400">
            Cambia de mes y pulsa un gasto para editarlo.
          </p>
        </section>

        <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

        <div className="space-y-3">
          {gastosMes.length === 0 && !loading && (
            <p className="text-slate-400">No hay gastos en este mes.</p>
          )}

          {gastosMes.map((gasto) => (
            <button
              key={gasto.id}
              onClick={() => {
                setEditing(gasto);
                setOpen(true);
              }}
              className="movement w-full text-left active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl">
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

        <ExpenseModal
          open={open}
          gasto={editing}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={guardar}
          onDelete={editing ? borrar : undefined}
        />

        <BottomNavigation />
      </div>
    </main>
  );
}