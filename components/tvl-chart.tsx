"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ProtocolKey } from "@/lib/onre";
import { PROTOCOL_COLORS, PROTOCOL_LABEL } from "@/lib/onre";
import { ChartMount } from "@/components/chart-mount";

type Row = { date: string } & Partial<Record<ProtocolKey, number>>;

function aggregateWeekly(data: Row[], protocols: ProtocolKey[]): Row[] {
  if (!data.length) return [];
  const buckets = new Map<string, Row>();
  for (const row of data) {
    const d = new Date(row.date);
    const day = (d.getUTCDay() + 6) % 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - day);
    const key = monday.toISOString().slice(0, 10);
    let cur = buckets.get(key);
    if (!cur) {
      cur = { date: key } as Row;
      buckets.set(key, cur);
    }
    for (const p of protocols) {
      const v = row[p];
      if (typeof v === "number" && row.date >= (cur.date as string)) {
        (cur as Record<string, number | string>)[p] = v;
      }
    }
  }
  return [...buckets.values()].sort((a, b) => (a.date as string).localeCompare(b.date as string));
}

export function TvlChart({ data, protocols }: { data: Row[]; protocols: ProtocolKey[] }) {
  const weekly = useMemo(() => aggregateWeekly(data, protocols), [data, protocols]);
  const [hidden, setHidden] = useState<Set<ProtocolKey>>(() => new Set());

  const visibleProtos = protocols.filter((p) => !hidden.has(p));
  const allVisible = hidden.size === 0;

  const toggle = (p: ProtocolKey) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });

  const solo = (p: ProtocolKey) => setHidden(new Set(protocols.filter((x) => x !== p)));
  const showAll = () => setHidden(new Set());

  return (
    <div className="card p-4 md:p-6">
      <ChartMount className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weekly} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
                Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 }).format(n)
              }
            />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--foreground)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted)" }}
              itemSorter={(item) => -Number(item.value ?? 0)}
              formatter={(v, name) => [
                Intl.NumberFormat("en-US", {
                  notation: "compact",
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 2,
                }).format(Number(v ?? 0)),
                PROTOCOL_LABEL[String(name) as ProtocolKey] ?? String(name),
              ]}
            />
            {visibleProtos.map((p) => (
              <Bar key={p} dataKey={p} stackId="1" fill={PROTOCOL_COLORS[p]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartMount>

      {/* Interactive legend — single row, scrolls horizontally on narrow screens */}
      <div className="mt-4 flex items-center gap-2 flex-nowrap overflow-x-auto whitespace-nowrap pb-1">
        {protocols.map((p) => {
          const off = hidden.has(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              onDoubleClick={() => solo(p)}
              title="Click to toggle · double-click to solo"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11.5px] transition-colors"
              style={{
                borderColor: off ? "var(--border)" : "transparent",
                background: off ? "transparent" : "var(--surface-2)",
                color: off ? "var(--muted-2)" : "var(--foreground)",
              }}
              aria-pressed={!off}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{
                  background: off ? "transparent" : PROTOCOL_COLORS[p],
                  boxShadow: off ? `inset 0 0 0 1.5px ${PROTOCOL_COLORS[p]}` : "none",
                  opacity: off ? 0.55 : 1,
                }}
              />
              <span className={off ? "line-through opacity-60" : ""}>{PROTOCOL_LABEL[p]}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => (allVisible ? setHidden(new Set(protocols)) : showAll())}
          className="ml-auto shrink-0 px-2.5 py-1 rounded-full text-[11.5px] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--accent)]"
        >
          {allVisible ? "Hide all" : "Show all"}
        </button>
      </div>
    </div>
  );
}
