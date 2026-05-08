"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Defers Recharts rendering until after client mount. Recharts' ResponsiveContainer
 * tries to measure the DOM during SSR (where width/height are 0 or -1), which produces
 * a noisy console warning on every render. Rendering only after mount cleans that up
 * without affecting visible output.
 */
export function ChartMount({ children, className }: { children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <div className={className}>{mounted ? children : null}</div>;
}
