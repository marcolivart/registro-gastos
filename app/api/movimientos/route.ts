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

    const importe = normalizarImporte(
      obtenerCampo(body, ["importe", "amount"])
    );

    const categoria = normalizarCategoria(
      obtenerCampo(body, ["categoria", "category"])
    );

    const persona = normalizarPersona(
      obtenerCampo(body, ["persona", "person"])
    );

    if (!Number.isFinite(importe) || importe <= 0) {
      return NextResponse.json(
        {
          ok: false,
          error: "Importe inválido",
          recibido: body,
        },
        { status: 400 }
      );
    }

    if (!categoria) {
      return NextResponse.json(
        {
          ok: false,
          error: "Categoría no recibida",
          recibido: body,
        },
        { status: 400 }
      );
    }

    const tipo: "ingreso" | "gasto" =
      categoria === "Ingreso" ? "ingreso" : "gasto";

    const descripcionRecibida = obtenerCampo(body, [
      "descripcion",
      "description",
    ]);

    const descripcion =
      String(descripcionRecibida ?? "").trim() ||
      descripcionPorDefecto(tipo, categoria);

    const fechaRecibida = obtenerCampo(body, ["fecha", "date"]);

    const fecha =
      String(fechaRecibida ?? "").trim() ||
      new Date().toISOString().slice(0, 10);

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
      mensaje:
        tipo === "ingreso"
          ? `Ingreso guardado: ${importe} €`
          : `${categoria} guardado: ${importe} €`,
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

function normalizarCategoria(valor: unknown): string | null {
  const limpio = limpiarValor(valor);

  if (!limpio) return null;

  if (limpio.includes("ingreso")) return "Ingreso";
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
  tipo: "ingreso" | "gasto",
  categoria: string
): string {
  return tipo === "ingreso" ? "Ingreso" : categoria;
}