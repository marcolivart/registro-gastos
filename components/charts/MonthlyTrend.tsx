import { euro } from "@/lib/helpers";

type TrendItem = {
  key: string;
  etiqueta: string;
  gastos: number;
  ingresos: number;
};

export function MonthlyTrend({ items }: { items: TrendItem[] }) {
  const maximo = Math.max(...items.flatMap((item) => [item.gastos, item.ingresos]), 1);

  return (
    <div>
      <div className="mb-5 flex items-center gap-4 text-xs font-bold text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Ingresos
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> Gastos
        </span>
      </div>

      <div className="flex h-48 items-end gap-3">
        {items.map((item) => {
          const altoIngresos = Math.max((item.ingresos / maximo) * 100, item.ingresos > 0 ? 5 : 0);
          const altoGastos = Math.max((item.gastos / maximo) * 100, item.gastos > 0 ? 5 : 0);

          return (
            <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex h-36 w-full items-end justify-center gap-1.5">
                <div
                  className="w-2.5 rounded-t-full bg-emerald-400 transition-all duration-700"
                  style={{ height: `${altoIngresos}%` }}
                  title={`Ingresos: ${euro(item.ingresos)}`}
                />
                <div
                  className="w-2.5 rounded-t-full bg-rose-300 transition-all duration-700"
                  style={{ height: `${altoGastos}%` }}
                  title={`Gastos: ${euro(item.gastos)}`}
                />
              </div>
              <p className="mt-3 text-xs font-black capitalize text-slate-500">
                {item.etiqueta}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
