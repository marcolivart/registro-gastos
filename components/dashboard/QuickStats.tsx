import { User, Users, WalletCards } from "lucide-react";
import { euro } from "@/lib/helpers";

type Props = {
  marc: number;
  alba: number;
  conjunta: number;
};

export function QuickStats({ marc, alba, conjunta }: Props) {
  return (
    <section className="mb-5 grid grid-cols-3 gap-3">
      <MiniStat title="Marc" value={marc} icon={<User size={20} />} />
      <MiniStat title="Alba" value={alba} icon={<User size={20} />} />
      <MiniStat title="Conjunta" value={conjunta} icon={<WalletCards size={20} />} />
    </section>
  );
}

function MiniStat({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-4 shadow-xl shadow-black/10">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
        {icon}
      </div>
      <p className="mt-3 text-xs font-bold text-slate-400">{title}</p>
      <p className="mt-1 text-sm font-black">{euro(value)}</p>
    </div>
  );
}