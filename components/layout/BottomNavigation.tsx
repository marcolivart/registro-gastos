"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, ListRestart, Settings } from "lucide-react";

const items = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/movimientos", label: "Movimientos", Icon: ListRestart },
  { href: "/estadisticas", label: "Estadísticas", Icon: BarChart3 },
  { href: "/ajustes", label: "Ajustes", Icon: Settings },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#071018]/95 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-[18px] px-1 py-2 text-center text-[10px] font-black transition active:scale-95 ${
                active
                  ? "bg-emerald-400 text-[#052e1f]"
                  : "text-slate-500 active:bg-white/10"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 3 : 2.3} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
