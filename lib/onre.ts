const REWARDS = "https://rewards.api.onre.finance";
const CORE = "https://core.api.onre.finance";

const HEADERS: HeadersInit = {
  Origin: "https://app.onre.finance",
  Referer: "https://app.onre.finance/",
  "User-Agent": "onre-analytics-by-hanyon/0.1",
  Accept: "application/json",
};

const REVALIDATE = 300; // 5 minutes

async function getJson<T>(url: string, revalidate = REVALIDATE): Promise<T> {
  const res = await fetch(url, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return (await res.json()) as T;
}

async function getText(url: string, revalidate = REVALIDATE): Promise<string> {
  const res = await fetch(url, { headers: HEADERS, next: { revalidate } });
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return (await res.text()).trim();
}

// ---------- types ----------
export type ProtocolKey =
  | "wallet" | "kamino" | "loopscale" | "exponent" | "carrot" | "elemental" | "orca";

export type Distribution = {
  protocol: ProtocolKey;
  capitalUsd: number;
  sharePct: number;
  snapshotDate: string;
};

export type Overview = {
  asOfDate: string;
  totalAumUsd: number;
  activeProtocols: number;
  walletCount: number;
  totalPointsIssued: number;
  totalBasePointsIssued: number;
  totalReferralBonusIssued: number;
  distribution: Distribution[];
};

export type AumPoint = {
  date: string;
  protocol: ProtocolKey;
  aumUsd: number;
  deltaUsd: number | null;
  deltaPct: number | null;
};

export type GrowthPoint = {
  date: string;
  totalPointsIssued: number;
  basePointsIssued: number;
  referralBonusIssued: number;
  dailyTotalGrowth: number;
  dailyBaseGrowth: number;
  dailyReferralGrowth: number;
};

export type LeaderboardRow = {
  rank: number;
  address: string;
  totalPoints: number;
  pointsBreakdown: Record<string, number | Record<string, unknown>>;
  rankChange: number;
  activeMultipliers: unknown;
};

// ---------- fetchers ----------

export async function getOverview(): Promise<Overview> {
  type Raw = {
    points: {
      asOfDate: string;
      totalBasePointsIssued: string | number;
      totalReferralBonusIssued: string | number;
      totalPointsIssued: string | number;
      walletCount: number;
    };
    capital: {
      totalAumUsd: string | number;
      activeProtocols: number;
      distribution: {
        protocol: string;
        capitalUsd: string | number;
        sharePct: string | number;
        snapshotDate: string;
        normalizationMethod: string;
      }[];
    };
  };
  const raw = await getJson<Raw>(`${REWARDS}/api/v1/analytics/overview`);
  return {
    asOfDate: raw.points.asOfDate,
    totalAumUsd: Number(raw.capital.totalAumUsd),
    activeProtocols: raw.capital.activeProtocols,
    walletCount: raw.points.walletCount,
    totalPointsIssued: Number(raw.points.totalPointsIssued),
    totalBasePointsIssued: Number(raw.points.totalBasePointsIssued),
    totalReferralBonusIssued: Number(raw.points.totalReferralBonusIssued),
    distribution: raw.capital.distribution.map((d) => ({
      protocol: d.protocol as ProtocolKey,
      capitalUsd: Number(d.capitalUsd),
      sharePct: Number(d.sharePct),
      snapshotDate: d.snapshotDate,
    })),
  };
}

export async function getAumGrowth(): Promise<AumPoint[]> {
  type Raw = {
    series: { date: string; protocol: string; aumUsd: string | number; deltaUsd: string | number | null; deltaPct: number | null; normalizationMethod: string }[];
  };
  const raw = await getJson<Raw>(`${REWARDS}/api/v1/analytics/aum/growth`);
  return raw.series.map((r) => ({
    date: r.date,
    protocol: r.protocol as ProtocolKey,
    aumUsd: Number(r.aumUsd),
    deltaUsd: r.deltaUsd == null ? null : Number(r.deltaUsd),
    deltaPct: r.deltaPct,
  }));
}

export async function getPointsGrowth(): Promise<GrowthPoint[]> {
  type Raw = { series: GrowthPoint[] };
  const raw = await getJson<Raw>(`${REWARDS}/api/v1/analytics/points/growth`);
  return raw.series ?? [];
}

export async function getLeaderboard(opts: { page?: number; size?: number } = {}): Promise<{
  rows: LeaderboardRow[];
  totalElements: number;
  page: number;
  size: number;
}> {
  const page = opts.page ?? 0;
  const size = opts.size ?? 100;
  type Raw = {
    leaderboard: {
      content: LeaderboardRow[];
      totalElements: number;
      number: number;
      size: number;
      last: boolean;
    };
  };
  const raw = await getJson<Raw>(
    `${REWARDS}/api/v1/points/leaderboard?page=${page}&size=${size}`
  );
  return {
    rows: raw.leaderboard.content,
    totalElements: raw.leaderboard.totalElements,
    page: raw.leaderboard.number,
    size: raw.leaderboard.size,
  };
}

export async function getFullLeaderboard(pageSize = 500): Promise<LeaderboardRow[]> {
  const all: LeaderboardRow[] = [];
  let page = 0;
  while (true) {
    type Raw = {
      leaderboard: { content: LeaderboardRow[]; last: boolean; totalElements: number };
    };
    const raw = await getJson<Raw>(
      `${REWARDS}/api/v1/points/leaderboard?page=${page}&size=${pageSize}`,
      900,
    );
    all.push(...raw.leaderboard.content);
    if (raw.leaderboard.last) break;
    page += 1;
  }
  return all;
}

export async function getLiveNav(): Promise<number> {
  return Number(await getText(`${CORE}/data/live-nav`));
}

export async function getLiveTvl(): Promise<number> {
  return Number(await getText(`${CORE}/data/live-tvl`));
}

export async function getLiveApy(): Promise<number> {
  return Number(await getText(`${CORE}/data/live-apy`));
}

// ---------- derived helpers ----------

const PROTOCOL_ORDER: ProtocolKey[] = [
  "kamino", "loopscale", "wallet", "exponent", "orca", "elemental", "carrot",
];

// Distinct partner colors (donut + stacked bar chart).
// Hues chosen to be unambiguous on the dark theme and roughly tied to each
// partner's identity (Orca = cyan, Carrot = orange, etc.). The OnRe accent
// (#F2C140) is reserved for app chrome and stays off this palette.
export const PROTOCOL_COLORS: Record<ProtocolKey, string> = {
  kamino:    "#5A9BD4",  // blue
  loopscale: "#10B981",  // green
  wallet:    "#F5F2EF",  // bone (HODL)
  exponent:  "#A78BFA",  // violet
  orca:      "#06B6D4",  // cyan
  elemental: "#EC4899",  // magenta
  carrot:    "#F97316",  // orange
};

// Extended palette for venues that appear in pointsBreakdown but aren't TVL partners.
export const VENUE_COLORS: Record<string, string> = {
  ...PROTOCOL_COLORS,
  ratex: "#FBBF24",
  carrotLending: "#FB923C",
  referralBonus: "#F2C140",
  permissionlessBoost: "#94A3B8",
};

export function VENUE_LABEL(v: string): string {
  return (
    {
      wallet: "Wallet (HODL)",
      kamino: "Kamino",
      loopscale: "Loopscale",
      exponent: "Exponent",
      orca: "Orca",
      elemental: "Elemental",
      carrot: "Carrot",
      carrotLending: "Carrot Lending",
      ratex: "RateX",
      referralBonus: "Referral bonus",
      permissionlessBoost: "Permissionless boost",
    }[v] ?? v
  );
}

/** Sum every numeric leaf inside a possibly-nested object. */
export function sumLeaves(obj: unknown): number {
  if (typeof obj === "number") return obj;
  if (obj && typeof obj === "object") {
    let s = 0;
    for (const v of Object.values(obj as Record<string, unknown>)) s += sumLeaves(v);
    return s;
  }
  return 0;
}

export function walletVenueTotals(row: LeaderboardRow): { venue: string; points: number }[] {
  const out: { venue: string; points: number }[] = [];
  for (const [k, v] of Object.entries(row.pointsBreakdown ?? {})) {
    const sum = sumLeaves(v);
    if (sum > 0) out.push({ venue: k, points: sum });
  }
  return out.sort((a, b) => b.points - a.points);
}

export const PROTOCOL_LABEL: Record<ProtocolKey, string> = {
  kamino: "Kamino",
  loopscale: "Loopscale",
  wallet: "Wallet (HODL)",
  exponent: "Exponent",
  orca: "Orca",
  elemental: "Elemental",
  carrot: "Carrot",
};

export function pivotAumByDate(series: AumPoint[]): {
  data: Array<{ date: string } & Partial<Record<ProtocolKey, number>>>;
  protocols: ProtocolKey[];
} {
  const by = new Map<string, Record<string, number>>();
  for (const r of series) {
    if (!by.has(r.date)) by.set(r.date, {});
    by.get(r.date)![r.protocol] = r.aumUsd;
  }
  const protocols = Array.from(new Set(series.map((r) => r.protocol)))
    .sort((a, b) => PROTOCOL_ORDER.indexOf(a) - PROTOCOL_ORDER.indexOf(b)) as ProtocolKey[];

  const data = Array.from(by.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, row]) => ({ date, ...(row as Partial<Record<ProtocolKey, number>>) }));

  return { data, protocols };
}

export function deltaPctOver(series: GrowthPoint[], days: number): number | null {
  if (series.length < days + 1) return null;
  const last = series[series.length - 1].totalPointsIssued;
  const prev = series[series.length - 1 - days].totalPointsIssued;
  if (!prev) return null;
  return (last - prev) / prev;
}

export function avgDailyGrowth(series: GrowthPoint[], days: number): number {
  const slice = series.slice(-days);
  if (!slice.length) return 0;
  return slice.reduce((s, p) => s + p.dailyTotalGrowth, 0) / slice.length;
}

export function venueAggregates(rows: LeaderboardRow[]): { venue: string; points: number }[] {
  function sumLeaves(o: unknown): number {
    if (typeof o === "number") return o;
    if (o && typeof o === "object") {
      let s = 0;
      for (const v of Object.values(o as Record<string, unknown>)) s += sumLeaves(v);
      return s;
    }
    return 0;
  }
  const agg = new Map<string, number>();
  for (const r of rows) {
    for (const [k, v] of Object.entries(r.pointsBreakdown ?? {})) {
      agg.set(k, (agg.get(k) ?? 0) + sumLeaves(v));
    }
  }
  return [...agg.entries()]
    .map(([venue, points]) => ({ venue, points }))
    .sort((a, b) => b.points - a.points);
}

export type Bucket = { label: string; min: number; max: number; count: number; points: number };

export function bucketize(rows: LeaderboardRow[]): Bucket[] {
  const defs: { label: string; min: number; max: number }[] = [
    { label: "exactly 0",   min: 0, max: 0 },
    { label: "1 – 999",     min: 1, max: 1_000 },
    { label: "1K – 10K",    min: 1_000, max: 10_000 },
    { label: "10K – 100K",  min: 10_000, max: 100_000 },
    { label: "100K – 1M",   min: 100_000, max: 1_000_000 },
    { label: "1M – 5M",     min: 1_000_000, max: 5_000_000 },
    { label: "5M – 10M",    min: 5_000_000, max: 10_000_000 },
    { label: "10M – 50M",   min: 10_000_000, max: 50_000_000 },
    { label: "50M – 100M",  min: 50_000_000, max: 100_000_000 },
    { label: "100M – 500M", min: 100_000_000, max: 500_000_000 },
    { label: "500M – 1B",   min: 500_000_000, max: 1_000_000_000 },
    { label: "1B+",         min: 1_000_000_000, max: Number.POSITIVE_INFINITY },
  ];
  const buckets: Bucket[] = defs.map((d) => ({ ...d, count: 0, points: 0 }));
  for (const r of rows) {
    const p = r.totalPoints;
    for (const b of buckets) {
      if (b.min === 0 && b.max === 0) {
        if (p === 0) { b.count++; b.points += p; break; }
      } else if (p >= b.min && p < b.max) {
        b.count++; b.points += p; break;
      }
    }
  }
  return buckets;
}

export type Tier = {
  label: string;
  tone: "top1" | "top5" | "top10" | "top25" | "top50" | "rest";
  count: number;
  points: number;
};

export function tierBreakdown(rows: LeaderboardRow[]): Tier[] {
  const sorted = [...rows].sort((a, b) => b.totalPoints - a.totalPoints);
  const n = sorted.length;
  const cuts: Array<{ label: string; tone: Tier["tone"]; pct: number }> = [
    { label: "Top 1%", tone: "top1", pct: 0.01 },
    { label: "Top 5%", tone: "top5", pct: 0.05 },
    { label: "Top 10%", tone: "top10", pct: 0.10 },
    { label: "Top 25%", tone: "top25", pct: 0.25 },
    { label: "Top 50%", tone: "top50", pct: 0.50 },
    { label: "Bottom 50%", tone: "rest", pct: 1.0 },
  ];
  const tiers: Tier[] = [];
  let prevEnd = 0;
  for (const c of cuts) {
    const end = Math.floor(n * c.pct);
    const slice = sorted.slice(prevEnd, end);
    tiers.push({
      label: c.label,
      tone: c.tone,
      count: slice.length,
      points: slice.reduce((s, r) => s + r.totalPoints, 0),
    });
    prevEnd = end;
  }
  return tiers;
}

export const TIER_COLORS: Record<Tier["tone"], string> = {
  top1: "var(--accent)",
  top5: "#FFD96B",
  top10: "#A78BFA",
  top25: "#06B6D4",
  top50: "#10B981",
  rest: "var(--muted-2)",
};

export function concentration(rows: LeaderboardRow[]): {
  topShare: { label: string; share: number }[];
  gini: number;
} {
  const sorted = [...rows.map((r) => r.totalPoints)].sort((a, b) => b - a);
  const total = sorted.reduce((s, x) => s + x, 0);
  const n = sorted.length;
  const share = (k: number) => sorted.slice(0, k).reduce((s, x) => s + x, 0) / total;
  const pctK = (p: number) => Math.max(1, Math.floor((n * p) / 100));
  const topShare = [
    { label: "Top 1", share: share(1) },
    { label: "Top 10", share: share(10) },
    { label: "Top 100", share: share(100) },
    { label: "Top 1%", share: share(pctK(1)) },
    { label: "Top 5%", share: share(pctK(5)) },
    { label: "Top 10%", share: share(pctK(10)) },
  ];
  const asc = [...sorted].sort((a, b) => a - b);
  const sx = asc.reduce((s, x, i) => s + (i + 1) * x, 0);
  const sumAsc = asc.reduce((s, x) => s + x, 0);
  const gini = sumAsc ? (2 * sx) / (n * sumAsc) - (n + 1) / n : 0;
  return { topShare, gini };
}
