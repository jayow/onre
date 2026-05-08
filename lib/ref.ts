export const REFERRAL_CODE = "OLG6E6KV3P";

const ONRE_HOSTS = ["onre.finance", "www.onre.finance", "app.onre.finance", "docs.onre.finance"];

export function withRef(url: string): string {
  try {
    const u = new URL(url);
    if (!ONRE_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith("." + h))) return url;
    if (!u.searchParams.has("ref")) u.searchParams.set("ref", REFERRAL_CODE);
    return u.toString();
  } catch {
    return url;
  }
}
