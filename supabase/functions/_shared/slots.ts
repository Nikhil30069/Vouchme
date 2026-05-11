// =============================================================================
// Slot generator — pure, deterministic, no IO.
//
// Given a referrer's availability window, their Google Calendar busy intervals,
// and any already-confirmed bookings, return the open 1-hour slots over the
// next N days. Pure functions are easy to unit-test exhaustively; the Edge
// Function wraps this with IO (fetch FreeBusy, query DB, etc.).
//
// Timezone math uses only built-in `Intl.DateTimeFormat` so this module runs
// unchanged in both Deno (Edge Function) and Node (Vitest).
// =============================================================================

export interface BusyInterval {
  start: string; // ISO timestamp, UTC or with offset — parseable by `new Date`
  end: string;
}

export interface AvailabilityWindow {
  /** "HH:MM" — local wall-clock start in the IANA timezone */
  start: string;
  /** "HH:MM" — local wall-clock end (exclusive) in the IANA timezone */
  end: string;
  /** ISO weekdays the referrer is available on: Mon = 1 … Sun = 7 */
  days: number[];
  /** IANA timezone, e.g., "Asia/Kolkata" */
  timezone: string;
}

export interface GenerateOptions {
  /** "Now" — slot generation will never return a slot earlier than this. */
  now: Date;
  /** Busy intervals fetched from Google FreeBusy. */
  busy: BusyInterval[];
  /** ISO start timestamps of slots already confirmed in our DB. */
  existing: string[];
  availability: AvailabilityWindow;
  /** How many days forward to look. Default 7. */
  daysAhead?: number;
  /** Slot length. Default 60. */
  slotMinutes?: number;
  /** Minimum lead time before a slot can be booked. Default 60. */
  leadMinutes?: number;
}

export interface Slot {
  start: string; // ISO UTC
  end: string;   // ISO UTC
}

export function generateSlots(opts: GenerateOptions): Slot[] {
  const {
    now,
    busy,
    existing,
    availability,
    daysAhead = 7,
    slotMinutes = 60,
    leadMinutes = 60,
  } = opts;

  const earliest = now.getTime() + leadMinutes * 60_000;
  const existingMs = new Set(existing.map((iso) => new Date(iso).getTime()));
  const busyParsed = busy.map((b) => ({
    start: new Date(b.start).getTime(),
    end: new Date(b.end).getTime(),
  }));

  const slots: Slot[] = [];
  const stepMs = slotMinutes * 60_000;
  const dayMs = 24 * 60 * 60_000;

  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const dayProbe = new Date(now.getTime() + dayOffset * dayMs);
    const parts = getZonedDateParts(dayProbe, availability.timezone);
    if (!availability.days.includes(parts.weekday)) continue;

    const [startH, startM] = parseHM(availability.start);
    const [endH, endM] = parseHM(availability.end);
    const windowStart = zonedTimeToUtcMs(parts.year, parts.month, parts.day, startH, startM, availability.timezone);
    const windowEnd = zonedTimeToUtcMs(parts.year, parts.month, parts.day, endH, endM, availability.timezone);

    if (windowEnd <= windowStart) continue;

    for (let slotStartMs = windowStart; slotStartMs + stepMs <= windowEnd; slotStartMs += stepMs) {
      const slotEndMs = slotStartMs + stepMs;
      if (slotStartMs < earliest) continue;
      if (existingMs.has(slotStartMs)) continue;
      const overlaps = busyParsed.some((b) => slotStartMs < b.end && slotEndMs > b.start);
      if (overlaps) continue;
      slots.push({
        start: new Date(slotStartMs).toISOString(),
        end: new Date(slotEndMs).toISOString(),
      });
    }
  }

  return slots;
}

// === Validation helpers =====================================================

/**
 * Verify a candidate slot_start is still aligned with the referrer's
 * availability window — used by the book-slot Edge Function as a server-side
 * guard against tampered or stale slots from the client.
 */
export function isSlotValid(slotStart: Date, availability: AvailabilityWindow, slotMinutes = 60): boolean {
  const parts = getZonedDateParts(slotStart, availability.timezone);
  if (!availability.days.includes(parts.weekday)) return false;

  const [startH, startM] = parseHM(availability.start);
  const [endH, endM] = parseHM(availability.end);
  const windowStartMs = zonedTimeToUtcMs(parts.year, parts.month, parts.day, startH, startM, availability.timezone);
  const windowEndMs = zonedTimeToUtcMs(parts.year, parts.month, parts.day, endH, endM, availability.timezone);

  const slotMs = slotStart.getTime();
  if (slotMs < windowStartMs) return false;
  if (slotMs + slotMinutes * 60_000 > windowEndMs) return false;

  // Slot must be aligned to the hour boundary from windowStart.
  const offset = (slotMs - windowStartMs) % (slotMinutes * 60_000);
  return offset === 0;
}

// === Timezone helpers ======================================================

function parseHM(hm: string): [number, number] {
  const [h, m] = hm.split(":").map((s) => parseInt(s, 10));
  return [h || 0, m || 0];
}

/**
 * Return Y/M/D and ISO weekday of `date` as observed in the given timezone.
 * Uses Intl, so no external deps and full DST awareness.
 */
function getZonedDateParts(date: Date, timezone: string): {
  year: number;
  month: number;
  day: number;
  weekday: number;
} {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const obj: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) obj[p.type] = p.value;
  const weekdayMap: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
  };
  return {
    year: parseInt(obj.year, 10),
    month: parseInt(obj.month, 10),
    day: parseInt(obj.day, 10),
    weekday: weekdayMap[obj.weekday] ?? 0,
  };
}

/**
 * Offset of `timezone` from UTC at the instant `date`, in minutes.
 * Positive for zones east of UTC (e.g., +330 for IST).
 */
function getOffsetMinutes(date: Date, timezone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const part = dtf.formatToParts(date).find((p) => p.type === "timeZoneName");
  if (!part) return 0;
  // "GMT", "GMT+5:30", "GMT-7", "GMT+10"
  const m = /GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?/.exec(part.value);
  if (!m || !m[1]) return 0;
  const sign = m[1] === "+" ? 1 : -1;
  const h = parseInt(m[2], 10);
  const min = m[3] ? parseInt(m[3], 10) : 0;
  return sign * (h * 60 + min);
}

/**
 * Convert "Y/M/D H:M in `timezone`" to a UTC timestamp in milliseconds.
 *
 * Approach: treat the wall time as if it were UTC, then subtract the local
 * offset at that instant. This handles DST correctly because the offset is
 * looked up at the resulting moment.
 */
function zonedTimeToUtcMs(
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  timezone: string,
): number {
  const naiveUtcMs = Date.UTC(year, month - 1, day, hours, minutes);
  const offsetMin = getOffsetMinutes(new Date(naiveUtcMs), timezone);
  return naiveUtcMs - offsetMin * 60_000;
}

// Exported for tests only — do not rely on these from app code.
export const __testing = { getZonedDateParts, getOffsetMinutes, zonedTimeToUtcMs };
