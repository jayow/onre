import { EXPONENT_MARKETS, type YtBreakdown } from "@/lib/onre";
import { fmtAddress, fmtNum } from "@/lib/format";

export type YtRow = {
  rank: number;
  address: string;
  totalPoints: number;
  yt: YtBreakdown;
};

export function YtLeaderboard({ rows, limit = 25 }: { rows: YtRow[]; limit?: number }) {
  const top = rows.slice(0, limit);
  const totalYt = rows.reduce((s, r) => s + r.yt.total, 0);

  return (
    <div className="card p-5 overflow-x-auto">
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
          Top YT buyers · per-market
        </div>
        <div className="text-[11px] text-[var(--muted-2)] numeric">
          {fmtNum(rows.length)} wallets · {fmtNum(totalYt, { compact: true })} YT pts total
        </div>
      </div>
      <table className="w-full text-[13px] min-w-[720px]">
        <thead>
          <tr className="text-[var(--muted)] text-left">
            <th className="font-medium pb-2 w-12">#</th>
            <th className="font-medium pb-2">Wallet</th>
            {EXPONENT_MARKETS.map((m) => (
              <th key={m} className="font-medium pb-2 text-right">
                {m}
              </th>
            ))}
            <th className="font-medium pb-2 text-right">Total YT</th>
            <th className="font-medium pb-2 text-right text-[var(--muted-2)]">YT % of total</th>
          </tr>
        </thead>
        <tbody>
          {top.map((r) => {
            const ytShare = r.totalPoints ? r.yt.total / r.totalPoints : 0;
            return (
              <tr key={r.address} className="border-t border-[var(--border)]/50">
                <td className="py-2 text-[var(--muted-2)] numeric">{r.rank}</td>
                <td className="py-2">
                  <a
                    href={`https://portfolio.jup.ag/portfolio/${r.address}`}
                    target="_blank"
                    rel="noopener"
                    className="font-mono text-[12px] hover:text-[var(--accent)]"
                  >
                    {fmtAddress(r.address)}
                  </a>
                </td>
                {EXPONENT_MARKETS.map((m) => {
                  const v = r.yt.byMarket[m];
                  return (
                    <td key={m} className="py-2 text-right numeric">
                      {v > 0 ? (
                        fmtNum(v, { compact: true, digits: 2 })
                      ) : (
                        <span className="text-[var(--muted-2)]">—</span>
                      )}
                    </td>
                  );
                })}
                <td className="py-2 text-right numeric font-medium">
                  {fmtNum(r.yt.total, { compact: true, digits: 2 })}
                </td>
                <td className="py-2 text-right numeric text-[var(--muted)]">
                  {(ytShare * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
