"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Gasto = {
  id: string;
  fecha: string;
  importe: number;
  categoria: string;
  descripcion: string;
  pagado_por: string;
};

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    importe: "",
    categoria: "Compra",
    pagado_por: "Conjunta",
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
  });

  const presupuesto = 1200;

  async function cargarGastos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error(error);
      alert("Error cargando gastos");
    } else {
      setGastos(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    cargarGastos();
  }, []);

  function abrirNuevoGasto() {
    setEditing(null);
    setForm({
      importe: "",
      categoria: "Compra",
      pagado_por: "Conjunta",
      descripcion: "",
      fecha: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  }

  function abrirEditarGasto(gasto: Gasto) {
    setEditing(gasto);
    setForm({
      importe: String(gasto.importe).replace(".", ","),
      categoria: gasto.categoria,
      pagado_por: gasto.pagado_por,
      descripcion: gasto.descripcion,
      fecha: gasto.fecha,
    });
    setOpen(true);
  }

  async function guardarGasto() {
    const importe = Number(form.importe.replace(",", "."));

    if (!importe || importe <= 0) {
      alert("Pon un importe válido");
      return;
    }

    const { error } = await supabase.from("gastos").insert({
      fecha: form.fecha,
      importe,
      categoria: form.categoria,
      descripcion: form.descripcion || "Sin descripción",
      pagado_por: form.pagado_por,
    });

    if (error) {
      console.error(error);
      alert("Error guardando gasto");
      return;
    }

    setOpen(false);
    await cargarGastos();
  }

  async function actualizarGasto() {
    if (!editing) return;

    const importe = Number(form.importe.replace(",", "."));

    if (!importe || importe <= 0) {
      alert("Pon un importe válido");
      return;
    }

    const { error } = await supabase
      .from("gastos")
      .update({
        fecha: form.fecha,
        importe,
        categoria: form.categoria,
        descripcion: form.descripcion || "Sin descripción",
        pagado_por: form.pagado_por,
      })
      .eq("id", editing.id);

    if (error) {
      console.error(error);
      alert("Error actualizando gasto");
      return;
    }

    setEditing(null);
    setOpen(false);
    await cargarGastos();
  }

  async function eliminarGasto() {
    if (!editing) return;

    const confirmar = confirm("¿Seguro que quieres eliminar este gasto?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("gastos")
      .delete()
      .eq("id", editing.id);

    if (error) {
      console.error(error);
      alert("Error eliminando gasto");
      return;
    }

    setEditing(null);
    setOpen(false);
    await cargarGastos();
  }

  const total = gastos.reduce((acc, g) => acc + Number(g.importe), 0);
  const restante = presupuesto - total;
  const porcentaje = Math.min((total / presupuesto) * 100, 100);

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <header className="mb-7 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-[24px] bg-emerald-400 text-2xl shadow-xl shadow-emerald-500/20">
            🏠
          </div>
          <div>
            <h1 className="text-2xl font-black leading-tight">
              Registro de Gastos
            </h1>
            <p className="text-sm font-semibold text-emerald-300">
              Marc & Alba
            </p>
          </div>
        </header>

        <section className="mb-5 rounded-[36px] bg-white p-6 text-[#071018] shadow-2xl shadow-emerald-500/20">
          <p className="text-sm font-black text-slate-500">Gastado este mes</p>

          <h2 className="mt-3 text-5xl font-black tracking-tight">
            {total.toFixed(2).replace(".", ",")} €
          </h2>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm font-black">
              <span>Presupuesto</span>
              <span>{presupuesto} €</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-700">
              Vais genial 💚
            </p>
            <p className="mt-1 text-2xl font-black">
              {restante.toFixed(2).replace(".", ",")} € disponibles
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-black text-emerald-300">Insight del mes</p>
          <h3 className="mt-2 text-xl font-black">
            {loading ? "Cargando datos..." : "Este mes vais por buen camino."}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Habéis usado el {porcentaje.toFixed(0)}% del presupuesto mensual.
          </p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">Últimos movimientos</h3>
            <p className="text-xs font-bold text-slate-400">
              Pulsa para editar
            </p>
          </div>

          <div className="space-y-3">
            {gastos.length === 0 && !loading && (
              <p className="text-slate-400">Todavía no hay gastos guardados.</p>
            )}

            {gastos.map((gasto) => (
              <button
                key={gasto.id}
                onClick={() => abrirEditarGasto(gasto)}
                className="movement w-full cursor-pointer text-left transition active:scale-[0.98]"
              >
                <div>
                  <p className="font-black">{gasto.descripcion}</p>
                  <p className="text-sm text-slate-400">
                    {gasto.categoria} · {gasto.pagado_por}
                  </p>
                </div>

                <strong>
                  {Number(gasto.importe).toFixed(2).replace(".", ",")} €
                </strong>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={abrirNuevoGasto}
          className="fixed bottom-6 left-1/2 z-40 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-[30px] bg-emerald-400 text-5xl text-[#06110c] shadow-2xl shadow-emerald-500/40 transition active:scale-90"
        >
          +
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[430px] animate-slideUp rounded-[36px] bg-[#101923] p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-300">
                    {editing ? "Modificar movimiento" : "Nuevo movimiento"}
                  </p>
                  <h2 className="text-2xl font-black">
                    {editing ? "Editar gasto" : "Añadir gasto"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setOpen(false);
                    setEditing(null);
                  }}
                  className="text-2xl"
                >
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
                onChange={(e) =>
                  setForm({ ...form, categoria: e.target.value })
                }
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
                onChange={(e) =>
                  setForm({ ...form, pagado_por: e.target.value })
                }
              >
                <option>Conjunta</option>
                <option>Marc</option>
                <option>Alba</option>
              </select>

              <input
                className="input"
                placeholder="Descripción, ej: Mercadona"
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />

              <input
                className="input"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />

              <button
                onClick={editing ? actualizarGasto : guardarGasto}
                className="mt-3 h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#06110c]"
              >
                {editing ? "Guardar cambios" : "Guardar gasto"}
              </button>

              {editing && (
                <button
                  onClick={eliminarGasto}
                  className="mt-3 h-14 w-full rounded-2xl bg-red-500 font-black text-white"
                >
                  Eliminar gasto
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}