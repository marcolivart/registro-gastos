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
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const categoriaRaw =
      body.categoria ??
      body["categoria "] ??
      body.category ??
      body["category "] ??
      "";

    const categoria = normalizarCategoria(categoriaRaw);
    const tipo = categoria === "Ingreso" ? "ingreso" : "gasto";

    const importe = Number(String(body.importe ?? body.amount ?? "").replace(",", "."));

    const persona = normalizarPersona(
      body.persona ?? body["persona "] ?? body.person ?? ""
    );

    const descripcion =
      String(body.descripcion ?? body["descripcion "] ?? body.description ?? "")
        .trim() || descripcionPorDefecto(tipo, categoria);

    const fecha = body.fecha || new Date().toISOString().slice(0, 10);

    if (!importe || importe <= 0) {
      return NextResponse.json(
        { ok: false, error: "Importe inválido", recibido: body },
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
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Movimiento guardado",
      movimiento: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
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

  if (limpio.includes("ingreso")) return "Ingreso";
  if (limpio.includes("aportacion") || limpio.includes("aportación")) return "Ingreso";
  if (limpio.includes("nomina") || limpio.includes("nómina")) return "Ingreso";
  if (limpio.includes("devolucion") || limpio.includes("devolución")) return "Ingreso";

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