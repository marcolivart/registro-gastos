import { NextRequest, NextResponse } from "next/server";

const shortcutSecret = process.env.SHORTCUT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("x-shortcut-secret");

    if (!shortcutSecret || auth !== shortcutSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "No autorizado",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    return NextResponse.json({
      ok: true,
      mensaje: "Datos recibidos correctamente. No se ha guardado nada.",
      recibido: body,
      clavesRecibidas: Object.keys(body),
      tiposRecibidos: Object.fromEntries(
        Object.entries(body).map(([clave, valor]) => [
          clave,
          Array.isArray(valor) ? "array" : typeof valor,
        ])
      ),
    });
  } catch (error) {
    console.error("Error leyendo la petición del atajo:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "No se ha podido leer el JSON enviado por el atajo",
      },
      { status: 400 }
    );
  }
}