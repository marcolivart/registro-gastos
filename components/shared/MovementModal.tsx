"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Movimiento } from "@/types/expense";

type Props = {
  open: boolean;
  movimiento?: Movimiento | null;
  onClose: () => void;
  onSave: (movimiento: Omit<Movimiento, "id">) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const categoriasGasto = [
  "Compra",
  "Alquiler",
  "Luz",
  "Agua",
  "Internet",
  "Ocio",
  "Transporte",
  "Limpieza",
  "Hogar",
  "Otros",
];

const categoriasIngreso = [
  "Aportación",
  "Nómina",
  "Devolución",
  "Ingreso extra",
  "Otros",
];

export function MovementModal(props: Props) {
  if (!props.open) return null;

  return (
    <MovementModalContent
      key={props.movimiento?.id ?? "nuevo"}
      {...props}
      open
    />
  );
}

function MovementModalContent({
  movimiento,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() =>
    movimiento
      ? {
          tipo: movimiento.tipo,
          importe: String(movimiento.importe).replace(".", ","),
          categoria: movimiento.categoria,
          persona: movimiento.persona,
          descripcion: movimiento.descripcion,
          fecha: movimiento.fecha,
        }
      : {
          tipo: "gasto" as "ingreso" | "gasto",
          importe: "",
          categoria: "Compra",
          persona: "Conjunta",
          descripcion: "",
          fecha: new Date().toISOString().slice(0, 10),
        }
  );

  async function guardar() {
    const importe = Number(form.importe.replace(",", "."));

    if (!Number.isFinite(importe) || importe <= 0) {
      alert("Introduce un importe válido.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        fecha: form.fecha,
        tipo: form.tipo,
        importe,
        categoria: form.categoria,
        descripcion:
          form.descripcion.trim() ||
          (form.tipo === "ingreso" ? "Ingreso" : form.categoria),
        persona: form.persona,
      });
    } catch (error) {
      console.error(error);
      alert("No se ha podido guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  }

  function cambiarTipo(tipo: "ingreso" | "gasto") {
    setForm((actual) => ({
      ...actual,
      tipo,
      categoria: tipo === "ingreso" ? "Aportación" : "Compra",
    }));
  }

  const categorias = form.tipo === "ingreso" ? categoriasIngreso : categoriasGasto;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="animate-slideUp flex max-h-[94dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[36px] border border-white/10 bg-[#0b141e] shadow-2xl shadow-black/60 sm:rounded-[36px]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-sm font-black text-emerald-300">
              {movimiento ? "Modificar movimiento" : "Nuevo movimiento"}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {movimiento ? "Editar datos" : "Registrar movimiento"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/[0.08] text-slate-300 active:scale-95"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="mb-4 grid grid-cols-2 gap-2 rounded-[22px] bg-white/[0.05] p-2">
            <button
              onClick={() => cambiarTipo("gasto")}
              className={`h-12 rounded-2xl font-black transition ${
                form.tipo === "gasto"
                  ? "bg-rose-400 text-[#27070d]"
                  : "text-slate-400"
              }`}
            >
              Gasto
            </button>
            <button
              onClick={() => cambiarTipo("ingreso")}
              className={`h-12 rounded-2xl font-black transition ${
                form.tipo === "ingreso"
                  ? "bg-emerald-400 text-[#052e1f]"
                  : "text-slate-400"
              }`}
            >
              Ingreso
            </button>
          </div>

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Importe
          </label>
          <input
            className="input text-xl"
            inputMode="decimal"
            placeholder="0,00"
            value={form.importe}
            onChange={(e) => setForm({ ...form, importe: e.target.value })}
          />

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Categoría
          </label>
          <select
            className="input"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            {categorias.map((categoria) => (
              <option key={categoria}>{categoria}</option>
            ))}
          </select>

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Persona o cuenta
          </label>
          <select
            className="input"
            value={form.persona}
            onChange={(e) => setForm({ ...form, persona: e.target.value })}
          >
            <option>Conjunta</option>
            <option>Marc</option>
            <option>Alba</option>
          </select>

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Descripción
          </label>
          <input
            className="input"
            placeholder={form.tipo === "ingreso" ? "Ej. Aportación Marc" : "Ej. Mercadona"}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Fecha
          </label>
          <input
            className="input"
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />

          {movimiento && onDelete && (
            <button
              onClick={onDelete}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-rose-400/10 font-black text-rose-300 active:scale-[0.98]"
            >
              <Trash2 size={18} /> Eliminar movimiento
            </button>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#0b141e]/95 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl">
          <button
            onClick={guardar}
            disabled={saving}
            className="h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#052e1f] shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60"
          >
            {saving
              ? "Guardando..."
              : movimiento
                ? "Guardar cambios"
                : "Guardar movimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}
