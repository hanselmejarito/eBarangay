/** Hall clocks are Philippine time (UTC+8, no DST). */

export const HALL_TIME_ZONE = "Asia/Manila";

const MANILA_OFFSET_HOURS = 8;

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) {
  return parts.find((p) => p.type === type)?.value ?? "";
}

/**
 * Read `<input type="datetime-local">` (no timezone) as Manila wall time.
 * `new Date("2026-08-31T21:39")` would otherwise use the server TZ (UTC on Vercel/WSL).
 */
export function parseManilaDateTime(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? 0);
  return new Date(
    Date.UTC(year, month - 1, day, hour - MANILA_OFFSET_HOURS, minute, second),
  );
}

/** Read `<input type="date">` as midnight in Manila. */
export function parseManilaDate(value: string | undefined | null): Date | null {
  if (!value?.trim()) return null;
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  return new Date(
    Date.UTC(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      -MANILA_OFFSET_HOURS,
      0,
      0,
    ),
  );
}

export function toManilaDateTimeLocal(value: Date | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HALL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}T${part(parts, "hour")}:${part(parts, "minute")}`;
}

export function toManilaDateInput(value: Date | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HALL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

export function formatManilaDateTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleString("en-PH", {
    timeZone: HALL_TIME_ZONE,
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function formatManilaDate(
  value: Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
) {
  if (!value) return null;
  return value.toLocaleDateString("en-PH", {
    timeZone: HALL_TIME_ZONE,
    ...options,
  });
}
