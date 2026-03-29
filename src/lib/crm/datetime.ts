import { formatInTimeZone } from "date-fns-tz";

/** All CRM-facing dates and times use Chicago time (CST/CDT). */
export const CRM_TIME_ZONE = "America/Chicago";

export const CRM_TIME_ZONE_LABEL = "Central Time";

function toDate(date: Date | string | number): Date {
  return date instanceof Date ? date : new Date(date);
}

/** Format an instant in America/Chicago (UI tables, profiles, activity). */
export function formatCrm(
  date: Date | string | number,
  pattern: string
): string {
  return formatInTimeZone(toDate(date), CRM_TIME_ZONE, pattern);
}
