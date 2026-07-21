import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fechasPendientes, formatFechaISO } from "@/lib/recurrencia";
import { PagoRecurrente } from "@/types/recurrente";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Se llama una vez al abrir la app (ver RecurringPaymentsGenerator). Recorre
// los pagos recurrentes activos y genera en `movimientos` todo lo pendiente
// desde su cursor (fecha_ultima_generacion) hasta hoy, aunque hayan pasado
// meses sin abrir la app. El constraint UNIQUE(recurrente_id, fecha) en la
// base de datos es la red de seguridad final contra duplicados.
export async function POST() {
  try {
    const { data: pagos, error: errorPagos } = await supabase
      .from("pagos_recurrentes")
      .select("*")
      .eq("activo", true);

    if (errorPagos) {
      return NextResponse.json(
        { ok: false, error: errorPagos.message },
        { status: 500 }
      );
    }

    const hoy = new Date();
    let generados = 0;

    for (const pago of (pagos || []) as PagoRecurrente[]) {
      const fechas = fechasPendientes(pago, hoy);
      if (fechas.length === 0) continue;

      const movimientos = fechas.map((fecha) => ({
        fecha: formatFechaISO(fecha),
        tipo: pago.tipo,
        importe: pago.importe,
        categoria: pago.categoria,
        descripcion: pago.descripcion || pago.nombre,
        persona: pago.persona,
        recurrente_id: pago.id,
      }));

      const { error: errorInsert } = await supabase
        .from("movimientos")
        .upsert(movimientos, {
          onConflict: "recurrente_id,fecha",
          ignoreDuplicates: true,
        });

      if (errorInsert) {
        console.error(`Error generando movimientos para ${pago.nombre}:`, errorInsert);
        continue;
      }

      generados += movimientos.length;

      const ultimaFecha = formatFechaISO(fechas[fechas.length - 1]);
      const { error: errorCursor } = await supabase
        .from("pagos_recurrentes")
        .update({ fecha_ultima_generacion: ultimaFecha })
        .eq("id", pago.id);

      if (errorCursor) {
        console.error(`Error actualizando cursor de ${pago.nombre}:`, errorCursor);
      }
    }

    return NextResponse.json({ ok: true, generados });
  } catch (error) {
    console.error("Error generando pagos recurrentes:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno generando pagos recurrentes" },
      { status: 500 }
    );
  }
}
