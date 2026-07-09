"use client";

import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  APORTACION_POR_PERSONA,
  FONDO_MENSUAL,
  euro,
  mesKey,
} from "@/lib/helpers";

export default function AjustesPage() {
  const { movimientos, loading, crearMovimiento } = useMovimientos();

  const hoy = new Date();
  const fechaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const mesActualKey = mesKey(hoy);

  const aportacionMarcExiste = movimientos.some(
    (m) =>
      mesKey(new Date(m.fecha)) === mesActualKey &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Marc"
  );

  const aportacionAlbaExiste = movimientos.some(
    (m) =>
      mesKey(new Date(m.fecha)) === mesActualKey &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Alba"
  );

  const aportacionesCompletas = aportacionMarcExiste && aportacionAlbaExiste;

  async function generarAportaciones() {
    if (aportacionesCompletas) {
      alert("Las aportaciones de este mes ya están creadas.");
      return;
    }

    if (!aportacionMarcExiste) {
      await crearMovimiento({
        fecha: fechaMes,
        tipo: "ingreso",
        importe: APORTACION_POR_PERSONA,
        categoria: "Aportación",
        descripcion: "Aportación mensual Marc",
        persona: "Marc",
      });
    }

    if (!aportacionAlbaExiste) {
      await crearMovimiento({
        fecha: fechaMes,
        tipo: "ingreso",
        importe: APORTACION_POR_PERSONA,
        categoria: "Aportación",
        descripcion: "Aportación mensual Alba",
        persona: "Alba",
      });
    }

    alert("Aportaciones del mes creadas correctamente.");
  }

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <h2 className="mb-5 text-3xl font-black">Ajustes</h2>

        <section className="mb-5 rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
          <p className="text-sm font-black text-emerald-300">
            Configuración del fondo
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">Aportación Marc</span>
              <strong>{euro(APORTACION_POR_PERSONA)}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Aportación Alba</span>
              <strong>{euro(APORTACION_POR_PERSONA)}</strong>
            </div>

            <div className="flex justify-between border-t border-white/10 pt-4">
              <span className="text-slate-400">Aportación mensual</span>
              <strong className="text-emerald-300">{euro(FONDO_MENSUAL)}</strong>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-5">
          <p className="text-sm font-black text-emerald-300">
            Aportaciones del mes
          </p>

          <h3 className="mt-2 text-2xl font-black">
            {aportacionesCompletas
              ? "Aportaciones creadas"
              : "Generar aportaciones"}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Esto añadirá automáticamente dos ingresos al fondo: Marc{" "}
            {euro(APORTACION_POR_PERSONA)} y Alba {euro(APORTACION_POR_PERSONA)}.
          </p>

          <div className="mt-5 space-y-3">
            <div className="flex justify-between rounded-2xl bg-white/10 p-4">
              <span className="text-slate-300">Marc</span>
              <strong>
                {aportacionMarcExiste ? "✅ Creada" : euro(APORTACION_POR_PERSONA)}
              </strong>
            </div>

            <div className="flex justify-between rounded-2xl bg-white/10 p-4">
              <span className="text-slate-300">Alba</span>
              <strong>
                {aportacionAlbaExiste ? "✅ Creada" : euro(APORTACION_POR_PERSONA)}
              </strong>
            </div>
          </div>

          <button
            onClick={generarAportaciones}
            disabled={loading || aportacionesCompletas}
            className={`mt-5 h-14 w-full rounded-2xl font-black ${
              aportacionesCompletas
                ? "bg-white/10 text-slate-400"
                : "bg-emerald-400 text-[#06110c]"
            }`}
          >
            {aportacionesCompletas
              ? "Aportaciones ya generadas"
              : "Generar aportaciones del mes"}
          </button>
        </section>

        <BottomNavigation />
      </div>
    </main>
  );
}