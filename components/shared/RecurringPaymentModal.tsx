"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { NuevoPagoRecurrente, PagoRecurrente, Frecuencia } from "@/types/recurrente";
import { CATEGORIAS_GASTO, CATEGORIAS_INGRESO, PERSONAS } from "@/lib/helpers";
import {
  DIAS_SEMANA,
  FRECUENCIAS,
  FRECUENCIAS_ORDEN,
  parseFechaISO,
  usaDiaDeSemana,
  usaDiaDelMes,
} from "@/lib/recurrencia";

type Props = {
  open: boolean;
  pago?: PagoRecurrente | null;
  onClose: () => void;
  onSave: (pago: NuevoPagoRecurrente) => Promise<void>;
  onDelete?: () => Promise<void>;
};

const COLORES_PRESET = [
  "#34d399",
  "#60a5fa",
  "#facc15",
  "#38bdf8",
  "#a78bfa",
  "#fb7185",
  "#fb923c",
  "#c084fc",
];

export function RecurringPaymentModal(props: Props) {
  if (!props.open) return null;

  return <RecurringPaymentModalContent key={props.pago?.id ?? "nuevo"} {...props} open />;
}

function RecurringPaymentModalContent({ pago, onClose, onSave, onDelete }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() =>
    pago
      ? {
          nombre: pago.nombre,
          tipo: pago.tipo,
          importe: String(pago.importe).replace(".", ","),
          categoria: pago.categoria,
          descripcion: pago.descripcion || "",
          persona: pago.persona,
          fechaInicio: pago.fecha_inicio,
          sinFin: !pago.fecha_fin,
          fechaFin: pago.fecha_fin || "",
          frecuencia: pago.frecuencia,
          diaEjecucion: pago.dia_ejecucion,
          color: pago.color || "",
          icono: pago.icono || "",
        }
      : {
          nombre: "",
          tipo: "gasto" as "ingreso" | "gasto",
          importe: "",
          categoria: "Compra",
          descripcion: "",
          persona: "Conjunta",
          fechaInicio: new Date().toISOString().slice(0, 10),
          sinFin: true,
          fechaFin: "",
          frecuencia: "mensual" as Frecuencia,
          diaEjecucion: new Date().getDate() as number | null,
          color: "",
          icono: "",
        }
  );

  const categorias = form.tipo === "ingreso" ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO;
  const config = FRECUENCIAS[form.frecuencia];

  function cambiarTipo(tipo: "ingreso" | "gasto") {
    setForm((actual) => ({
      ...actual,
      tipo,
      categoria: tipo === "ingreso" ? "Aportación" : "Compra",
    }));
  }

  function cambiarFrecuencia(frecuencia: Frecuencia) {
    setForm((actual) => {
      if (usaDiaDelMes(frecuencia)) {
        return { ...actual, frecuencia, diaEjecucion: parseFechaISO(actual.fechaInicio).getDate() };
      }
      if (usaDiaDeSemana(frecuencia)) {
        return { ...actual, frecuencia, diaEjecucion: parseFechaISO(actual.fechaInicio).getDay() };
      }
      return { ...actual, frecuencia, diaEjecucion: null };
    });
  }

  async function guardar() {
    const importe = Number(form.importe.replace(",", "."));

    if (!form.nombre.trim()) {
      alert("Ponle un nombre al pago recurrente.");
      return;
    }

    if (!Number.isFinite(importe) || importe <= 0) {
      alert("Introduce un importe válido.");
      return;
    }

    if (!form.sinFin && !form.fechaFin) {
      alert("Indica una fecha de fin o marca que no la tiene.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        importe,
        categoria: form.categoria,
        descripcion: form.descripcion.trim() || null,
        persona: form.persona,
        fecha_inicio: form.fechaInicio,
        fecha_fin: form.sinFin ? null : form.fechaFin,
        frecuencia: form.frecuencia,
        dia_ejecucion: form.diaEjecucion,
        activo: pago?.activo ?? true,
        color: form.color || null,
        icono: form.icono.trim() || null,
      });
    } catch (error) {
      console.error(error);
      alert("No se ha podido guardar el pago recurrente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="animate-slideUp flex max-h-[94dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[36px] border border-white/10 bg-[#0b141e] shadow-2xl shadow-black/60 sm:rounded-[36px]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <p className="text-sm font-black text-emerald-300">
              {pago ? "Modificar pago recurrente" : "Nuevo pago recurrente"}
            </p>
            <h2 className="mt-1 text-2xl font-black">
              {pago ? "Editar datos" : "Registrar pago recurrente"}
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
          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Nombre
          </label>
          <input
            className="input"
            placeholder="Ej. Netflix, Alquiler, Gimnasio..."
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          />

          <div className="mb-4 grid grid-cols-2 gap-2 rounded-[22px] bg-white/[0.05] p-2">
            <button
              onClick={() => cambiarTipo("gasto")}
              className={`h-12 rounded-2xl font-black transition ${
                form.tipo === "gasto" ? "bg-rose-400 text-[#27070d]" : "text-slate-400"
              }`}
            >
              Gasto
            </button>
            <button
              onClick={() => cambiarTipo("ingreso")}
              className={`h-12 rounded-2xl font-black transition ${
                form.tipo === "ingreso" ? "bg-emerald-400 text-[#052e1f]" : "text-slate-400"
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
            Pagado por
          </label>
          <select
            className="input"
            value={form.persona}
            onChange={(e) => setForm({ ...form, persona: e.target.value })}
          >
            {PERSONAS.map((persona) => (
              <option key={persona}>{persona}</option>
            ))}
          </select>

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Descripción (opcional)
          </label>
          <input
            className="input"
            placeholder={form.nombre || "Detalle adicional"}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Frecuencia
          </label>
          <select
            className="input"
            value={form.frecuencia}
            onChange={(e) => cambiarFrecuencia(e.target.value as Frecuencia)}
          >
            {FRECUENCIAS_ORDEN.map((frecuencia) => (
              <option key={frecuencia} value={frecuencia}>
                {FRECUENCIAS[frecuencia].label}
              </option>
            ))}
          </select>

          {usaDiaDelMes(form.frecuencia) && (
            <>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Día del mes
              </label>
              <input
                className="input"
                type="number"
                min={1}
                max={31}
                value={form.diaEjecucion ?? ""}
                onChange={(e) =>
                  setForm({ ...form, diaEjecucion: Number(e.target.value) || null })
                }
              />
            </>
          )}

          {usaDiaDeSemana(form.frecuencia) && (
            <>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Día de la semana
              </label>
              <select
                className="input"
                value={form.diaEjecucion ?? ""}
                onChange={(e) => setForm({ ...form, diaEjecucion: Number(e.target.value) })}
              >
                {DIAS_SEMANA.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Fecha de inicio
          </label>
          <input
            className="input"
            type="date"
            value={form.fechaInicio}
            onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
          />

          <label className="mb-3 flex items-center gap-3 text-sm font-bold text-slate-300">
            <input
              type="checkbox"
              className="h-5 w-5 accent-emerald-400"
              checked={form.sinFin}
              onChange={(e) => setForm({ ...form, sinFin: e.target.checked })}
            />
            No tiene fecha de fin
          </label>

          {!form.sinFin && (
            <>
              <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
                Fecha de fin
              </label>
              <input
                className="input"
                type="date"
                value={form.fechaFin}
                onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
              />
            </>
          )}

          <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-500">
            Icono (opcional)
          </label>
          <input
            className="input"
            placeholder="Ej. 🎬"
            maxLength={4}
            value={form.icono}
            onChange={(e) => setForm({ ...form, icono: e.target.value })}
          />

          <label className="mb-3 block text-xs font-black uppercase tracking-wider text-slate-500">
            Color (opcional)
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {COLORES_PRESET.map((color) => (
              <button
                key={color}
                aria-label={`Elegir color ${color}`}
                onClick={() => setForm({ ...form, color: form.color === color ? "" : color })}
                className="h-9 w-9 rounded-full transition"
                style={{
                  backgroundColor: color,
                  outline: form.color === color ? "3px solid white" : "none",
                  outlineOffset: 2,
                }}
              />
            ))}
          </div>

          <p className="mb-2 text-xs leading-relaxed text-slate-500">
            Se repite {frecuenciaEnPalabras(config.unidad, config.cantidad)}, contando desde la
            fecha de inicio.
          </p>

          {pago && onDelete && (
            <button
              onClick={onDelete}
              className="mt-2 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-rose-400/10 font-black text-rose-300 active:scale-[0.98]"
            >
              <Trash2 size={18} /> Eliminar pago recurrente
            </button>
          )}
        </div>

        <div className="border-t border-white/10 bg-[#0b141e]/95 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl">
          <button
            onClick={guardar}
            disabled={saving}
            className="h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#052e1f] shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-60"
          >
            {saving ? "Guardando..." : pago ? "Guardar cambios" : "Guardar pago recurrente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function frecuenciaEnPalabras(unidad: "dia" | "semana" | "mes", cantidad: number) {
  const nombres: Record<typeof unidad, [string, string]> = {
    dia: ["día", "días"],
    semana: ["semana", "semanas"],
    mes: ["mes", "meses"],
  };
  const [singular, plural] = nombres[unidad];

  return cantidad === 1 ? `cada ${singular}` : `cada ${cantidad} ${plural}`;
}
