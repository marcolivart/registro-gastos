"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { NuevoPagoRecurrente, PagoRecurrente } from "@/types/recurrente";

export function usePagosRecurrentes() {
  const [pagos, setPagos] = useState<PagoRecurrente[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarPagos = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("pagos_recurrentes")
      .select("*")
      .order("fecha_inicio", { ascending: true });

    if (error) {
      console.error("Error cargando pagos recurrentes:", error);
      setPagos([]);
    } else {
      setPagos((data || []) as PagoRecurrente[]);
    }

    setLoading(false);
  }, []);

  async function crearPago(pago: NuevoPagoRecurrente) {
    const { error } = await supabase.from("pagos_recurrentes").insert(pago);
    if (error) throw error;
    await cargarPagos();
  }

  async function actualizarPago(id: string, pago: NuevoPagoRecurrente) {
    const { error } = await supabase
      .from("pagos_recurrentes")
      .update(pago)
      .eq("id", id);

    if (error) throw error;
    await cargarPagos();
  }

  async function eliminarPago(id: string) {
    const { error } = await supabase.from("pagos_recurrentes").delete().eq("id", id);
    if (error) throw error;
    await cargarPagos();
  }

  async function pausarPago(id: string) {
    const { error } = await supabase
      .from("pagos_recurrentes")
      .update({ activo: false })
      .eq("id", id);

    if (error) throw error;
    await cargarPagos();
  }

  async function activarPago(id: string) {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().slice(0, 10);

    // Al reactivar, el cursor salta a "ayer": el motor no recupera lo que
    // se saltó durante la pausa, retoma desde la próxima fecha a partir de hoy.
    const { error } = await supabase
      .from("pagos_recurrentes")
      .update({ activo: true, fecha_ultima_generacion: fechaAyer })
      .eq("id", id);

    if (error) throw error;
    await cargarPagos();
  }

  async function duplicarPago(pago: PagoRecurrente) {
    const copia: NuevoPagoRecurrente = {
      nombre: `${pago.nombre} (copia)`,
      tipo: pago.tipo,
      importe: pago.importe,
      categoria: pago.categoria,
      descripcion: pago.descripcion,
      persona: pago.persona,
      fecha_inicio: pago.fecha_inicio,
      fecha_fin: pago.fecha_fin,
      frecuencia: pago.frecuencia,
      dia_ejecucion: pago.dia_ejecucion,
      activo: false,
      color: pago.color,
      icono: pago.icono,
    };

    const { error } = await supabase.from("pagos_recurrentes").insert(copia);
    if (error) throw error;
    await cargarPagos();
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarPagos();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [cargarPagos]);

  useEffect(() => {
    function handleActualizados() {
      void cargarPagos();
    }

    window.addEventListener("movimientos:actualizados", handleActualizados);
    return () =>
      window.removeEventListener("movimientos:actualizados", handleActualizados);
  }, [cargarPagos]);

  return {
    pagos,
    loading,
    crearPago,
    actualizarPago,
    eliminarPago,
    pausarPago,
    activarPago,
    duplicarPago,
    cargarPagos,
  };
}
