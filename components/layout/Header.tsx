export function Header() {
  return (
    <header className="mb-6 flex items-center gap-4">
      <div className="grid h-14 w-14 place-items-center rounded-[24px] bg-emerald-400 text-2xl shadow-xl shadow-emerald-500/20">
        🏠
      </div>

      <div>
        <h1 className="text-2xl font-black leading-tight">Registro de Gastos</h1>
        <p className="text-sm font-semibold text-emerald-300">
          Fondo común · Marc & Alba
        </p>
      </div>
    </header>
  );
}