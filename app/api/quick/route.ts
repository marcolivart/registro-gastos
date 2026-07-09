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
    const texto = String(body.texto || "").trim();

    if (!texto) {
      return NextResponse.json(
        { ok: false, error: "Texto vacío" },
        { status: 400 }
      );
    }

    const movimiento = interpretarMovimiento(texto);

    if (!movimiento.importe || movimiento.importe <= 0) {
      return NextResponse.json(
        { ok: false, error: "No he podido detectar el importe" },
        { status: 400 }
      );
    }

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
      mensaje: `${movimiento.categoria} registrado: ${movimiento.importe} €`,
      movimiento: data,
      interpretado: movimiento,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { ok: false, error: "Error interno" },
      { status: 500 }
    );
  }
}

function interpretarMovimiento(textoOriginal: string) {
  const texto = textoOriginal.toLowerCase();

  const importe = extraerImporte(texto);
  const descripcion = limpiarDescripcion(textoOriginal);
  const tipo = detectarTipo(texto);
  const categoria = detectarCategoria(texto, tipo);
  const persona = detectarPersona(texto);

  return {
    fecha: new Date().toISOString().slice(0, 10),
    tipo,
    importe,
    categoria,
    descripcion,
    persona,
  };
}

function extraerImporte(texto: string) {
  const matches = texto.match(/\d+[,.]?\d*/g);
  if (!matches || matches.length === 0) return 0;

  const ultimoNumero = matches[matches.length - 1];
  return Number(ultimoNumero.replace(",", "."));
}

function limpiarDescripcion(texto: string) {
  return (
    texto
      .replace(/\d+[,.]?\d*/g, "")
      .replace(/€/g, "")
      .trim() || "Movimiento rápido"
  );
}

function detectarTipo(texto: string): "ingreso" | "gasto" {
  const ingresos = [
    "ingreso",
    "aportacion",
    "aportación",
    "nomina",
    "nómina",
    "sueldo",
    "devolucion",
    "devolución",
  ];

  if (ingresos.some((palabra) => texto.includes(palabra))) {
    return "ingreso";
  }

  if (texto.includes("marc 350") || texto.includes("alba 350")) {
    return "ingreso";
  }

  return "gasto";
}

function detectarPersona(texto: string) {
  if (texto.includes("marc")) return "Marc";
  if (texto.includes("alba")) return "Alba";
  return "Conjunta";
}

function detectarCategoria(texto: string, tipo: "ingreso" | "gasto") {
  if (tipo === "ingreso") {
    if (texto.includes("nomina") || texto.includes("nómina")) return "Nómina";
    if (texto.includes("devolucion") || texto.includes("devolución")) {
      return "Devolución";
    }

    return "Aportación";
  }

  const reglas = [
    {
      categoria: "Compra",
      palabras: [
        "mercadona",
        "lidl",
        "carrefour",
        "aldi",
        "condis",
        "bonpreu",
        "super",
        "compra",
        "comida",
      ],
    },
    {
      categoria: "Luz",
      palabras: ["luz", "endesa", "naturgy", "iberdrola", "electricidad"],
    },
    {
      categoria: "Agua",
      palabras: ["agua", "agbar"],
    },
    {
      categoria: "Internet",
      palabras: ["internet", "digi", "movistar", "vodafone", "orange", "wifi"],
    },
    {
      categoria: "Transporte",
      palabras: ["gasolina", "repsol", "cepsa", "renfe", "metro", "bus", "taxi"],
    },
    {
      categoria: "Ocio",
      palabras: ["cine", "netflix", "spotify", "bar", "restaurante", "ocio"],
    },
    {
      categoria: "Hogar",
      palabras: ["ikea", "leroy", "mueble", "hogar", "casa"],
    },
    {
      categoria: "Limpieza",
      palabras: ["limpieza", "detergente", "lejia", "lejía"],
    },
    {
      categoria: "Alquiler",
      palabras: ["alquiler", "renta", "piso"],
    },
  ];

  const encontrada = reglas.find((regla) =>
    regla.palabras.some((palabra) => texto.includes(palabra))
  );

  return encontrada?.categoria || "Otros";
}