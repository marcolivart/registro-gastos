import { Movimiento } from "@/types/expense";

export const APORTACION_POR_PERSONA = 350;
export const FONDO_MENSUAL = APORTACION_POR_PERSONA * 2;

export function euro(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
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

export function iconoCategoria(categoria: string) {
  const iconos: Record<string, string> = {
    Aportación: "💚",
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

export function filtrarPorMes(movimientos: Movimiento[], mesActivo: Date) {
  const key = mesKey(mesActivo);
  return movimientos.filter((m) => mesKey(new Date(m.fecha)) === key);
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

  const hastaMes = movimientos.filter((m) => new Date(m.fecha) <= finMes);
  return calcularSaldo(hastaMes);
}