import { Gasto } from "@/types/expense";

export const APORTACION_POR_PERSONA = 350;
export const FONDO_COMUN = APORTACION_POR_PERSONA * 2;

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

export function filtrarPorMes(gastos: Gasto[], mesActivo: Date) {
  const key = mesKey(mesActivo);
  return gastos.filter((g) => mesKey(new Date(g.fecha)) === key);
}