"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Gasto } from "@/types/expense";

export function useExpenses() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function crearGasto(gasto: Omit<Gasto, "id">) {
    const { error } = await supabase.from("gastos").insert(gasto);
    if (error) throw error;
    await cargarGastos();
  }

  async function actualizarGasto(id: string, gasto: Omit<Gasto, "id">) {
    const { error } = await supabase.from("gastos").update(gasto).eq("id", id);
    if (error) throw error;
    await cargarGastos();
  }

  async function eliminarGasto(id: string) {
    const { error } = await supabase.from("gastos").delete().eq("id", id);
    if (error) throw error;
    await cargarGastos();
  }

  useEffect(() => {
    cargarGastos();
  }, []);

  return {
    gastos,
    loading,
    crearGasto,
    actualizarGasto,
    eliminarGasto,
    cargarGastos,
  };
}