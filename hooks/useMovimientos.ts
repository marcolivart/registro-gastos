"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Movimiento } from "@/types/expense";

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);

  async function cargarMovimientos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      console.error(error);
      alert("Error cargando movimientos");
    } else {
      setMovimientos(data || []);
    }

    setLoading(false);
  }

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
    cargarMovimientos();
  }, []);

  return {
    movimientos,
    loading,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
    cargarMovimientos,
  };
}