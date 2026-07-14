import { Movimiento } from "@/types/expense";

export const APORTACION_POR_PERSONA = 350;
export const FONDO_MENSUAL = APORTACION_POR_PERSONA * 2;

export const PERSONAS = ["Marc", "Alba", "Conjunta"] as const;

export const CATEGORIAS_GASTO = [
  "Compra",
  "Alquiler",
  "Luz",
  "Agua",
  "Internet",
  "Ocio",
  "Transporte",
  "Limpieza",
  "Hogar",
  "Otros",
] as const;

export function euro(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function fechaMovimiento(fecha: string) {
  const [year, month, day] = fecha.slice(0, 10).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function mesKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function nombreMes(date: Date) {
  return date.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
}

export function nombreMesCorto(date: Date) {
  return date
    .toLocaleDateString("es-ES", { month: "short" })
    .replace(".", "")
    .slice(0, 3);
}

export function desplazarMes(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export function iconoCategoria(categoria: string) {
  const iconos: Record<string, string> = {
    Aportación: "💚",
    Ingreso: "💚",
    Nómina: "💰",
    Devolución: "↩️",
    "Ingreso extra": "✨",
    Compra: "🛒",
    Alquiler: "🏠",
    Luz: "⚡",
    Agua: "💧",
    Internet: "📶",
    Ocio: "🎮",
    Transporte: "🚗",
    Limpieza: "🧼",
    Hogar: "🛋️",
    Otros: "📦",
  };

  return iconos[categoria] || "📦";
}

export function colorCategoria(categoria: string) {
  const colores: Record<string, string> = {
    Compra: "#34d399",
    Alquiler: "#60a5fa",
    Luz: "#facc15",
    Agua: "#38bdf8",
    Internet: "#a78bfa",
    Ocio: "#fb7185",
    Transporte: "#fb923c",
    Limpieza: "#2dd4bf",
    Hogar: "#c084fc",
    Otros: "#94a3b8",
  };

  return colores[categoria] || "#94a3b8";
}

export function filtrarPorMes(movimientos: Movimiento[], mesActivo: Date) {
  const key = mesKey(mesActivo);
  return movimientos.filter((m) => mesKey(fechaMovimiento(m.fecha)) === key);
}

export function totalGastos(movimientos: Movimiento[]) {
  return movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce((acc, m) => acc + Number(m.importe), 0);
}

export function totalIngresos(movimientos: Movimiento[]) {
  return movimientos
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + Number(m.importe), 0);
}

export function calcularSaldo(movimientos: Movimiento[]) {
  return totalIngresos(movimientos) - totalGastos(movimientos);
}

export function calcularSaldoHastaMes(movimientos: Movimiento[], mesActivo: Date) {
  const finMes = new Date(
    mesActivo.getFullYear(),
    mesActivo.getMonth() + 1,
    0,
    23,
    59,
    59
  );

  const hastaMes = movimientos.filter(
    (m) => fechaMovimiento(m.fecha).getTime() <= finMes.getTime()
  );

  return calcularSaldo(hastaMes);
}

export function resumenMes(movimientos: Movimiento[], mesActivo: Date) {
  const delMes = filtrarPorMes(movimientos, mesActivo);
  const ingresos = totalIngresos(delMes);
  const gastos = totalGastos(delMes);

  return {
    movimientos: delMes,
    ingresos,
    gastos,
    balance: ingresos - gastos,
    cantidad: delMes.length,
  };
}

export function gastosPorCategoria(movimientos: Movimiento[]) {
  const mapa = movimientos
    .filter((m) => m.tipo === "gasto")
    .reduce<Record<string, number>>((acc, movimiento) => {
      acc[movimiento.categoria] =
        (acc[movimiento.categoria] || 0) + Number(movimiento.importe);
      return acc;
    }, {});

  return Object.entries(mapa)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

export function totalPorPersona(
  movimientos: Movimiento[],
  tipo?: "ingreso" | "gasto"
) {
  return PERSONAS.map((persona) => ({
    persona,
    total: movimientos
      .filter((m) => m.persona === persona && (!tipo || m.tipo === tipo))
      .reduce((acc, m) => acc + Number(m.importe), 0),
  }));
}

export function compararValores(actual: number, anterior: number) {
  const diferencia = actual - anterior;
  const porcentaje = anterior > 0 ? (diferencia / anterior) * 100 : actual > 0 ? 100 : 0;

  return {
    diferencia,
    porcentaje,
    direccion: diferencia > 0 ? "sube" : diferencia < 0 ? "baja" : "igual",
  } as const;
}

export function compararCategorias(
  movimientos: Movimiento[],
  mesActivo: Date
) {
  const actual = gastosPorCategoria(filtrarPorMes(movimientos, mesActivo));
  const anterior = gastosPorCategoria(
    filtrarPorMes(movimientos, desplazarMes(mesActivo, -1))
  );

  const nombres = Array.from(
    new Set([...actual.map((item) => item.categoria), ...anterior.map((item) => item.categoria)])
  );

  return nombres
    .map((categoria) => {
      const totalActual = actual.find((item) => item.categoria === categoria)?.total || 0;
      const totalAnterior = anterior.find((item) => item.categoria === categoria)?.total || 0;

      return {
        categoria,
        actual: totalActual,
        anterior: totalAnterior,
        ...compararValores(totalActual, totalAnterior),
      };
    })
    .sort((a, b) => b.actual - a.actual || b.anterior - a.anterior);
}

export function evolucionMensual(
  movimientos: Movimiento[],
  mesFinal: Date,
  cantidad = 6
) {
  return Array.from({ length: cantidad }, (_, index) => {
    const offset = index - (cantidad - 1);
    const mes = desplazarMes(mesFinal, offset);
    const resumen = resumenMes(movimientos, mes);

    return {
      mes,
      key: mesKey(mes),
      etiqueta: nombreMesCorto(mes),
      ingresos: resumen.ingresos,
      gastos: resumen.gastos,
      balance: resumen.balance,
      saldo: calcularSaldoHastaMes(movimientos, mes),
    };
  });
}

export function formatFechaCorta(fecha: string) {
  return fechaMovimiento(fecha).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  });
}
