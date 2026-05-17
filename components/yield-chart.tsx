"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YieldPoint } from "@/lib/onre";
import { ChartMount } from "@/components/chart-mount";

type View = "nav" | "apy";

export function YieldChart({ series }: { series: YieldPoint[] }) {
  const [view, setView] = useState<View>("nav");

  return (
    <div className="card p-4 md:p-6">
      <div className="flex items-center justify-end mb-3 gap-1">
        <TabPill active={view === "nav"} onClick={() => setView("nav")}>
          NAV growth
        </TabPill>
        <TabPill active={view === "apy"} onClick={() => setView("apy")}>
          Rolling APY
        </TabPill>
      </div>
      <ChartMount className="h-[320px] w-full">
        {view === "nav" ? <NavView series={series} /> : <ApyView series={series} />}
      </ChartMount>
    </div>
  );
}

function NavView({ series }: { series: YieldPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={series} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="g-nav" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
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
          tickFormatter={(d: string) =>
            new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis
          stroke="var(--muted-2)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={56}
          domain={["dataMin", "dataMax"]}
          tickFormatter={(n: number) => n.toFixed(3)}
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
          itemStyle={{ color: "var(--foreground)" }}
          labelFormatter={(d) =>
            new Date(String(d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          }
          formatter={(_v, _name, item) => {
            const p = item.payload as YieldPoint;
            return [
              `${p.nav.toFixed(6)}  ·  +${(p.cumulativeReturn * 100).toFixed(2)}% since inception`,
              "NAV",
            ];
          }}
        />
        <Area
          type="monotone"
          dataKey="nav"
          stroke="var(--accent)"
          fill="url(#g-nav)"
          strokeWidth={1.8}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ApyView({ series }: { series: YieldPoint[] }) {
  const data = series.filter((p) => p.apy30d != null);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 16, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
        <XAxis
          dataKey="date"
          stroke="var(--muted-2)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          minTickGap={48}
          tickFormatter={(d: string) =>
            new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis
          stroke="var(--muted-2)"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          width={56}
          tickFormatter={(n: number) => `${(n * 100).toFixed(1)}%`}
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
          itemStyle={{ color: "var(--foreground)" }}
          labelFormatter={(d) =>
            new Date(String(d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          }
          formatter={(v, name) => [
            v == null ? "—" : `${(Number(v) * 100).toFixed(2)}%`,
            name === "apy7d" ? "7-day APY" : "30-day APY",
          ]}
        />
        <Line
          type="monotone"
          dataKey="apy7d"
          stroke="color-mix(in srgb, var(--accent) 60%, transparent)"
          strokeWidth={1.3}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="apy30d"
          stroke="var(--accent)"
          strokeWidth={1.8}
          dot={false}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function TabPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-[11.5px] border transition-colors"
      style={{
        borderColor: active ? "var(--accent)" : "var(--border)",
        background: active ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent",
        color: active ? "var(--accent)" : "var(--muted)",
      }}
    >
      {children}
    </button>
  );
}
