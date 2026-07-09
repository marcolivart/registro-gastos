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
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();

    const tipo = body.tipo;
    const importe = Number(String(body.importe).replace(",", "."));
    const categoria = body.categoria || "Otros";
    const descripcion = body.descripcion || "Sin descripción";
    const persona = body.persona || "Conjunta";
    const fecha = body.fecha || new Date().toISOString().slice(0, 10);

    if (tipo !== "ingreso" && tipo !== "gasto") {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    if (!importe || importe <= 0) {
      return NextResponse.json({ error: "Importe inválido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("movimientos")
      .insert({
        fecha,
        tipo,
        importe,
        categoria,
        descripcion,
        persona,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      movimiento: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno creando movimiento" },
      { status: 500 }
    );
  }
}