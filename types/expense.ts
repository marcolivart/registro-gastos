export type Movimiento = {
  id: string;
  fecha: string;
  tipo: "ingreso" | "gasto";
  importe: number;
  categoria: string;
  descripcion: string;
  persona: string;
};