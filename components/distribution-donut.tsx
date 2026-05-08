"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ProtocolKey } from "@/lib/onre";
import { PROTOCOL_COLORS, PROTOCOL_LABEL } from "@/lib/onre";

type Slice = { protocol: ProtocolKey; capitalUsd: number; sharePct: number };

export function DistributionDonut({ data, totalUsd }: { data: Slice[]; totalUsd: number }) {
  const sorted = [...data].sort((a, b) => b.capitalUsd - a.capitalUsd);
  return (
    <div className="card p-5">
      <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold mb-4">
        Current distribution
      </div>
      <div className="relative mx-auto h-[200px] w-full max-w-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={sorted}
              dataKey="capitalUsd"
              nameKey="protocol"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={1.5}
              stroke="var(--surface)"
              strokeWidth={1}
            >
              {sorted.map((s) => (
                <Cell key={s.protocol} fill={PROTOCOL_COLORS[s.protocol]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 12,
              }}
              formatter={(v, _name, props) => {
                const pct = ((Number(v ?? 0) / (totalUsd || 1)) * 100).toFixed(2);
                const label = PROTOCOL_LABEL[(props as { payload: Slice }).payload.protocol] ?? "";
                return [
                  `${Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(v ?? 0))} · ${pct}%`,
                  label,
                ];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">TVL</div>
          <div className="numeric text-xl font-semibold mt-0.5">
            {Intl.NumberFormat("en-US", { notation: "compact", style: "currency", currency: "USD", maximumFractionDigits: 1 }).format(totalUsd)}
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {sorted.map((s) => (
          <li key={s.protocol} className="flex items-center justify-between text-[13px]">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: PROTOCOL_COLORS[s.protocol] }} />
              {PROTOCOL_LABEL[s.protocol] ?? s.protocol}
            </span>
            <span className="numeric text-[var(--muted)]">{(s.sharePct * 100).toFixed(2)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
