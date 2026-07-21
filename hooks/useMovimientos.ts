"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Movimiento } from "@/types/expense";

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarMovimientos = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando movimientos:", error);
      setMovimientos([]);
    } else {
      setMovimientos((data || []) as Movimiento[]);
    }

    setLoading(false);
  }, []);

  async function crearMovimiento(movimiento: Omit<Movimiento, "id">) {
    const { error } = await supabase.from("movimientos").insert(movimiento);
    if (error) throw error;
    await cargarMovimientos();
  }

  async function actualizarMovimiento(
    id: string,
    movimiento: Omit<Movimiento, "id">
  ) {
    const { error } = await supabase
      .from("movimientos")
      .update(movimiento)
      .eq("id", id);

    if (error) throw error;
    await cargarMovimientos();
  }

  async function eliminarMovimiento(id: string) {
    const { error } = await supabase.from("movimientos").delete().eq("id", id);
    if (error) throw error;
    await cargarMovimientos();
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void cargarMovimientos();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [cargarMovimientos]);

  useEffect(() => {
    function handleActualizados() {
      void cargarMovimientos();
    }

    window.addEventListener("movimientos:actualizados", handleActualizados);
    return () =>
      window.removeEventListener("movimientos:actualizados", handleActualizados);
  }, [cargarMovimientos]);

  return {
    movimientos,
    loading,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
    cargarMovimientos,
  };
}
