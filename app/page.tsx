"use client";

import { useState } from "react";

const gastos = [
  { nombre: "Mercadona", categoria: "Compra", importe: 42.35, pagado: "Conjunta", icono: "🛒" },
  { nombre: "Factura luz", categoria: "Luz", importe: 54.2, pagado: "Marc", icono: "⚡" },
  { nombre: "Internet", categoria: "Internet", importe: 29.9, pagado: "Alba", icono: "📶" },
];

export default function Home() {
  const [open, setOpen] = useState(false);

  const total = gastos.reduce((acc, g) => acc + g.importe, 0);
  const presupuesto = 1200;
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
            <h1 className="text-2xl font-black leading-tight">Registro de Gastos</h1>
            <p className="text-sm font-semibold text-emerald-300">Marc & Alba</p>
          </div>
        </header>

        <section className="mb-5 rounded-[36px] bg-white p-6 text-[#071018] shadow-2xl shadow-emerald-500/20">
          <p className="text-sm font-black text-slate-500">Gastado este mes</p>

          <div className="mt-3 flex items-end justify-between">
            <h2 className="text-5xl font-black tracking-tight">
              {total.toFixed(2).replace(".", ",")} €
            </h2>
          </div>

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
            <p className="text-sm font-black text-emerald-700">Vais genial 💚</p>
            <p className="mt-1 text-2xl font-black">
              {restante.toFixed(2).replace(".", ",")} € disponibles
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[32px] border border-white/10 bg-white/[0.06] p-4">
          <p className="mb-4 text-sm font-bold text-slate-400">Resumen rápido</p>

          <div className="grid grid-cols-3 gap-3">
            <MiniCard icono="⚡" titulo="Luz" valor="54,20 €" detalle="+6 €" />
            <MiniCard icono="💧" titulo="Agua" valor="0 €" detalle="Sin datos" />
            <MiniCard icono="🛒" titulo="Compra" valor="42,35 €" detalle="-18 €" />
          </div>
        </section>

        <section className="mb-8 rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-black text-emerald-300">Insight del mes</p>
          <h3 className="mt-2 text-xl font-black">Este mes vais por buen camino.</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Habéis usado solo el {porcentaje.toFixed(0)}% del presupuesto mensual.
            Si seguís así, cerraréis el mes por debajo del objetivo.
          </p>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-black">Últimos movimientos</h3>
            <button className="text-sm font-bold text-emerald-300">Ver todo</button>
          </div>

          <div className="space-y-3">
            {gastos.map((gasto, index) => (
              <div key={index} className="movement">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-xl">
                    {gasto.icono}
                  </div>
                  <div>
                    <p className="font-black">{gasto.nombre}</p>
                    <p className="text-sm text-slate-400">
                      {gasto.categoria} · {gasto.pagado}
                    </p>
                  </div>
                </div>

                <strong>{gasto.importe.toFixed(2).replace(".", ",")} €</strong>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-[30px] bg-emerald-400 text-5xl text-[#06110c] shadow-2xl shadow-emerald-500/40 transition active:scale-90"
        >
          +
        </button>

        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-[430px] animate-slideUp rounded-[36px] bg-[#101923] p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Nuevo movimiento</p>
                  <h2 className="text-2xl font-black">Añadir gasto</h2>
                </div>
                <button onClick={() => setOpen(false)} className="text-2xl">✕</button>
              </div>

              <input className="input" placeholder="Importe, ej: 32,50" />
              <select className="input">
                <option>Compra</option>
                <option>Alquiler</option>
                <option>Luz</option>
                <option>Agua</option>
                <option>Internet</option>
                <option>Ocio</option>
                <option>Otros</option>
              </select>
              <select className="input">
                <option>Conjunta</option>
                <option>Marc</option>
                <option>Alba</option>
              </select>
              <input className="input" placeholder="Descripción, ej: Mercadona" />
              <input className="input" type="date" />

              <button className="mt-3 h-14 w-full rounded-2xl bg-emerald-400 font-black text-[#06110c]">
                Guardar gasto
              </button>
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
      <p className="mt-1 text-xs text-emerald-300">{detalle}</p>
    </div>
  );
}