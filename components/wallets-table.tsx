"use client";

import { useMemo, useState } from "react";

export type SlimWallet = { rank: number; address: string; totalPoints: number };

const PAGE_SIZE = 50;

function tierFor(rank: number, total: number): { label: string; tone: "top1" | "top5" | "top10" | "top25" | "top50" | "rest" } {
  if (!total) return { label: "—", tone: "rest" };
  const pct = (rank / total) * 100;
  if (pct <= 1) return { label: "Top 1%", tone: "top1" };
  if (pct <= 5) return { label: "Top 5%", tone: "top5" };
  if (pct <= 10) return { label: "Top 10%", tone: "top10" };
  if (pct <= 25) return { label: "Top 25%", tone: "top25" };
  if (pct <= 50) return { label: "Top 50%", tone: "top50" };
  return { label: "Bottom 50%", tone: "rest" };
}

const TIER_COLOR: Record<"top1" | "top5" | "top10" | "top25" | "top50" | "rest", string> = {
  top1: "var(--accent)",
  top5: "#FFD96B",
  top10: "#A78BFA",
  top25: "#06B6D4",
  top50: "#10B981",
  rest: "var(--muted-2)",
};

export function WalletsTable({ wallets, totalPoints }: { wallets: SlimWallet[]; totalPoints: number }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return wallets;
    return wallets.filter((w) => w.address.toLowerCase().includes(q) || String(w.rank) === q);
  }, [wallets, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const fmtNum = (n: number) =>
    n >= 1_000_000
      ? Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n)
      : Intl.NumberFormat("en-US").format(n);

  return (
    <div className="card p-5">
      <div className="mb-4">
        <input
          className="search w-full sm:w-80"
          placeholder="Search by address or rank…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[560px]">
          <thead>
            <tr className="text-[var(--muted)] text-left">
              <th className="font-medium pb-2 w-14">#</th>
              <th className="font-medium pb-2 w-24">Tier</th>
              <th className="font-medium pb-2">Address</th>
              <th className="font-medium pb-2 text-right">Points</th>
              <th className="font-medium pb-2 text-right w-28">% of total</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[var(--muted)]">
                  No wallets match.
                </td>
              </tr>
            )}
            {slice.map((w) => {
              const pct = totalPoints ? (w.totalPoints / totalPoints) * 100 : 0;
              const tier = tierFor(w.rank, wallets.length);
              return (
                <tr key={w.address} className="border-t border-[var(--border)]/50">
                  <td className="py-2 text-[var(--muted)] numeric">{w.rank.toLocaleString()}</td>
                  <td className="py-2">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        color: TIER_COLOR[tier.tone],
                        background: `color-mix(in srgb, ${TIER_COLOR[tier.tone]} 14%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${TIER_COLOR[tier.tone]} 35%, transparent)`,
                      }}
                    >
                      {tier.label}
                    </span>
                  </td>
                  <td className="py-2 font-mono text-[12px]">
                    <a
                      className="hover:text-[var(--accent)] break-all"
                      href={`https://solscan.io/account/${w.address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {w.address}
                    </a>
                  </td>
                  <td className="py-2 text-right numeric">{fmtNum(w.totalPoints)}</td>
                  <td className="py-2 text-right numeric text-[var(--muted)]">{pct.toFixed(3)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pager page={safePage} pages={pages} onChange={setPage} />
    </div>
  );
}

function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null;
  const window = 1;
  const items: (number | "…")[] = [];
  const push = (n: number | "…") => items[items.length - 1] !== n && items.push(n);

  push(0);
  if (page - window > 1) push("…");
  for (let i = Math.max(1, page - window); i <= Math.min(pages - 2, page + window); i++) push(i);
  if (page + window < pages - 2) push("…");
  if (pages > 1) push(pages - 1);

  const Btn = ({ children, disabled, onClick, active }: { children: React.ReactNode; disabled?: boolean; onClick?: () => void; active?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "h-8 min-w-8 px-2 rounded-md border text-[12px] numeric",
        active
          ? "bg-[var(--accent)] text-[#1a1306] border-transparent font-semibold"
          : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]",
        disabled ? "opacity-40 pointer-events-none" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center justify-between mt-4 gap-3">
      <div className="text-[12px] text-[var(--muted)]">
        Page <span className="numeric text-[var(--foreground)]">{page + 1}</span> of{" "}
        <span className="numeric text-[var(--foreground)]">{pages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Btn disabled={page === 0} onClick={() => onChange(0)}>« First</Btn>
        <Btn disabled={page === 0} onClick={() => onChange(Math.max(0, page - 1))}>‹ Prev</Btn>
        {items.map((it, i) =>
          it === "…" ? (
            <span key={`e${i}`} className="text-[12px] text-[var(--muted-2)] px-1">…</span>
          ) : (
            <Btn key={`p${it}`} active={it === page} onClick={() => onChange(it)}>
              {it + 1}
            </Btn>
          )
        )}
        <Btn disabled={page >= pages - 1} onClick={() => onChange(Math.min(pages - 1, page + 1))}>Next ›</Btn>
        <Btn disabled={page >= pages - 1} onClick={() => onChange(pages - 1)}>Last »</Btn>
      </div>
    </div>
  );
}
