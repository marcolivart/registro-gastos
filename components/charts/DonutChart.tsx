import { colorCategoria, euro, iconoCategoria } from "@/lib/helpers";

export type DonutItem = {
  categoria: string;
  total: number;
};

export function DonutChart({ items }: { items: DonutItem[] }) {
  const total = items.reduce((acc, item) => acc + item.total, 0);
  const visibles = items.filter((item) => item.total > 0).slice(0, 8);

  let acumulado = 0;
  const segmentos = visibles.map((item) => {
    const inicio = total > 0 ? (acumulado / total) * 100 : 0;
    acumulado += item.total;
    const fin = total > 0 ? (acumulado / total) * 100 : 0;
    return `${colorCategoria(item.categoria)} ${inicio}% ${fin}%`;
  });

  const background =
    total > 0
      ? `conic-gradient(${segmentos.join(", ")})`
      : "conic-gradient(rgba(255,255,255,.08) 0 100%)";

  return (
    <div>
      <div className="flex items-center gap-6">
        <div
          className="relative grid h-36 w-36 shrink-0 place-items-center rounded-full"
          style={{ background }}
        >
          <div className="grid h-[96px] w-[96px] place-items-center rounded-full bg-[#0a1119] text-center shadow-inner shadow-black/40">
            <div>
              <p className="text-xs font-bold text-slate-500">Total</p>
              <p className="text-lg font-black">{euro(total)}</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          {visibles.slice(0, 4).map((item) => {
            const porcentaje = total > 0 ? (item.total / total) * 100 : 0;
            return (
              <div key={item.categoria} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colorCategoria(item.categoria) }}
                  />
                  <span className="truncate text-sm font-bold text-slate-300">
                    {iconoCategoria(item.categoria)} {item.categoria}
                  </span>
                </div>
                <span className="text-xs font-black text-slate-400">
                  {porcentaje.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {visibles.length > 4 && (
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
          {visibles.slice(4).map((item) => (
            <div key={item.categoria} className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colorCategoria(item.categoria) }}
              />
              <span className="truncate">{item.categoria}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
