import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const shortcutSecret = process.env.SHORTCUT_SECRET!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("x-shortcut-secret");

    if (!shortcutSecret || auth !== shortcutSecret) {
      return NextResponse.json(
        { ok: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const tipo = normalizarTipo(obtenerCampo(body, ["tipo"]));
    const importe = normalizarImporte(
      obtenerCampo(body, ["importe", "amount"])
    );
    const categoria = normalizarCategoria(
      obtenerCampo(body, ["categoria", "category"])
    );
    const persona = normalizarPersona(
      obtenerCampo(body, ["persona", "person"])
    );

    const descripcion =
      String(
        obtenerCampo(body, ["descripcion", "description"]) ?? ""
      ).trim() || descripcionPorDefecto(tipo, categoria);

    const fecha =
      String(obtenerCampo(body, ["fecha", "date"]) ?? "").trim() ||
      new Date().toISOString().slice(0, 10);

    if (!tipo) {
      return NextResponse.json(
        {
          ok: false,
          error: "Tipo inválido",
          recibido: obtenerCampo(body, ["tipo"]),
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(importe) || importe <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Importe inválido",
          recibido: obtenerCampo(body, ["importe", "amount"]),
        },
        { status: 400 }
      );
    }

    if (!categoria) {
      return NextResponse.json(
        {
          ok: false,
          error: "Categoría no recibida",
          recibido: obtenerCampo(body, ["categoria", "category"]),
        },
        { status: 400 }
      );
    }

    const movimiento = {
      fecha,
      tipo,
      importe,
      categoria,
      persona,
      descripcion,
    };

    const { data, error } = await supabase
      .from("movimientos")
      .insert(movimiento)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Movimiento guardado",
      movimiento: data,
    });
  } catch (error) {
    console.error("Error creando movimiento:", error);

    return NextResponse.json(
      { ok: false, error: "Error interno creando el movimiento" },
      { status: 500 }
    );
  }
}

function obtenerCampo(
  body: Record<string, unknown>,
  nombres: string[]
): unknown {
  const claves = Object.keys(body);

  for (const nombre of nombres) {
    const encontrada = claves.find(
      (clave) => clave.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (encontrada) {
      return body[encontrada];
    }
  }

  return undefined;
}

function normalizarImporte(valor: unknown): number {
  const limpio = String(valor ?? "")
    .replace(/\s/g, "")
    .replace("€", "")
    .replace(",", ".");

  return Number(limpio);
}

function limpiarValor(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizarTipo(
  valor: unknown
): "ingreso" | "gasto" | null {
  const limpio = limpiarValor(valor);

  if (limpio.includes("ingreso")) return "ingreso";
  if (limpio.includes("gasto")) return "gasto";

  return null;
}

function normalizarCategoria(valor: unknown): string | null {
  const limpio = limpiarValor(valor);

  if (!limpio) return null;

  if (limpio.includes("compra")) return "Compra";
  if (limpio.includes("luz")) return "Luz";
  if (limpio.includes("agua")) return "Agua";
  if (limpio.includes("internet")) return "Internet";
  if (limpio.includes("alquiler")) return "Alquiler";
  if (limpio.includes("transporte")) return "Transporte";
  if (limpio.includes("ocio")) return "Ocio";
  if (limpio.includes("limpieza")) return "Limpieza";
  if (limpio.includes("hogar")) return "Hogar";
  if (limpio.includes("otros")) return "Otros";
  if (limpio.includes("aportacion")) return "Aportación";
  if (limpio.includes("nomina")) return "Nómina";
  if (limpio.includes("devolucion")) return "Devolución";
  if (limpio.includes("ingreso")) return "Ingreso";

  return "Otros";
}

function normalizarPersona(
  valor: unknown
): "Conjunta" | "Marc" | "Alba" {
  const limpio = limpiarValor(valor);

  if (limpio.includes("marc")) return "Marc";
  if (limpio.includes("alba")) return "Alba";

  return "Conjunta";
}

function descripcionPorDefecto(
  tipo: "ingreso" | "gasto" | null,
  categoria: string | null
): string {
  if (tipo === "ingreso") return categoria || "Ingreso";
  return categoria || "Gasto";
}