import { Sparkles } from "lucide-react";
import { euro } from "@/lib/helpers";

type Props = {
  disponible: number;
  porcentaje: number;
};

export function InsightBox({ disponible, porcentaje }: Props) {
  const estado =
    disponible >= 200
      ? {
          titulo: "Vais muy bien.",
          texto: "El fondo común sigue bastante sano este mes.",
        }
      : disponible >= 0
      ? {
          titulo: "Ojo, queda poco margen.",
          texto: "El fondo común empieza a estar justo.",
        }
      : {
          titulo: "Fondo superado.",
          texto: "Este mes habéis gastado más de lo aportado.",
        };

  return (
    <section className="mb-5 rounded-[34px] border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 to-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="flex gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-400 text-[#06110c]">
          <Sparkles size={24} strokeWidth={3} />
        </div>

        <div>
          <p className="text-sm font-black text-emerald-300">Resumen inteligente</p>
          <h3 className="mt-1 text-xl font-black">{estado.titulo}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            {estado.texto} Habéis usado el {porcentaje.toFixed(0)}% del fondo.{" "}
            {disponible >= 0
              ? `Quedan ${euro(disponible)}.`
              : `Os habéis pasado ${euro(Math.abs(disponible))}.`}
          </p>
        </div>
      </div>
    </section>
  );
}