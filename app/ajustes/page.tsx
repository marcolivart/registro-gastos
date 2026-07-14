"use client";

import { useState } from "react";
import { Check, Cloud, Smartphone, Sparkles, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { AppShell } from "@/components/ui/AppShell";
import { Card } from "@/components/ui/Card";
import { useMovimientos } from "@/hooks/useMovimientos";
import {
  APORTACION_POR_PERSONA,
  FONDO_MENSUAL,
  euro,
  mesKey,
} from "@/lib/helpers";
import { Movimiento } from "@/types/expense";

export default function AjustesPage() {
  const { movimientos, loading, crearMovimiento } = useMovimientos();
  const [generando, setGenerando] = useState(false);
  const hoy = new Date();
  const keyActual = mesKey(hoy);

  const aportacionMarcExiste = movimientos.some(
    (m) =>
      mesKey(new Date(`${m.fecha}T12:00:00`)) === keyActual &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Marc"
  );
  const aportacionAlbaExiste = movimientos.some(
    (m) =>
      mesKey(new Date(`${m.fecha}T12:00:00`)) === keyActual &&
      m.tipo === "ingreso" &&
      m.categoria === "Aportación" &&
      m.persona === "Alba"
  );
  const completas = aportacionMarcExiste && aportacionAlbaExiste;

  async function generarAportaciones() {
    if (completas || generando) return;
    setGenerando(true);

    const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(
      2,
      "0"
    )}-01`;
    const pendientes: Omit<Movimiento, "id">[] = [];

    if (!aportacionMarcExiste) {
      pendientes.push({
        fecha,
        tipo: "ingreso",
        importe: APORTACION_POR_PERSONA,
        categoria: "Aportación",
        descripcion: "Aportación mensual Marc",
        persona: "Marc",
      });
    }

    if (!aportacionAlbaExiste) {
      pendientes.push({
        fecha,
        tipo: "ingreso",
        importe: APORTACION_POR_PERSONA,
        categoria: "Aportación",
        descripcion: "Aportación mensual Alba",
        persona: "Alba",
      });
    }

    try {
      for (const movimiento of pendientes) {
        await crearMovimiento(movimiento);
      }
    } catch (error) {
      console.error(error);
      alert("No se han podido generar las aportaciones.");
    } finally {
      setGenerando(false);
    }
  }

  return (
    <AppShell>
      <Header />

      <div className="mb-5">
        <p className="text-sm font-black text-emerald-300">Configuración</p>
        <h2 className="mt-1 text-3xl font-black">Ajustes</h2>
      </div>

      <Card className="mb-5">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
            <Users size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400">Fondo compartido</p>
            <h3 className="text-xl font-black">Marc & Alba</h3>
          </div>
        </div>

        <div className="space-y-4">
          <SettingLine label="Aportación Marc" value={euro(APORTACION_POR_PERSONA)} />
          <SettingLine label="Aportación Alba" value={euro(APORTACION_POR_PERSONA)} />
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <span className="font-bold text-slate-300">Total mensual</span>
            <strong className="text-xl text-emerald-300">{euro(FONDO_MENSUAL)}</strong>
          </div>
        </div>
      </Card>

      <Card className="mb-5 border-emerald-400/20 bg-emerald-400/10">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-[#052e1f]">
            {completas ? <Check size={23} strokeWidth={3} /> : <Sparkles size={23} />}
          </div>
          <div>
            <p className="text-sm font-black text-emerald-300">Aportaciones del mes</p>
            <h3 className="mt-1 text-xl font-black">
              {completas ? "Todo al día" : "Hay aportaciones pendientes"}
            </h3>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <StatusLine label="Marc" ready={aportacionMarcExiste} />
          <StatusLine label="Alba" ready={aportacionAlbaExiste} />
        </div>

        <button
          onClick={generarAportaciones}
          disabled={loading || completas || generando}
          className={`mt-5 h-14 w-full rounded-2xl font-black transition active:scale-[0.98] ${
            completas
              ? "bg-white/10 text-slate-500"
              : "bg-emerald-400 text-[#052e1f]"
          }`}
        >
          {generando
            ? "Generando..."
            : completas
              ? "Aportaciones ya creadas"
              : "Generar aportaciones"}
        </button>
      </Card>

      <Card className="mb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-400/15 text-sky-300">
            <Smartphone size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400">Acceso rápido</p>
            <h3 className="text-lg font-black">Atajo de iPhone conectado</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Los movimientos creados desde el Centro de Control se guardan en la misma tabla y aparecen automáticamente en la app.
        </p>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-300">
            <Cloud size={22} />
          </div>
          <div>
            <p className="text-sm font-black text-slate-400">Sincronización</p>
            <h3 className="text-lg font-black">Supabase + Vercel</h3>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          Los datos se sincronizan entre dispositivos. El saldo acumulado se calcula con todos los ingresos y gastos registrados.
        </p>
      </Card>

      <BottomNavigation />
    </AppShell>
  );
}

function SettingLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusLine({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.08] p-4">
      <span className="font-bold text-slate-300">{label}</span>
      <span className={ready ? "font-black text-emerald-300" : "font-black text-amber-300"}>
        {ready ? "✓ Creada" : euro(APORTACION_POR_PERSONA)}
      </span>
    </div>
  );
}
