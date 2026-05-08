"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import type { GrowthPoint } from "@/lib/onre";

const LOOK_AHEAD_DAYS = 7;

export function PointsChart({
  series,
  rate7d,
  currentTotal,
}: {
  series: GrowthPoint[];
  rate7d: number;
  currentTotal: number;
}) {
  const lastDate = series.at(-1)?.date ?? new Date().toISOString().slice(0, 10);
  const lastValue = series.at(-1)?.totalPointsIssued ?? 0;
  type Row = { date: string; actual?: number; proj7?: number };
  const data: Row[] = series.slice(0, -1).map((p) => ({ date: p.date, actual: p.totalPointsIssued }));
  data.push({ date: lastDate, actual: lastValue, proj7: lastValue });
  for (let i = 1; i <= LOOK_AHEAD_DAYS; i++) {
    const d = new Date(lastDate);
    d.setUTCDate(d.getUTCDate() + i);
    data.push({
      date: d.toISOString().slice(0, 10),
      proj7: lastValue + rate7d * i,
    });
  }

  return (
    <div className="card p-4 md:p-6">
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 24, right: 28, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g-actual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id="g-proj" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="var(--muted-2)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              minTickGap={48}
              tickFormatter={(d: string) => {
                const dt = new Date(d);
                return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
              stroke="var(--muted-2)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={56}
              tickFormatter={(n: number) =>
                Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
              }
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted)" }}
              formatter={(v, name) => {
                const label = String(name) === "actual" ? "Issued" : "Projection · 7d rate";
                return [Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(v ?? 0)), label];
              }}
            />
            <Area type="monotone" dataKey="actual" stroke="var(--accent)" fill="url(#g-actual)" strokeWidth={1.8} dot={false} />
            <Area type="monotone" dataKey="proj7" stroke="var(--accent-strong)" strokeDasharray="4 4" fill="url(#g-proj)" strokeWidth={1.4} dot={false} />
            {/* Vertical "Now" marker drawn LAST so it paints on top of the area fills */}
            <ReferenceLine
              x={lastDate}
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="5 4"
              label={{
                value: `Now · ${Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(currentTotal)}`,
                position: "insideTopRight",
                fill: "var(--accent)",
                fontSize: 11,
                offset: 8,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

