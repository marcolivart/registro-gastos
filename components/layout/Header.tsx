import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="mb-7 text-center">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[26px] bg-emerald-400 text-[#052e1f] shadow-2xl shadow-emerald-500/30">
        <Home size={31} strokeWidth={3} />
      </div>

      <p className="text-sm font-bold text-emerald-300">Marc & Alba</p>
      <h1 className="mt-1 text-4xl font-black tracking-tight">Nuestro Piso</h1>
    </header>
  );
}