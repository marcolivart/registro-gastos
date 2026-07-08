"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/gastos", label: "Gastos", icon: "💳" },
  { href: "/estadisticas", label: "Stats", icon: "📊" },
  { href: "/ajustes", label: "Ajustes", icon: "⚙️" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#071018]/95 px-4 py-3 backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-2 py-2 text-center text-xs font-black transition ${
                active
                  ? "bg-emerald-400 text-[#06110c]"
                  : "text-slate-400 active:bg-white/10"
              }`}
            >
              <div className="text-lg">{item.icon}</div>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}