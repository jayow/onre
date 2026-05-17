"use client";

import { useMemo, useState } from "react";
import { EXPONENT_MARKETS, EXPONENT_MATURITY, type ExponentMarket } from "@/lib/onre";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";

type Inputs = {
  market: ExponentMarket;
  ytSpend: string;
  ytEntryPrice: string;
  userPoints: string;
  totalPointsAtMaturity: string;
  allocationPct: string;
  fdv: string;
  supply: string;
};

const DEFAULT: Inputs = {
  market: "SEP-2026",
  ytSpend: "1000",
  ytEntryPrice: "",
  userPoints: "10000000",
  totalPointsAtMaturity: "20000000000",
  allocationPct: "10",
  fdv: "100000000",
  supply: "1000000000",
};

export function YtCalculator({
  currentNetworkPoints,
}: {
  currentNetworkPoints: number;
}) {
  const [i, setI] = useState<Inputs>(DEFAULT);

  const out = useMemo(() => {
    const userPts = Number(i.userPoints) || 0;
    const totalPts = Number(i.totalPointsAtMaturity) || 0;
    const allocPct = Number(i.allocationPct) / 100;
    const fdv = Number(i.fdv) || 0;
    const supply = Number(i.supply) || 0;
    const share = totalPts > 0 ? userPts / totalPts : 0;
    const programTokens = allocPct * supply;
    const userTokens = share * programTokens;
    const pricePerToken = supply > 0 ? fdv / supply : 0;
    const userValue = userTokens * pricePerToken;
    const ytSpend = Number(i.ytSpend) || 0;
    const ytReturn = ytSpend > 0 ? userValue / ytSpend - 1 : 0;
    const ytPrice = Number(i.ytEntryPrice) || 0;
    const ytUnits = ytPrice > 0 ? ytSpend / ytPrice : 0;
    return {
      share,
      programTokens,
      userTokens,
      pricePerToken,
      userValue,
      ytReturn,
      ytUnits,
    };
  }, [i]);

  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setI((p) => ({ ...p, [k]: e.target.value }));

  const reset = () => setI(DEFAULT);

  const daysToMaturity = (() => {
    const d = new Date(EXPONENT_MATURITY[i.market]);
    const diff = (d.getTime() - Date.now()) / 86_400_000;
    return Math.round(diff);
  })();

  return (
    <div className="card p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] font-semibold">
          YT → token allocation calculator
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] rounded-full px-2.5 py-1"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <Group title="Your position">
          <Field label="$ spent on YT">
            <NumberInput value={i.ytSpend} onChange={set("ytSpend")} prefix="$" />
          </Field>
          <Field label="Market">
            <select
              value={i.market}
              onChange={set("market")}
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-[13px]"
            >
              {EXPONENT_MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="mt-1 text-[10.5px] text-[var(--muted-2)]">
              {daysToMaturity > 0
                ? `${daysToMaturity}d to maturity (${EXPONENT_MATURITY[i.market]})`
                : `matured ${-daysToMaturity}d ago`}
            </div>
          </Field>
          <Field label="Entry YT price">
            <NumberInput value={i.ytEntryPrice} onChange={set("ytEntryPrice")} placeholder="optional" />
            {out.ytUnits > 0 && (
              <div className="mt-1 text-[10.5px] text-[var(--muted-2)]">
                {fmtNum(out.ytUnits)} YT units
              </div>
            )}
          </Field>
          <Field label="Your YT points at maturity">
            <NumberInput value={i.userPoints} onChange={set("userPoints")} />
          </Field>
        </Group>

        <Group title="Network & allocation assumptions">
          <Field
            label="Total network points at maturity"
            hint={`now: ${fmtNum(currentNetworkPoints, { compact: true })}`}
          >
            <NumberInput
              value={i.totalPointsAtMaturity}
              onChange={set("totalPointsAtMaturity")}
            />
          </Field>
          <Field label="Allocation to points program">
            <NumberInput value={i.allocationPct} onChange={set("allocationPct")} suffix="%" />
          </Field>
          <Field label="Token supply">
            <NumberInput value={i.supply} onChange={set("supply")} />
          </Field>
          <Field label="FDV">
            <NumberInput value={i.fdv} onChange={set("fdv")} prefix="$" />
            <div className="mt-1 text-[10.5px] text-[var(--muted-2)]">
              {out.pricePerToken > 0 ? `$${out.pricePerToken.toFixed(4)} / token` : ""}
            </div>
          </Field>
        </Group>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 pt-4 border-t border-[var(--border)]/60">
        <Result label="Your share">{fmtPct(out.share, 4)}</Result>
        <Result label="Tokens allocated">
          <span className="text-[var(--accent)]">{fmtNum(out.userTokens, { compact: true, digits: 2 })}</span>
        </Result>
        <Result label="$ value at FDV">
          <span className="text-[var(--accent)]">{fmtUsd(out.userValue, { compact: true })}</span>
        </Result>
        <Result label="Return on YT spend">
          {Number(i.ytSpend) > 0 ? (
            <span className={out.ytReturn >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}>
              {out.ytReturn >= 0 ? "+" : ""}
              {fmtPct(out.ytReturn, 1)}
            </span>
          ) : (
            <span className="text-[var(--muted-2)]">—</span>
          )}
        </Result>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--muted-2)] uppercase tracking-wider mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--muted)]">
        {label}
        {hint && <span className="text-[var(--muted-2)] ml-1.5">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--muted-2)]">
          {prefix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-md py-1.5 text-[13px] numeric focus:outline-none focus:border-[var(--accent)]/60"
        style={{
          paddingLeft: prefix ? 18 : 10,
          paddingRight: suffix ? 22 : 10,
        }}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--muted-2)]">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Result({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-[var(--muted-2)] uppercase tracking-wider">{label}</div>
      <div className="mt-1.5 text-[20px] font-semibold leading-none numeric">{children}</div>
    </div>
  );
}
