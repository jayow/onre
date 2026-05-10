import { SiteHeader } from "@/components/header";
import { Section } from "@/components/section";
import { Kpi } from "@/components/kpi";
import { TvlChart } from "@/components/tvl-chart";
import { PointsChart } from "@/components/points-chart";
import { BucketsChart } from "@/components/buckets";
import { DistributionDonut } from "@/components/distribution-donut";
import { WalletsTable, type SlimWallet } from "@/components/wallets-table";
import {
  avgDailyGrowth,
  bucketize,
  getAumGrowth,
  getFullLeaderboard,
  getOverview,
  getPointsGrowth,
  pivotAumByDate,
  tierBreakdown,
  TIER_COLORS,
  type ProtocolKey,
} from "@/lib/onre";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";

export default async function Home() {
  const [overview, aum, growth, leaderboard] = await Promise.all([
    getOverview(),
    getAumGrowth(),
    getPointsGrowth(),
    getFullLeaderboard(500),
  ]);

  const tvl = pivotAumByDate(aum);

  const aum30dAgo = (() => {
    const dates = [...new Set(aum.map((a) => a.date))].sort();
    if (dates.length < 30) return null;
    const targetDate = dates[dates.length - 30];
    return aum.filter((a) => a.date === targetDate).reduce((s, a) => s + a.aumUsd, 0);
  })();
  const aumDelta30d = aum30dAgo ? (overview.totalAumUsd - aum30dAgo) / aum30dAgo : null;

  const dailyGrowth7 = avgDailyGrowth(growth, 7);

  const buckets = bucketize(leaderboard);
  const tiers = tierBreakdown(leaderboard);
  const earningWallets = leaderboard.filter((r) => r.totalPoints > 0).length;

  const sumLeaves = (o: unknown): number => {
    if (typeof o === "number") return o;
    if (o && typeof o === "object") {
      let s = 0;
      for (const v of Object.values(o as Record<string, unknown>)) s += sumLeaves(v);
      return s;
    }
    return 0;
  };

  const slimWallets: SlimWallet[] = leaderboard.map((r) => {
    const b = r.pointsBreakdown ?? {};
    return {
      rank: r.rank,
      address: r.address,
      totalPoints: r.totalPoints,
      wallet: sumLeaves(b.wallet),
      kamino: sumLeaves(b.kamino),
      loopscale: sumLeaves(b.loopscale),
      exponent: sumLeaves(b.exponent),
      orca: sumLeaves(b.orca),
      elemental: sumLeaves(b.elemental),
      carrot: sumLeaves(b.carrot),
      referralBonus: sumLeaves(b.referralBonus),
    };
  });


  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <SiteHeader />
      <main className="relative max-w-7xl mx-auto w-full px-6 py-8">
        {/* KPIs (no card chrome) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-10 gap-y-2 pb-6 border-b border-[var(--border)]/60">
          <Kpi
            label="Total TVL"
            value={fmtUsd(overview.totalAumUsd, { compact: true })}
            sub={
              aumDelta30d != null ? (
                <>
                  <span className={aumDelta30d >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}>
                    {aumDelta30d >= 0 ? "+" : "−"}{fmtPct(Math.abs(aumDelta30d))}
                  </span>{" "}
                  vs 30d ago · {overview.activeProtocols} active partners
                </>
              ) : (
                <>{overview.activeProtocols} active partners</>
              )
            }
          />
          <Kpi
            label="Total Points"
            value={fmtNum(overview.totalPointsIssued, { compact: true, digits: 2 })}
            sub={
              <>
                <span className="text-[var(--positive)]">+{fmtNum(dailyGrowth7, { compact: true })}</span>{" "}
                avg/day · last 7 days
              </>
            }
          />
          <Kpi
            label="Wallets"
            value={fmtNum(overview.walletCount)}
            sub={
              <>
                <span className="text-[var(--foreground)]">{fmtNum(earningWallets)}</span> earning
                {" "}
                <span className="text-[var(--muted-2)]">
                  ({fmtPct(earningWallets / Math.max(1, overview.walletCount), 1)})
                </span>
              </>
            }
          />
        </div>

        {/* TVL */}
        <Section title="TVL by partner" subtitle="Weekly TVL breakdown across all OnRe integrations.">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TvlChart data={tvl.data} protocols={tvl.protocols} />
            </div>
            <DistributionDonut
              data={overview.distribution.map((d) => ({
                protocol: d.protocol as ProtocolKey,
                capitalUsd: d.capitalUsd,
                sharePct: d.sharePct,
              }))}
              totalUsd={overview.totalAumUsd}
            />
          </div>
        </Section>

        {/* POINTS */}
        <Section title="Points issuance" subtitle="Cumulative points to date plus a 7-day forward look.">
          <PointsChart
            series={growth}
            rate7d={dailyGrowth7}
            currentTotal={overview.totalPointsIssued}
          />
        </Section>

        {/* HOLDER DISTRIBUTION */}
        <Section
          title="Holder distribution"
          subtitle={`How ${fmtNum(overview.walletCount)} wallets are spread across point ranges.`}
        >
          <BucketsChart buckets={buckets} totalWallets={overview.walletCount} />

          <div className="mt-4 card p-5 overflow-x-auto">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-3">
              Top % breakdown
            </div>
            <table className="w-full text-[13px] min-w-[640px]">
              <thead>
                <tr className="text-[var(--muted)] text-left">
                  <th className="font-medium pb-2">Tier</th>
                  <th className="font-medium pb-2 text-right">Threshold</th>
                  <th className="font-medium pb-2 text-right">Wallets</th>
                  <th className="font-medium pb-2 text-right">% wallets</th>
                  <th className="font-medium pb-2 text-right">Points sum</th>
                  <th className="font-medium pb-2 text-right">% points</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((t) => {
                  const pctW = overview.walletCount ? t.count / overview.walletCount : 0;
                  const pctP = overview.totalPointsIssued ? t.points / overview.totalPointsIssued : 0;
                  const color = TIER_COLORS[t.tone];
                  return (
                    <tr key={t.label} className="border-t border-[var(--border)]/50">
                      <td className="py-2">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{
                            color,
                            background: `color-mix(in srgb, ${color} 14%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
                          }}
                        >
                          {t.label}
                        </span>
                      </td>
                      <td className="py-2 text-right numeric">{fmtNum(t.threshold, { compact: true, digits: 2 })}</td>
                      <td className="py-2 text-right numeric">{fmtNum(t.count)}</td>
                      <td className="py-2 text-right numeric text-[var(--muted)]">{fmtPct(pctW)}</td>
                      <td className="py-2 text-right numeric">{fmtNum(t.points, { compact: true, digits: 2 })}</td>
                      <td className="py-2 text-right numeric text-[var(--muted)]">{fmtPct(pctP)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        {/* WALLETS TABLE */}
        <Section title="Wallet directory">
          <WalletsTable wallets={slimWallets} totalPoints={overview.totalPointsIssued} />
        </Section>
      </main>
    </div>
  );
}
