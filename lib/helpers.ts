import { Gasto } from "@/types/expense";

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

function inicioDeMes(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function finDeMes(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
}

function mesesEntre(inicio: Date, fin: Date) {
  return (
    (fin.getFullYear() - inicio.getFullYear()) * 12 +
    (fin.getMonth() - inicio.getMonth()) +
    1
  );
}

export function calcularFondoAcumulado(gastos: Gasto[], mesActivo: Date) {
  if (gastos.length === 0) {
    return {
      saldoAnterior: 0,
      aportacionMes: FONDO_MENSUAL,
      gastadoMes: 0,
      ahorroMes: FONDO_MENSUAL,
      fondoDisponible: FONDO_MENSUAL,
    };
  }

  const fechas = gastos.map((g) => new Date(g.fecha));
  const primeraFecha = new Date(Math.min(...fechas.map((f) => f.getTime())));

  const inicioFondo = inicioDeMes(primeraFecha);
  const inicioMesActivo = inicioDeMes(mesActivo);
  const finMesActivo = finDeMes(mesActivo);

  const mesesAcumulados = Math.max(mesesEntre(inicioFondo, inicioMesActivo), 1);

  const gastosHastaMesActivo = gastos
    .filter((g) => new Date(g.fecha) <= finMesActivo)
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const gastosAntesDelMes = gastos
    .filter((g) => new Date(g.fecha) < inicioMesActivo)
    .reduce((acc, g) => acc + Number(g.importe), 0);

  const gastosMes = filtrarPorMes(gastos, mesActivo);
  const gastadoMes = gastosMes.reduce((acc, g) => acc + Number(g.importe), 0);

  const saldoAnterior =
    Math.max(mesesAcumulados - 1, 0) * FONDO_MENSUAL - gastosAntesDelMes;

  const fondoDisponible = mesesAcumulados * FONDO_MENSUAL - gastosHastaMesActivo;

  return {
    saldoAnterior,
    aportacionMes: FONDO_MENSUAL,
    gastadoMes,
    ahorroMes: FONDO_MENSUAL - gastadoMes,
    fondoDisponible,
  };
}