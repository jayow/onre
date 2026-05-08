import type { ReactNode } from "react";

export function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="py-2">
      <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
        {label}
      </div>
      <div className="numeric mt-2 text-3xl md:text-4xl font-semibold leading-none text-[var(--foreground)]">
        {value}
      </div>
      {sub && (
        <div className="mt-2.5 text-[12px] text-[var(--muted)]">{sub}</div>
      )}
    </div>
  );
}
