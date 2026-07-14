import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[20px] bg-emerald-400 text-[#052e1f] shadow-xl shadow-emerald-500/25">
          <Home size={24} strokeWidth={3} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Marc & Alba
          </p>
          <h1 className="mt-0.5 text-2xl font-black tracking-tight">Nuestro Piso</h1>
        </div>
      </div>

      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,.9)]" />
    </header>
  );
}
