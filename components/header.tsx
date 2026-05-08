import { withRef } from "@/lib/ref";

export function SiteHeader() {
  return (
    <header className="bg-[var(--background)]/85 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href={withRef("https://app.onre.finance/earn")}
            aria-label="OnRe"
            className="flex items-center"
          >
            <span
              aria-hidden
              className="block"
              style={{
                width: 84,
                height: 18,
                backgroundColor: "var(--foreground)",
                maskImage: "url(/onre-logo.svg)",
                WebkitMaskImage: "url(/onre-logo.svg)",
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskSize: "contain",
                WebkitMaskSize: "contain",
                maskPosition: "left center",
                WebkitMaskPosition: "left center",
              }}
            />
          </a>
          <span aria-hidden className="h-5 w-px bg-[var(--border)]" />
          <a
            href="https://hanyon.app"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            by <span className="text-[var(--accent)] font-semibold">Hanyon Analytics</span>
          </a>
        </div>
        <a href={withRef("https://app.onre.finance/earn")} className="btn-primary">
          Join OnRe
        </a>
      </div>
    </header>
  );
}
