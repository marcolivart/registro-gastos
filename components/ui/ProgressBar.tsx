export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-4 overflow-hidden rounded-full bg-white/20">
      <div
        className="h-full rounded-full bg-emerald-300 transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}