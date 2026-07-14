export type Movimiento = {
  id: string;
  fecha: string;
  tipo: "ingreso" | "gasto";
  importe: number;
  categoria: string;
  descripcion: string;
  persona: string;
  created_at?: string;
};

// Compatibilidad con componentes antiguos que todavía importan `Gasto`.
export type Gasto = Movimiento;
