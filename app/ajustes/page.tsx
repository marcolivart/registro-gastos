import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  APORTACION_POR_PERSONA,
  FONDO_MENSUAL,
  euro,
} from "@/lib/helpers";

export default function AjustesPage() {
  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <h2 className="mb-5 text-3xl font-black">Ajustes</h2>

        <section className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5">
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

        <BottomNavigation />
      </div>
    </main>
  );
}