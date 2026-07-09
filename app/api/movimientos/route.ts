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

    const body = await request.json();

    const categoria = normalizarCategoria(body.categoria);
    const tipo = categoria === "Ingreso" ? "ingreso" : "gasto";
    const importe = Number(String(body.importe).replace(",", "."));
    const persona = normalizarPersona(body.persona);
    const descripcion =
      String(body.descripcion || "").trim() ||
      descripcionPorDefecto(tipo, categoria);

    const fecha = body.fecha || new Date().toISOString().slice(0, 10);

    if (!importe || importe <= 0) {
      return NextResponse.json(
        { ok: false, error: "Importe inválido", recibido: body.importe },
        { status: 400 }
      );
    }

    const movimiento = {
      fecha,
      tipo,
      importe,
      categoria,
      descripcion,
      persona,
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
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

function limpiarValor(valor: unknown) {
  return String(valor || "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .trim()
    .toLowerCase();
}

function normalizarCategoria(valor: unknown) {
  const limpio = limpiarValor(valor);

  const categorias: Record<string, string> = {
    compra: "Compra",
    luz: "Luz",
    agua: "Agua",
    internet: "Internet",
    alquiler: "Alquiler",
    transporte: "Transporte",
    ocio: "Ocio",
    limpieza: "Limpieza",
    hogar: "Hogar",
    otros: "Otros",
    ingreso: "Ingreso",
    aportacion: "Ingreso",
    aportación: "Ingreso",
    nomina: "Ingreso",
    nómina: "Ingreso",
    devolucion: "Ingreso",
    devolución: "Ingreso",
  };

  return categorias[limpio] || "Otros";
}

function normalizarPersona(valor: unknown) {
  const limpio = limpiarValor(valor);

  if (limpio.includes("marc")) return "Marc";
  if (limpio.includes("alba")) return "Alba";
  if (limpio.includes("conjunta")) return "Conjunta";

  return "Conjunta";
}

function descripcionPorDefecto(tipo: "ingreso" | "gasto", categoria: string) {
  if (tipo === "ingreso") return "Ingreso";
  return categoria || "Gasto";
}