import type { YieldStats } from "@/lib/onre";
import { fmtDate, fmtPct } from "@/lib/format";

export function YieldStatsCard({ stats }: { stats: YieldStats }) {
  const rows: { label: string; value: React.ReactNode; muted?: string }[] = [
    {
      label: "Lifetime APY",
      value: <span className="text-[var(--accent)]">{fmtPct(stats.lifetimeApy)}</span>,
      muted: `${stats.daysRunning} days running`,
    },
    {
      label: "Total return",
      value: (
        <span className="text-[var(--positive)]">
          +{fmtPct(stats.totalReturn)}
        </span>
      ),
      muted: `since ${fmtDate(stats.inceptionDate)}`,
    },
    {
      label: "30-day APY",
      value: stats.apy30d != null ? fmtPct(stats.apy30d) : "—",
      muted: stats.apy7d != null ? `7-day: ${fmtPct(stats.apy7d)}` : undefined,
    },
    {
      label: "Best day",
      value: stats.bestDay ? (
        <span className="text-[var(--positive)]">+{fmtPct(stats.bestDay.pct, 3)}</span>
      ) : (
        "—"
      ),
      muted: stats.bestDay ? fmtDate(stats.bestDay.date) : undefined,
    },
    {
      label: "Worst day",
      value: stats.worstDay ? (
        <span className={stats.worstDay.pct < 0 ? "text-[var(--negative)]" : ""}>
          {stats.worstDay.pct >= 0 ? "+" : ""}
          {fmtPct(stats.worstDay.pct, 3)}
        </span>
      ) : (
        "—"
      ),
      muted: stats.worstDay ? fmtDate(stats.worstDay.date) : undefined,
    },
    {
      label: "Current NAV",
      value: <span className="numeric">{stats.currentNav.toFixed(6)}</span>,
      muted: `inception ${stats.inceptionNav.toFixed(6)}`,
    },
  ];

  return (
    <div className="card p-5">
      <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-4">
        Lifetime stats
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[11px] text-[var(--muted-2)] uppercase tracking-wider">
              {r.label}
            </dt>
            <dd className="mt-1 text-[18px] font-semibold leading-none numeric">{r.value}</dd>
            {r.muted && (
              <div className="mt-1 text-[11px] text-[var(--muted-2)]">{r.muted}</div>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}
