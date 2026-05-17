"use client";

import { useMemo, useState } from "react";

export type SlimWallet = {
  rank: number;
  address: string;
  totalPoints: number;
  wallet: number;
  kamino: number;
  loopscale: number;
  exponentYt: number;
  exponentLp: number;
  orca: number;
  elemental: number;
  carrot: number;
  referralBonus: number;
};

const PAGE_SIZE = 50;

type VenueKey =
  | "wallet"
  | "kamino"
  | "loopscale"
  | "exponentYt"
  | "exponentLp"
  | "orca"
  | "elemental"
  | "carrot"
  | "referralBonus";

type SortKey = "rank" | "address" | "totalPoints" | VenueKey;

const VENUE_COLS: { key: VenueKey; label: string }[] = [
  { key: "wallet", label: "Wallet" },
  { key: "kamino", label: "Kamino" },
  { key: "loopscale", label: "Loopscale" },
  { key: "exponentYt", label: "Exponent YT" },
  { key: "exponentLp", label: "Exponent LP" },
  { key: "orca", label: "Orca" },
  { key: "elemental", label: "Elemental" },
  { key: "carrot", label: "Carrot" },
  { key: "referralBonus", label: "Referrals" },
];

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

const fmtNum = (n: number) => {
  if (!n) return "—";
  if (n >= 1_000_000) return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(n);
  return Intl.NumberFormat("en-US").format(n);
};

export function WalletsTable({ wallets, totalPoints }: { wallets: SlimWallet[]; totalPoints: number }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "rank", dir: "asc" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return wallets;
    return wallets.filter((w) => w.address.toLowerCase().includes(q) || String(w.rank) === q);
  }, [wallets, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const k = sort.key;
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, number | string>)[k];
      const bv = (b as unknown as Record<string, number | string>)[k];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const slice = sorted.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const setSortKey = (key: SortKey) => {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "address" || key === "rank" ? "asc" : "desc" }
    );
    setPage(0);
  };

  const SortableTh = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" }) => {
    const active = sort.key === k;
    const arrow = !active ? "↕" : sort.dir === "asc" ? "↑" : "↓";
    return (
      <th
        onClick={() => setSortKey(k)}
        className={`font-medium pb-2 cursor-pointer select-none hover:text-[var(--foreground)] ${align === "right" ? "text-right" : "text-left"}`}
      >
        <span className="inline-flex items-center gap-1">
          {label}
          <span className={active ? "text-[var(--accent)]" : "text-[var(--muted-2)]"}>{arrow}</span>
        </span>
      </th>
    );
  };

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
        <table className="w-full text-[13px] min-w-[1100px]">
          <thead>
            <tr className="text-[var(--muted)]">
              <SortableTh k="rank" label="#" />
              <th className="font-medium pb-2 w-24">Tier</th>
              <SortableTh k="address" label="Address" />
              <SortableTh k="totalPoints" label="Total" align="right" />
              {VENUE_COLS.map((v) => (
                <th
                  key={v.key}
                  onClick={() => setSortKey(v.key)}
                  className="font-medium pb-2 cursor-pointer select-none hover:text-[var(--foreground)] text-right"
                >
                  <span className="inline-flex items-center gap-1">
                    {v.label}
                    <span className={sort.key === v.key ? "text-[var(--accent)]" : "text-[var(--muted-2)]"}>
                      {sort.key !== v.key ? "↕" : sort.dir === "asc" ? "↑" : "↓"}
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={12} className="py-6 text-center text-[var(--muted)]">
                  No wallets match.
                </td>
              </tr>
            )}
            {slice.map((w) => {
              const tier = tierFor(w.rank, wallets.length);
              const pct = totalPoints ? (w.totalPoints / totalPoints) * 100 : 0;
              return (
                <tr key={w.address} className="border-t border-[var(--border)]/50">
                  <td className="py-2 text-[var(--muted)] numeric">{w.rank.toLocaleString()}</td>
                  <td className="py-2">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
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
                      className="hover:text-[var(--accent)]"
                      href={`https://jup.ag/portfolio/${w.address}`}
                      target="_blank"
                      rel="noreferrer"
                      title={w.address}
                    >
                      {w.address.slice(0, 6)}…{w.address.slice(-6)}
                    </a>
                  </td>
                  <td className="py-2 text-right numeric">
                    {fmtNum(w.totalPoints)}
                    <div className="text-[10px] text-[var(--muted-2)] numeric">{pct.toFixed(3)}%</div>
                  </td>
                  {VENUE_COLS.map((v) => (
                    <td key={v.key} className="py-2 text-right numeric text-[var(--muted)]">
                      {fmtNum(w[v.key])}
                    </td>
                  ))}
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
