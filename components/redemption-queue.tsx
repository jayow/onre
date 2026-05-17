import type { RedemptionOffer, RedemptionSettings } from "@/lib/onre";
import { STABLE_COLORS, STABLE_MINTS } from "@/lib/onre";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";

function tokenLabel(mint: string): string {
  return STABLE_MINTS[mint] ?? `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

function fmtDuration(seconds: number): string {
  if (seconds >= 86400) return `${Math.round(seconds / 86400)}d`;
  if (seconds >= 3600) return `${Math.round(seconds / 3600)}h`;
  return `${seconds}s`;
}

export function RedemptionQueue({
  settings,
  offers,
}: {
  settings: RedemptionSettings;
  offers: RedemptionOffer[];
}) {
  const totalExecuted = offers.reduce((s, o) => s + o.executedRedemptions, 0);
  const totalPending = offers.reduce((s, o) => s + o.requestedRedemptions, 0);
  const utilization = settings.maxCapacity
    ? totalExecuted / settings.maxCapacity
    : 0;

  const rows = [...offers].sort(
    (a, b) => b.executedRedemptions - a.executedRedemptions,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="card p-5">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-4">
          Queue status
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          <Stat
            label="Executed (lifetime)"
            value={fmtUsd(totalExecuted, { compact: true })}
            muted={`${fmtPct(utilization, 1)} of ${fmtUsd(settings.maxCapacity, { compact: true })} cap`}
          />
          <Stat
            label="Pending"
            value={
              <span className={totalPending > 0 ? "text-[var(--accent)]" : ""}>
                {fmtUsd(totalPending, { compact: true })}
              </span>
            }
            muted={totalPending > 0 ? "in queue now" : "queue empty"}
          />
          <Stat
            label="Max per request"
            value={fmtPct(settings.maxSharePerRequest, 1)}
            muted={`of available capacity`}
          />
          <Stat
            label="Cooldown"
            value={fmtDuration(settings.coolDown)}
            muted={`since ${new Date(settings.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          />
        </dl>

        <div className="mt-5">
          <div className="text-[11px] text-[var(--muted-2)] uppercase tracking-wider mb-2">
            Lifetime utilization
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-[var(--surface-2)]">
            <div
              className="h-full bg-[var(--accent)] rounded-full"
              style={{ width: `${Math.min(100, utilization * 100)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] text-[var(--muted-2)] numeric">
            <span>{fmtUsd(0, { compact: true })}</span>
            <span>{fmtUsd(settings.maxCapacity, { compact: true })}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 overflow-x-auto lg:col-span-2">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-3">
          By stablecoin
        </div>
        <table className="w-full text-[13px] min-w-[540px]">
          <thead>
            <tr className="text-[var(--muted)] text-left">
              <th className="font-medium pb-2">Token</th>
              <th className="font-medium pb-2 text-right">Executed</th>
              <th className="font-medium pb-2 text-right">Pending</th>
              <th className="font-medium pb-2 text-right">Fee</th>
              <th className="font-medium pb-2 text-right">Requests</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const label = tokenLabel(o.tokenOutMint);
              const color = STABLE_COLORS[label] ?? "var(--muted)";
              return (
                <tr
                  key={o.offerAddress}
                  className="border-t border-[var(--border)]/50"
                >
                  <td className="py-2">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded-sm"
                        style={{ background: color }}
                      />
                      <span className="font-medium">{label}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right numeric">
                    {fmtUsd(o.executedRedemptions, { compact: true })}
                  </td>
                  <td className="py-2 text-right numeric">
                    {o.requestedRedemptions > 0 ? (
                      <span className="text-[var(--accent)]">
                        {fmtUsd(o.requestedRedemptions, { compact: true })}
                      </span>
                    ) : (
                      <span className="text-[var(--muted-2)]">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right numeric text-[var(--muted)]">
                    {(o.feeBasisPoints / 100).toFixed(2)}%
                  </td>
                  <td className="py-2 text-right numeric text-[var(--muted)]">
                    {fmtNum(o.counter)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: string;
}) {
  return (
    <div>
      <dt className="text-[11px] text-[var(--muted-2)] uppercase tracking-wider">
        {label}
      </dt>
      <dd className="mt-1 text-[18px] font-semibold leading-none numeric">
        {value}
      </dd>
      {muted && (
        <div className="mt-1 text-[11px] text-[var(--muted-2)]">{muted}</div>
      )}
    </div>
  );
}
