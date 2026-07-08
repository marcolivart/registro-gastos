"use client";

import { useEffect, useState } from "react";
import { Gasto } from "@/types/expense";

type Props = {
  open: boolean;
  gasto?: Gasto | null;
  onClose: () => void;
  onSave: (gasto: Omit<Gasto, "id">) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function ExpenseModal({ open, gasto, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState({
    importe: "",
    categoria: "Compra",
    pagado_por: "Conjunta",
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (gasto) {
      setForm({
        importe: String(gasto.importe).replace(".", ","),
        categoria: gasto.categoria,
        pagado_por: gasto.pagado_por,
        descripcion: gasto.descripcion,
        fecha: gasto.fecha,
      });
    } else {
      setForm({
        importe: "",
        categoria: "Compra",
        pagado_por: "Conjunta",
        descripcion: "",
        fecha: new Date().toISOString().slice(0, 10),
      });
    }
  }, [gasto, open]);

  if (!open) return null;

  async function guardar() {
    const importe = Number(form.importe.replace(",", "."));

    if (!importe || importe <= 0) {
      alert("Pon un importe válido");
      return;
    }

    await onSave({
      fecha: form.fecha,
      importe,
      categoria: form.categoria,
      descripcion: form.descripcion || "Sin descripción",
      pagado_por: form.pagado_por,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[430px] max-h-[85vh] overflow-y-auto rounded-[36px] bg-[#101923] p-5 pb-28 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-300">
              {gasto ? "Modificar movimiento" : "Nuevo movimiento"}
            </p>
            <h2 className="text-2xl font-black">
              {gasto ? "Editar gasto" : "Añadir gasto"}
            </h2>
          </div>

          <button onClick={onClose} className="text-2xl">
            ✕
          </button>
        </div>

        <input
          className="input"
          placeholder="Importe, ej: 32,50"
          value={form.importe}
          onChange={(e) => setForm({ ...form, importe: e.target.value })}
        />

        <select
          className="input"
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
        >
          <option>Compra</option>
          <option>Alquiler</option>
          <option>Luz</option>
          <option>Agua</option>
          <option>Internet</option>
          <option>Ocio</option>
          <option>Transporte</option>
          <option>Limpieza</option>
          <option>Hogar</option>
          <option>Otros</option>
        </select>

        <select
          className="input"
          value={form.pagado_por}
          onChange={(e) => setForm({ ...form, pagado_por: e.target.value })}
        >
          <option>Conjunta</option>
          <option>Marc</option>
          <option>Alba</option>
        </select>

        <input
          className="input"
          placeholder="Descripción, ej: Mercadona"
          value={form.descripcion}
          onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
        />

        <input
          className="input"
          type="date"
          value={form.fecha}
          onChange={(e) => setForm({ ...form, fecha: e.target.value })}
        />

        <button
          onClick={guardar}
          className="mt-3 h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#06110c]"
        >
          {gasto ? "Guardar cambios" : "Guardar gasto"}
        </button>

        {gasto && onDelete && (
          <button
            onClick={onDelete}
            className="mt-3 h-14 w-full rounded-2xl bg-red-500 font-black text-white"
          >
            Eliminar gasto
          </button>
        )}
      </div>
    </div>
  );
}