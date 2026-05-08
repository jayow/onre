"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "@/lib/onre";

export function BucketsChart({ buckets, totalWallets }: { buckets: Bucket[]; totalWallets: number }) {
  const data = buckets.map((b) => ({
    label: b.label,
    wallets: b.count,
    sharePctOfWallets: totalWallets ? (b.count / totalWallets) * 100 : 0,
    points: b.points,
  }));

  return (
    <div className="card p-4 md:p-6">
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 36, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--muted-2)"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              interval={0}
              angle={-25}
              dy={8}
              height={56}
              label={{
                value: "Points held",
                position: "insideBottom",
                offset: -4,
                fill: "var(--muted)",
                fontSize: 11,
              }}
            />
            <YAxis
              stroke="var(--muted-2)"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              width={68}
              tickFormatter={(n: number) => Intl.NumberFormat("en-US", { notation: "compact" }).format(n)}
              label={{
                value: "No. of wallets",
                angle: -90,
                position: "insideLeft",
                offset: 8,
                fill: "var(--muted)",
                fontSize: 11,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--foreground)", fontSize: 12 }}
              labelStyle={{ color: "var(--muted)" }}
              formatter={(v, name) => {
                if (String(name) === "wallets")
                  return [`${Intl.NumberFormat("en-US").format(Number(v ?? 0))} wallets`, "Wallets"];
                return [String(v), String(name)];
              }}
            />
            <Bar dataKey="wallets" fill="var(--accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
