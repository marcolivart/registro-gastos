"use client";

import { useMemo, useState } from "react";
import { Copy, Pause, Play, Plus, Repeat } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { RecurringPaymentModal } from "@/components/shared/RecurringPaymentModal";
import { AppShell } from "@/components/ui/AppShell";
import { usePagosRecurrentes } from "@/hooks/usePagosRecurrentes";
import { euro, formatFechaCorta, iconoCategoria } from "@/lib/helpers";
import { FRECUENCIAS, formatFechaISO, proximaFecha } from "@/lib/recurrencia";
import { NuevoPagoRecurrente, PagoRecurrente } from "@/types/recurrente";

export default function PagosRecurrentesPage() {
  const {
    pagos,
    loading,
    crearPago,
    actualizarPago,
    eliminarPago,
    pausarPago,
    activarPago,
    duplicarPago,
  } = usePagosRecurrentes();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PagoRecurrente | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const pagosOrdenados = useMemo(() => {
    return [...pagos].sort((a, b) => {
      if (a.activo !== b.activo) return a.activo ? -1 : 1;

      const proximaA = proximaFecha(a);
      const proximaB = proximaFecha(b);
      if (!proximaA && !proximaB) return 0;
      if (!proximaA) return 1;
      if (!proximaB) return -1;
      return proximaA.getTime() - proximaB.getTime();
    });
  }, [pagos]);

  async function guardar(pago: NuevoPagoRecurrente) {
    if (editing) {
      await actualizarPago(editing.id, pago);
    } else {
      await crearPago(pago);
    }

    setEditing(null);
    setOpen(false);
  }

  async function borrar() {
    if (!editing) return;
    if (!confirm(`¿Eliminar "${editing.nombre}"? El historial ya generado no se borrará.`)) return;

    await eliminarPago(editing.id);
    setEditing(null);
    setOpen(false);
  }

  async function alternarActivo(pago: PagoRecurrente) {
    setProcesando(pago.id);
    try {
      if (pago.activo) {
        await pausarPago(pago.id);
      } else {
        await activarPago(pago.id);
      }
    } finally {
      setProcesando(null);
    }
  }

  async function duplicar(pago: PagoRecurrente) {
    setProcesando(pago.id);
    try {
      await duplicarPago(pago);
    } finally {
      setProcesando(null);
    }
  }

  return (
    <AppShell>
      <Header />

      <section className="mb-5">
        <p className="text-sm font-black text-emerald-300">Automatiza tus facturas</p>
        <h2 className="mt-1 text-3xl font-black">Pagos recurrentes</h2>
      </section>

      {loading ? (
        <PagosSkeleton />
      ) : pagosOrdenados.length === 0 ? (
        <EstadoVacio onCrear={() => setOpen(true)} />
      ) : (
        <div className="space-y-3">
          {pagosOrdenados.map((pago) => (
            <PagoCard
              key={pago.id}
              pago={pago}
              procesando={procesando === pago.id}
              onEditar={() => {
                setEditing(pago);
                setOpen(true);
              }}
              onAlternarActivo={() => alternarActivo(pago)}
              onDuplicar={() => duplicar(pago)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        aria-label="Añadir pago recurrente"
        className="fixed bottom-24 left-1/2 z-40 ml-[145px] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-[25px] bg-emerald-400 text-[#052e1f] shadow-2xl shadow-emerald-500/35 active:scale-90"
      >
        <Plus size={31} strokeWidth={4} />
      </button>

      <RecurringPaymentModal
        open={open}
        pago={editing}
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

function PagoCard({
  pago,
  procesando,
  onEditar,
  onAlternarActivo,
  onDuplicar,
}: {
  pago: PagoRecurrente;
  procesando: boolean;
  onEditar: () => void;
  onAlternarActivo: () => void;
  onDuplicar: () => void;
}) {
  const siguiente = proximaFecha(pago);

  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.065] p-4 shadow-xl shadow-black/10 ${
        pago.activo ? "" : "opacity-60"
      }`}
    >
      <button onClick={onEditar} className="flex w-full items-center justify-between gap-3 text-left">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-xl"
            style={{ backgroundColor: `${pago.color || "#94a3b8"}26` }}
          >
            {pago.icono || iconoCategoria(pago.categoria)}
          </div>

          <div className="min-w-0">
            <p className="truncate font-black">{pago.nombre}</p>
            <p className="truncate text-sm text-slate-400">
              {pago.categoria} · {pago.persona}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-600">
              {FRECUENCIAS[pago.frecuencia].label}
              {" · "}
              {pago.activo
                ? siguiente
                  ? `Próximo: ${formatFechaCorta(formatFechaISO(siguiente))}`
                  : "Finalizado"
                : "En pausa"}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className={`font-black ${pago.tipo === "ingreso" ? "text-emerald-300" : "text-white"}`}>
            {pago.tipo === "ingreso" ? "+" : "-"}
            {euro(Number(pago.importe))}
          </p>
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
        <button
          onClick={onAlternarActivo}
          disabled={procesando}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-xs font-black text-slate-300 active:scale-[0.98] disabled:opacity-50"
        >
          {pago.activo ? <Pause size={15} /> : <Play size={15} />}
          {pago.activo ? "Pausar" : "Activar"}
        </button>
        <button
          onClick={onDuplicar}
          disabled={procesando}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-xs font-black text-slate-300 active:scale-[0.98] disabled:opacity-50"
        >
          <Copy size={15} />
          Duplicar
        </button>
      </div>
    </div>
  );
}

function EstadoVacio({ onCrear }: { onCrear: () => void }) {
  return (
    <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
        <Repeat size={26} />
      </div>
      <h3 className="mt-4 text-lg font-black">Sin pagos recurrentes todavía</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        Añade Netflix, alquiler, seguro o cualquier gasto que se repita para dejar de
        introducirlo a mano cada vez.
      </p>
      <button
        onClick={onCrear}
        className="mt-5 h-12 w-full rounded-2xl bg-emerald-400 font-black text-[#052e1f] active:scale-[0.98]"
      >
        Crear el primero
      </button>
    </div>
  );
}

function PagosSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-28 rounded-[28px] bg-white/10" />
      <div className="h-28 rounded-[28px] bg-white/10" />
      <div className="h-28 rounded-[28px] bg-white/10" />
    </div>
  );
}
