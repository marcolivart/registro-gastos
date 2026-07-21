import { Frecuencia, PagoRecurrente } from "@/types/recurrente";

type Unidad = "dia" | "semana" | "mes";

type FrecuenciaConfig = {
  label: string;
  unidad: Unidad;
  cantidad: number;
};

// Añadir una frecuencia nueva es añadir una entrada aquí: el resto del
// motor (siguienteFecha, fechasPendientes...) no necesita cambios.
export const FRECUENCIAS: Record<Frecuencia, FrecuenciaConfig> = {
  diario: { label: "Diario", unidad: "dia", cantidad: 1 },
  semanal: { label: "Semanal", unidad: "semana", cantidad: 1 },
  quincenal: { label: "Cada 2 semanas", unidad: "semana", cantidad: 2 },
  mensual: { label: "Mensual", unidad: "mes", cantidad: 1 },
  bimestral: { label: "Cada 2 meses", unidad: "mes", cantidad: 2 },
  trimestral: { label: "Trimestral", unidad: "mes", cantidad: 3 },
  semestral: { label: "Semestral", unidad: "mes", cantidad: 6 },
  anual: { label: "Anual", unidad: "mes", cantidad: 12 },
};

export const FRECUENCIAS_ORDEN = Object.keys(FRECUENCIAS) as Frecuencia[];

export const DIAS_SEMANA = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
] as const;

const LIMITE_GENERACION = 2000;

export function usaDiaDelMes(frecuencia: Frecuencia) {
  return FRECUENCIAS[frecuencia].unidad === "mes";
}

export function usaDiaDeSemana(frecuencia: Frecuencia) {
  return FRECUENCIAS[frecuencia].unidad === "semana";
}

export function parseFechaISO(fecha: string): Date {
  const [year, month, day] = fecha.slice(0, 10).split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatFechaISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function ultimoDiaDelMes(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function conDiaDelMes(date: Date, dia: number): Date {
  const diaSeguro = Math.min(
    Math.max(dia, 1),
    ultimoDiaDelMes(date.getFullYear(), date.getMonth())
  );
  return new Date(date.getFullYear(), date.getMonth(), diaSeguro);
}

function sumarDias(date: Date, cantidad: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + cantidad);
}

function sumarMeses(date: Date, cantidad: number, diaEjecucion: number | null): Date {
  const base = new Date(date.getFullYear(), date.getMonth() + cantidad, 1);
  return conDiaDelMes(base, diaEjecucion ?? date.getDate());
}

type PagoParaFecha = Pick<PagoRecurrente, "fecha_inicio" | "frecuencia" | "dia_ejecucion">;

export function primeraFecha(pago: PagoParaFecha): Date {
  const inicio = parseFechaISO(pago.fecha_inicio);

  if (usaDiaDelMes(pago.frecuencia) && pago.dia_ejecucion) {
    return conDiaDelMes(inicio, pago.dia_ejecucion);
  }

  if (usaDiaDeSemana(pago.frecuencia) && pago.dia_ejecucion !== null && pago.dia_ejecucion !== undefined) {
    const diferencia = (pago.dia_ejecucion - inicio.getDay() + 7) % 7;
    return sumarDias(inicio, diferencia);
  }

  return inicio;
}

export function siguienteFecha(
  fecha: Date,
  frecuencia: Frecuencia,
  diaEjecucion: number | null
): Date {
  const config = FRECUENCIAS[frecuencia];

  if (config.unidad === "dia") return sumarDias(fecha, config.cantidad);
  if (config.unidad === "semana") return sumarDias(fecha, config.cantidad * 7);
  return sumarMeses(fecha, config.cantidad, diaEjecucion);
}

type PagoParaCalculo = Pick<
  PagoRecurrente,
  "fecha_inicio" | "fecha_fin" | "frecuencia" | "dia_ejecucion" | "fecha_ultima_generacion"
>;

function cursorInicial(pago: PagoParaCalculo): Date {
  return pago.fecha_ultima_generacion
    ? siguienteFecha(
        parseFechaISO(pago.fecha_ultima_generacion),
        pago.frecuencia,
        pago.dia_ejecucion
      )
    : primeraFecha(pago);
}

/** Todas las fechas pendientes de generar, desde el cursor hasta `hasta` (inclusive). */
export function fechasPendientes(pago: PagoParaCalculo, hasta: Date): Date[] {
  const limite = pago.fecha_fin
    ? minFecha(hasta, parseFechaISO(pago.fecha_fin))
    : hasta;

  let cursor = cursorInicial(pago);
  const fechas: Date[] = [];

  while (cursor.getTime() <= limite.getTime() && fechas.length < LIMITE_GENERACION) {
    fechas.push(cursor);
    cursor = siguienteFecha(cursor, pago.frecuencia, pago.dia_ejecucion);
  }

  return fechas;
}

/** Próxima fecha (pasada o futura) que le tocaría generar a este pago, o null si ya superó fecha_fin. */
export function proximaFecha(pago: PagoParaCalculo): Date | null {
  const cursor = cursorInicial(pago);

  if (pago.fecha_fin && cursor.getTime() > parseFechaISO(pago.fecha_fin).getTime()) {
    return null;
  }

  return cursor;
}

function minFecha(a: Date, b: Date): Date {
  return a.getTime() <= b.getTime() ? a : b;
}
