"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { InsightBox } from "@/components/dashboard/InsightBox";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { MonthSelector } from "@/components/shared/MonthSelector";
import { useExpenses } from "@/hooks/useExpenses";
import { FONDO_COMUN, filtrarPorMes } from "@/lib/helpers";

export default function Home() {
  const { gastos, loading } = useExpenses();
  const [mesActivo, setMesActivo] = useState(new Date());

  function cambiarMes(offset: number) {
    const nuevoMes = new Date(mesActivo);
    nuevoMes.setMonth(nuevoMes.getMonth() + offset);
    setMesActivo(nuevoMes);
  }

  const gastosMes = filtrarPorMes(gastos, mesActivo);
  const total = gastosMes.reduce((acc, g) => acc + Number(g.importe), 0);
  const disponible = FONDO_COMUN - total;
  const porcentaje = Math.min((total / FONDO_COMUN) * 100, 100);

  const marc = gastosMes
    .filter((g) => g.pagado_por === "Marc")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const alba = gastosMes
    .filter((g) => g.pagado_por === "Alba")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const conjunta = gastosMes
    .filter((g) => g.pagado_por === "Conjunta")
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const ultimos = gastosMes.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#05080d] text-white">
      <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[radial-gradient(circle_at_top,_#12352c,_#05080d_45%)] px-5 pb-28 pt-6">
        <Header />

        <MonthSelector mesActivo={mesActivo} onChange={cambiarMes} />

        <section className="mb-5 flex items-center justify-between rounded-[26px] border border-white/10 bg-white/[0.06] p-4">
          <div>
            <p className="text-xs font-bold text-slate-400">Acción rápida</p>
            <p className="text-lg font-black">Añadir nuevo gasto</p>
          </div>

          <Link
            href="/gastos"
            className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-emerald-300 active:scale-95"
          >
            Añadir
          </Link>
        </section>

        {loading ? (
          <section className="mb-5 rounded-[40px] bg-white/10 p-6">
            <p className="text-slate-400">Cargando datos...</p>
          </section>
        ) : (
          <>
            <DashboardHero
              total={total}
              disponible={disponible}
              porcentaje={porcentaje}
            />

            <InsightBox disponible={disponible} porcentaje={porcentaje} />

            <QuickStats marc={marc} alba={alba} conjunta={conjunta} />

            <RecentExpenses gastos={ultimos} />
          </>
        )}

        <BottomNavigation />
      </div>
    </main>
  );
}