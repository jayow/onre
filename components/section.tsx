import type { ReactNode } from "react";

export function Section({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[13px] text-[var(--muted)]">{subtitle}</p>
          )}
        </div>
        {right && <div className="text-[12px] text-[var(--muted)]">{right}</div>}
      </div>
      {children}
    </section>
  );
}
