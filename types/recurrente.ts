export type Frecuencia =
  | "diario"
  | "semanal"
  | "quincenal"
  | "mensual"
  | "bimestral"
  | "trimestral"
  | "semestral"
  | "anual";

export type PagoRecurrente = {
  id: string;
  nombre: string;
  tipo: "ingreso" | "gasto";
  importe: number;
  categoria: string;
  descripcion: string | null;
  persona: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  frecuencia: Frecuencia;
  dia_ejecucion: number | null;
  activo: boolean;
  fecha_ultima_generacion: string | null;
  color: string | null;
  icono: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NuevoPagoRecurrente = Omit<
  PagoRecurrente,
  "id" | "fecha_ultima_generacion" | "created_at" | "updated_at"
>;
