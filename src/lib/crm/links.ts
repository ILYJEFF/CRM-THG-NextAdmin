/** Resolves a stored path or absolute URL from the marketing site (uploads, S3, data URL). */
export function marketingAssetUrl(
  url: string | null | undefined
): string | null {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  const base = (
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com"
  ).replace(/\/$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${base}${path}`;
}

export function marketingResumeUrl(url: string | null | undefined): string | null {
  return marketingAssetUrl(url);
}
