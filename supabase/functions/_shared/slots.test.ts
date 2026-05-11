import { describe, expect, it } from "vitest";
import { generateSlots, isSlotValid, __testing, type AvailabilityWindow } from "./slots";

// Default availability: 10:00–19:00 IST Mon–Fri.
// 9 candidate hourly slots/day: 10, 11, 12, 13, 14, 15, 16, 17, 18.
const IST_BIZ: AvailabilityWindow = {
  start: "10:00",
  end: "19:00",
  days: [1, 2, 3, 4, 5],
  timezone: "Asia/Kolkata",
};

// IST is UTC+5:30 → 10:00 IST = 04:30 UTC, 19:00 IST = 13:30 UTC.
const IST_DAY_START_UTC = "T04:30:00.000Z";
const IST_DAY_END_UTC = "T13:30:00.000Z";

describe("getZonedDateParts", () => {
  it("returns IST weekday for an early-morning UTC instant", () => {
    // 2026-05-13T18:00:00Z = 2026-05-13 23:30 IST = Wednesday
    const parts = __testing.getZonedDateParts(new Date("2026-05-13T18:00:00Z"), "Asia/Kolkata");
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(5);
    expect(parts.day).toBe(13);
    expect(parts.weekday).toBe(3); // Wed
  });

  it("rolls over the date in IST when UTC is late evening previous day", () => {
    // 2026-05-13T19:00:00Z = 2026-05-14 00:30 IST = Thursday
    const parts = __testing.getZonedDateParts(new Date("2026-05-13T19:00:00Z"), "Asia/Kolkata");
    expect(parts.day).toBe(14);
    expect(parts.weekday).toBe(4); // Thu
  });
});

describe("getOffsetMinutes", () => {
  it("returns +330 for IST (no DST)", () => {
    const o = __testing.getOffsetMinutes(new Date("2026-05-13T10:00:00Z"), "Asia/Kolkata");
    expect(o).toBe(330);
  });

  it("returns -240 for New York during EDT (summer)", () => {
    const o = __testing.getOffsetMinutes(new Date("2026-07-15T15:00:00Z"), "America/New_York");
    expect(o).toBe(-240);
  });

  it("returns -300 for New York during EST (winter)", () => {
    const o = __testing.getOffsetMinutes(new Date("2026-01-15T15:00:00Z"), "America/New_York");
    expect(o).toBe(-300);
  });

  it("returns 0 for UTC", () => {
    const o = __testing.getOffsetMinutes(new Date("2026-05-13T10:00:00Z"), "UTC");
    expect(o).toBe(0);
  });
});

describe("zonedTimeToUtcMs", () => {
  it("10:00 IST on 2026-05-13 = 04:30 UTC", () => {
    const ms = __testing.zonedTimeToUtcMs(2026, 5, 13, 10, 0, "Asia/Kolkata");
    expect(new Date(ms).toISOString()).toBe("2026-05-13T04:30:00.000Z");
  });

  it("10:00 EDT on 2026-07-15 = 14:00 UTC (summer)", () => {
    const ms = __testing.zonedTimeToUtcMs(2026, 7, 15, 10, 0, "America/New_York");
    expect(new Date(ms).toISOString()).toBe("2026-07-15T14:00:00.000Z");
  });

  it("10:00 EST on 2026-01-15 = 15:00 UTC (winter)", () => {
    const ms = __testing.zonedTimeToUtcMs(2026, 1, 15, 10, 0, "America/New_York");
    expect(new Date(ms).toISOString()).toBe("2026-01-15T15:00:00.000Z");
  });
});

describe("generateSlots — basics", () => {
  it("generates 9 hourly slots on a single weekday with no busy times", () => {
    const now = new Date("2026-05-12T03:00:00Z"); // Tuesday 08:30 IST
    const slots = generateSlots({
      now,
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(9);
    expect(slots[0].start).toBe("2026-05-12" + IST_DAY_START_UTC);
    expect(slots[8].start).toBe("2026-05-12T12:30:00.000Z"); // last slot starts 18:00 IST
    expect(slots[8].end).toBe("2026-05-12" + IST_DAY_END_UTC);
  });

  it("excludes Saturday and Sunday by default", () => {
    // Friday 2026-05-15 03:00 UTC = 08:30 IST → 7 days = Fri → Thu next week.
    const now = new Date("2026-05-15T03:00:00Z");
    const slots = generateSlots({
      now,
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 7,
    });
    // Days included: Fri, Mon, Tue, Wed, Thu = 5 days × 9 slots = 45.
    expect(slots).toHaveLength(45);
    // Verify no slot falls on Sat or Sun in IST.
    const weekdays = slots.map((s) => __testing.getZonedDateParts(new Date(s.start), "Asia/Kolkata").weekday);
    expect(weekdays.every((w) => w >= 1 && w <= 5)).toBe(true);
  });

  it("filters out past slots based on `now`", () => {
    // "now" is Tuesday 14:00 IST (08:30 UTC). With 60-min lead, earliest = 15:00 IST.
    // So 15:00, 16:00, 17:00, 18:00 = 4 slots remain for Tuesday.
    const now = new Date("2026-05-12T08:30:00Z");
    const slots = generateSlots({
      now,
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(4);
    expect(slots[0].start).toBe("2026-05-12T09:30:00.000Z"); // 15:00 IST
  });

  it("respects custom leadMinutes = 0", () => {
    const now = new Date("2026-05-12T08:30:00Z"); // Tue 14:00 IST
    const slots = generateSlots({
      now,
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
      leadMinutes: 0,
    });
    // First slot >= 14:00 IST → 14:00, 15:00, 16:00, 17:00, 18:00 = 5
    expect(slots).toHaveLength(5);
    expect(slots[0].start).toBe("2026-05-12T08:30:00.000Z"); // 14:00 IST
  });
});

describe("generateSlots — busy overlap", () => {
  it("excludes slot that fully contains a busy block", () => {
    const now = new Date("2026-05-12T03:00:00Z"); // Tue 08:30 IST
    const slots = generateSlots({
      now,
      busy: [{ start: "2026-05-12T05:00:00Z", end: "2026-05-12T05:30:00Z" }], // 10:30–11:00 IST
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    // 10:00 slot is 10:00–11:00 IST = 04:30–05:30 UTC. Busy 05:00–05:30 falls inside.
    const starts = slots.map((s) => s.start);
    expect(starts).not.toContain("2026-05-12" + IST_DAY_START_UTC);
    expect(slots).toHaveLength(8);
  });

  it("excludes only slots that overlap busy — adjacent is fine", () => {
    const now = new Date("2026-05-12T03:00:00Z");
    // Busy 11:00–11:30 IST = 05:30–06:00 UTC.
    // 10:00 slot ends at 05:30 UTC (exactly the busy start) → no overlap (touching ≠ overlap).
    // 11:00 slot starts at 05:30 UTC inside busy → overlap.
    const slots = generateSlots({
      now,
      busy: [{ start: "2026-05-12T05:30:00Z", end: "2026-05-12T06:00:00Z" }],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    const starts = slots.map((s) => s.start);
    expect(starts).toContain("2026-05-12T04:30:00.000Z"); // 10:00 IST kept
    expect(starts).not.toContain("2026-05-12T05:30:00.000Z"); // 11:00 IST excluded
  });

  it("excludes slots when a busy block spans multiple slots", () => {
    const now = new Date("2026-05-12T03:00:00Z");
    // Busy 11:00–14:00 IST = 05:30–08:30 UTC → blocks 11:00, 12:00, 13:00 slots.
    const slots = generateSlots({
      now,
      busy: [{ start: "2026-05-12T05:30:00Z", end: "2026-05-12T08:30:00Z" }],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(6);
    const starts = slots.map((s) => s.start);
    expect(starts).not.toContain("2026-05-12T05:30:00.000Z");
    expect(starts).not.toContain("2026-05-12T06:30:00.000Z");
    expect(starts).not.toContain("2026-05-12T07:30:00.000Z");
  });

  it("an all-day busy block removes all slots", () => {
    const now = new Date("2026-05-12T03:00:00Z");
    const slots = generateSlots({
      now,
      busy: [{ start: "2026-05-12T00:00:00Z", end: "2026-05-12T23:59:00Z" }],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(0);
  });
});

describe("generateSlots — existing bookings", () => {
  it("excludes slots whose start matches an already-booked time", () => {
    const now = new Date("2026-05-12T03:00:00Z");
    const slots = generateSlots({
      now,
      busy: [],
      existing: ["2026-05-12T04:30:00.000Z"], // 10:00 IST booked in our DB
      availability: IST_BIZ,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(8);
    expect(slots.map((s) => s.start)).not.toContain("2026-05-12T04:30:00.000Z");
  });
});

describe("generateSlots — different timezones", () => {
  it("works for New York EDT (summer DST)", () => {
    const ny: AvailabilityWindow = { ...IST_BIZ, timezone: "America/New_York" };
    // 2026-07-14T13:00:00Z = 09:00 EDT Tuesday — well before the 10:00 window.
    const now = new Date("2026-07-14T13:00:00Z");
    const slots = generateSlots({ now, busy: [], existing: [], availability: ny, daysAhead: 1 });
    expect(slots.length).toBe(9);
    expect(slots[0].start).toBe("2026-07-14T14:00:00.000Z"); // 10:00 EDT Tue
    expect(slots[8].start).toBe("2026-07-14T22:00:00.000Z"); // 18:00 EDT Tue
  });

  it("works for New York EST (winter, no DST)", () => {
    const ny: AvailabilityWindow = { ...IST_BIZ, timezone: "America/New_York" };
    const now = new Date("2026-01-13T03:00:00Z"); // Mon 22:00 EST
    const slots = generateSlots({ now, busy: [], existing: [], availability: ny, daysAhead: 1 });
    // dayOffset=0 → date in EST is 2026-01-12 (Monday). Mon 10:00 EST = 15:00 UTC.
    // But now = 03:00 UTC Jan 13 → earliest = 04:00 UTC. Mon slots already past.
    // Actually wait — Jan 13 03:00 UTC = Jan 12 22:00 EST → Monday.
    // Window for Monday 10:00–19:00 EST = 15:00–24:00 UTC Jan 12. All slots end <= Jan 13 00:00 UTC < now.
    // So we look at Tuesday Jan 13 in EST. Day starts at 15:00 UTC Tue.
    // daysAhead=1 → only dayOffset 0. dayProbe = now = Jan 13 03:00 UTC.
    // In EST that's Jan 12, so we examine Monday. Slot range is all past.
    expect(slots.length).toBe(0);
  });
});

describe("generateSlots — edge cases", () => {
  it("handles empty days array (referrer not available)", () => {
    const noWork: AvailabilityWindow = { ...IST_BIZ, days: [] };
    const slots = generateSlots({
      now: new Date("2026-05-12T03:00:00Z"),
      busy: [],
      existing: [],
      availability: noWork,
      daysAhead: 7,
    });
    expect(slots).toHaveLength(0);
  });

  it("handles window where end < start (degenerate config)", () => {
    const bad: AvailabilityWindow = { ...IST_BIZ, start: "19:00", end: "10:00" };
    const slots = generateSlots({
      now: new Date("2026-05-12T03:00:00Z"),
      busy: [],
      existing: [],
      availability: bad,
      daysAhead: 1,
    });
    expect(slots).toHaveLength(0);
  });

  it("handles a custom 30-min slot size", () => {
    const slots = generateSlots({
      now: new Date("2026-05-12T03:00:00Z"),
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 1,
      slotMinutes: 30,
    });
    expect(slots).toHaveLength(18); // 9 hours × 2 half-hours
  });

  it("returns slots in ascending chronological order", () => {
    const slots = generateSlots({
      now: new Date("2026-05-12T03:00:00Z"),
      busy: [],
      existing: [],
      availability: IST_BIZ,
      daysAhead: 5,
    });
    for (let i = 1; i < slots.length; i++) {
      expect(new Date(slots[i].start).getTime()).toBeGreaterThan(new Date(slots[i - 1].start).getTime());
    }
  });
});

describe("isSlotValid", () => {
  it("accepts a slot inside the window on an allowed weekday", () => {
    // 10:00 IST Tuesday = 04:30 UTC
    expect(isSlotValid(new Date("2026-05-12T04:30:00Z"), IST_BIZ)).toBe(true);
  });

  it("rejects a slot before window start", () => {
    // 09:00 IST = 03:30 UTC
    expect(isSlotValid(new Date("2026-05-12T03:30:00Z"), IST_BIZ)).toBe(false);
  });

  it("rejects a slot that ends after window end", () => {
    // 18:30 IST start → ends at 19:30 IST, past 19:00 cutoff
    expect(isSlotValid(new Date("2026-05-12T13:00:00Z"), IST_BIZ)).toBe(false);
  });

  it("rejects Saturday/Sunday", () => {
    // 2026-05-16 = Saturday
    expect(isSlotValid(new Date("2026-05-16T04:30:00Z"), IST_BIZ)).toBe(false);
  });

  it("rejects misaligned start (10:30 IST when window starts at 10:00)", () => {
    expect(isSlotValid(new Date("2026-05-12T05:00:00Z"), IST_BIZ)).toBe(false);
  });
});
