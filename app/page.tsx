"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Gasto = {
  id: string;
  fecha: string;
  importe: number;
  categoria: string;
  descripcion: string;
  pagado_por: string;
};

const PRESUPUESTO = 1200;

function mesKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function nombreMes(date: Date) {
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

function euro(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function iconoCategoria(categoria: string) {
  const iconos: Record<string, string> = {
    Compra: "🛒",
    Alquiler: "🏠",
    Luz: "⚡",
    Agua: "💧",
    Internet: "📶",
    Ocio: "🎮",
    Transporte: "🚗",
    Limpieza: "🧼",
    Hogar: "🛋️",
    Otros: "📦",
  };

  return iconos[categoria] || "📦";
}

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Gasto | null>(null);
  const [loading, setLoading] = useState(true);
  const [mesActivo, setMesActivo] = useState(new Date());

  const [form, setForm] = useState({
    importe: "",
    categoria: "Compra",
    pagado_por: "Conjunta",
    descripcion: "",
    fecha: new Date().toISOString().slice(0, 10),
  });

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

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

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

    const { error } = await supabase.from("gastos").delete().eq("id", editing.id);

    if (error) {
      console.error(error);
      alert("Error eliminando gasto");
      return;
    }

    setEditing(null);
    setOpen(false);
    await cargarGastos();
  }

  const resumen = useMemo(() => {
    const mesActualKey = mesKey(mesActivo);

    const mesAnteriorDate = new Date(mesActivo);
    mesAnteriorDate.setMonth(mesAnteriorDate.getMonth() - 1);
    const mesAnteriorKey = mesKey(mesAnteriorDate);

    const gastosMes = gastos.filter((g) => mesKey(new Date(g.fecha)) === mesActualKey);
    const gastosMesAnterior = gastos.filter(
      (g) => mesKey(new Date(g.fecha)) === mesAnteriorKey
    );

    const totalMes = gastosMes.reduce((acc, g) => acc + Number(g.importe), 0);
    const totalAnterior = gastosMesAnterior.reduce(
      (acc, g) => acc + Number(g.importe),
      0
    );

    const diferencia = totalAnterior - totalMes;

    const categoriaTotal = (lista: Gasto[], categoria: string) =>
      lista
        .filter((g) => g.categoria === categoria)
        .reduce((acc, g) => acc + Number(g.importe), 0);

    const luzMes = categoriaTotal(gastosMes, "Luz");
    const luzAnterior = categoriaTotal(gastosMesAnterior, "Luz");

    const aguaMes = categoriaTotal(gastosMes, "Agua");
    const aguaAnterior = categoriaTotal(gastosMesAnterior, "Agua");

    const compraMes = categoriaTotal(gastosMes, "Compra");
    const compraAnterior = categoriaTotal(gastosMesAnterior, "Compra");

    const marcMes = gastosMes
      .filter((g) => g.pagado_por === "Marc")
      .reduce((acc, g) => acc + Number(g.importe), 0);

    const albaMes = gastosMes
      .filter((g) => g.pagado_por === "Alba")
      .reduce((acc, g) => acc + Number(g.importe), 0);

    const conjuntaMes = gastosMes
      .filter((g) => g.pagado_por === "Conjunta")
      .reduce((acc, g) => acc + Number(g.importe), 0);

    const categoriasResumen = gastosMes.reduce<Record<string, number>>((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Number(g.importe);
      return acc;
    }, {});

    const categoriasOrdenadas = Object.entries(categoriasResumen)
      .map(([categoria, total]) => ({ categoria, total }))
      .sort((a, b) => b.total - a.total);

    const topCategoria = categoriasOrdenadas[0];

    return {
      gastosMes,
      totalMes,
      totalAnterior,
      diferencia,
      restante: PRESUPUESTO - totalMes,
      porcentaje: Math.min((totalMes / PRESUPUESTO) * 100, 100),
      luzMes,
      luzAnterior,
      aguaMes,
      aguaAnterior,
      compraMes,
      compraAnterior,
      marcMes,
      albaMes,
      conjuntaMes,
      categoriasOrdenadas,
      topCategoria,
    };
  }, [gastos, mesActivo]);

  function comparativa(actual: number, anterior: number) {
    if (anterior === 0 && actual === 0) return "Sin datos";
    if (anterior === 0) return "Nuevo este mes";

    const diferencia = actual - anterior;

    if (diferencia === 0) return "Igual que el mes pasado";

    return diferencia > 0
      ? `+${euro(diferencia)} vs mes anterior`
      : `${euro(diferencia)} vs mes anterior`;
  }

  const insight =
    resumen.totalAnterior === 0
      ? "Aún no hay datos del mes anterior para comparar."
      : resumen.diferencia >= 0
      ? `Habéis gastado ${euro(resumen.diferencia)} menos que el mes pasado.`
      : `Habéis gastado ${euro(Math.abs(resumen.diferencia))} más que el mes pasado.`;

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <header className="mb-6 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-[24px] bg-emerald-400 text-2xl shadow-xl shadow-emerald-500/20">
            🏠
          </div>
          <div>
            <h1 className="text-2xl font-black leading-tight">Registro de Gastos</h1>
            <p className="text-sm font-semibold text-emerald-300">Marc & Alba</p>
          </div>
        </header>

        <section className="mb-5 flex items-center justify-between rounded-[24px] border border-white/10 bg-white/[0.06] p-3">
          <button
            onClick={() => cambiarMes(-1)}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl active:scale-95"
          >
            ‹
          </button>

          <div className="text-center">
            <p className="text-xs font-bold text-slate-400">Mes activo</p>
            <p className="text-lg font-black capitalize">{nombreMes(mesActivo)}</p>
          </div>

          <button
            onClick={() => cambiarMes(1)}
            className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-xl active:scale-95"
          >
            ›
          </button>
        </section>

        <section className="mb-5 rounded-[36px] bg-white p-6 text-[#071018] shadow-2xl shadow-emerald-500/20">
          <p className="text-sm font-black text-slate-500">Gastado este mes</p>

          <h2 className="mt-3 text-5xl font-black tracking-tight">
            {euro(resumen.totalMes)}
          </h2>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm font-black">
              <span>Presupuesto</span>
              <span>{PRESUPUESTO} €</span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                style={{ width: `${resumen.porcentaje}%` }}
              />
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-emerald-50 p-4">
            <p className="text-sm font-black text-emerald-700">
              {resumen.restante >= 0 ? "Vais genial 💚" : "Cuidado este mes ⚠️"}
            </p>
            <p className="mt-1 text-2xl font-black">
              {resumen.restante >= 0
                ? `${euro(resumen.restante)} disponibles`
                : `${euro(Math.abs(resumen.restante))} por encima`}
            </p>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-3 gap-3">
          <MiniCard
            icono="⚡"
            titulo="Luz"
            valor={euro(resumen.luzMes)}
            detalle={comparativa(resumen.luzMes, resumen.luzAnterior)}
          />
          <MiniCard
            icono="💧"
            titulo="Agua"
            valor={euro(resumen.aguaMes)}
            detalle={comparativa(resumen.aguaMes, resumen.aguaAnterior)}
          />
          <MiniCard
            icono="🛒"
            titulo="Compra"
            valor={euro(resumen.compraMes)}
            detalle={comparativa(resumen.compraMes, resumen.compraAnterior)}
          />
        </section>

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">Pagado por cuenta</p>

          <div className="space-y-3">
            <StatRow nombre="Marc" valor={resumen.marcMes} total={resumen.totalMes} />
            <StatRow nombre="Alba" valor={resumen.albaMes} total={resumen.totalMes} />
            <StatRow
              nombre="Conjunta"
              valor={resumen.conjuntaMes}
              total={resumen.totalMes}
            />
          </div>
        </section>

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="mb-4 text-sm font-black text-slate-400">Categorías del mes</p>

          {resumen.categoriasOrdenadas.length === 0 ? (
            <p className="text-sm text-slate-400">Todavía no hay datos este mes.</p>
          ) : (
            <div className="space-y-3">
              {resumen.categoriasOrdenadas.map((item) => (
                <StatRow
                  key={item.categoria}
                  nombre={`${iconoCategoria(item.categoria)} ${item.categoria}`}
                  valor={item.total}
                  total={resumen.totalMes}
                />
              ))}
            </div>
          )}
        </section>

        {resumen.topCategoria && (
          <section className="mb-8 rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-sm font-black text-emerald-300">Top categoría</p>
            <h3 className="mt-2 text-xl font-black">
              {iconoCategoria(resumen.topCategoria.categoria)}{" "}
              {resumen.topCategoria.categoria}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Es la categoría con más gasto este mes:{" "}
              <strong>{euro(resumen.topCategoria.total)}</strong>.
            </p>
          </section>
        )}

        <section className="mb-8 rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-black text-emerald-300">Insight del mes</p>
          <h3 className="mt-2 text-xl font-black">
            {loading ? "Cargando datos..." : insight}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Habéis usado el {resumen.porcentaje.toFixed(0)}% del presupuesto mensual.
          </p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">Movimientos del mes</h3>
            <p className="text-xs font-bold text-slate-400">Pulsa para editar</p>
          </div>

          <div className="space-y-3">
            {resumen.gastosMes.length === 0 && !loading && (
              <p className="text-slate-400">No hay gastos en este mes.</p>
            )}

            {resumen.gastosMes.map((gasto) => (
              <button
                key={gasto.id}
                onClick={() => abrirEditarGasto(gasto)}
                className="movement w-full cursor-pointer text-left transition active:scale-[0.98]"
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

function MiniCard({
  icono,
  titulo,
  valor,
  detalle,
}: {
  icono: string;
  titulo: string;
  valor: string;
  detalle: string;
}) {
  return (
    <div className="rounded-[24px] bg-white/10 p-3">
      <p className="text-lg">{icono}</p>
      <p className="mt-2 text-xs font-bold text-slate-400">{titulo}</p>
      <p className="mt-1 text-sm font-black">{valor}</p>
      <p className="mt-1 text-[11px] leading-tight text-emerald-300">{detalle}</p>
    </div>
  );
}

function StatRow({
  nombre,
  valor,
  total,
}: {
  nombre: string;
  valor: number;
  total: number;
}) {
  const porcentaje = total > 0 ? Math.round((valor / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-300">{nombre}</span>
        <span className="text-sm font-black">{euro(valor)}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${porcentaje}%` }}
        />
      </div>

      <p className="mt-1 text-xs text-slate-500">{porcentaje}% del total</p>
    </div>
  );
}