export function fmtUsd(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNum(n: number, opts: { compact?: boolean; digits?: number } = {}): string {
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: opts.digits ?? 2,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: opts.digits ?? 0,
  }).format(n);
}

export function fmtPct(n: number, digits = 2): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtAddress(addr: string, head = 4, tail = 4): string {
  if (!addr || addr.length < head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function fmtDate(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
