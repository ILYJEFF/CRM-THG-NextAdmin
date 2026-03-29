export function marketingResumeUrl(resumeUrl: string | null | undefined): string | null {
  if (!resumeUrl) return null;
  if (resumeUrl.startsWith("http") || resumeUrl.startsWith("data:"))
    return resumeUrl;
  const base = (
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com"
  ).replace(/\/$/, "");
  const path = resumeUrl.startsWith("/") ? resumeUrl : `/${resumeUrl}`;
  return `${base}${path}`;
}
