export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--border)]/60">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <a
          href="https://hanyon.app"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 group"
        >
          <span
            aria-hidden
            className="block transition-colors"
            style={{
              width: 36,
              height: 36,
              backgroundColor: "var(--accent)",
              maskImage: "url(/hanyon-logo.svg)",
              WebkitMaskImage: "url(/hanyon-logo.svg)",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          <span className="text-[12px] text-[var(--muted)] group-hover:text-[var(--foreground)]">
            by{" "}
            <span className="text-[var(--accent)] font-semibold">Hanyon Analytics</span>
            <span className="block text-[10px] text-[var(--muted-2)]">hanyon.app</span>
          </span>
        </a>
        <div className="text-[11px] text-[var(--muted-2)]">
          Independent dashboard. Not affiliated with OnRe.
        </div>
      </div>
    </footer>
  );
}
