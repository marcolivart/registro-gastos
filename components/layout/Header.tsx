import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-emerald-300">Fondo común · Marc & Alba</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight">
          Registro de Gastos
        </h1>
      </div>

      <div className="grid h-14 w-14 place-items-center rounded-[24px] bg-emerald-400 text-[#06110c] shadow-xl shadow-emerald-500/25">
        <Home size={27} strokeWidth={3} />
      </div>
    </header>
  );
}