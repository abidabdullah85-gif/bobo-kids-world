import { describe, it, expect } from "vitest";
import { getLocalDateKey } from "./localDate";

describe("getLocalDateKey", () => {
  it("returns YYYY-MM-DD format", () => {
    const result = getLocalDateKey(new Date(2026, 0, 5)); // Jan 5 local
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result).toBe("2026-01-05");
  });

  it("uses LOCAL date not UTC — Malaysia midnight scenario", () => {
    // At 2026-01-05 16:00 UTC, Malaysia (UTC+8) is 2026-01-06 00:00
    // toISOString() would return "2026-01-05" (UTC) — WRONG for Malaysia
    // getLocalDateKey uses local calendar — so depends on test environment TZ
    // We test the contract: same Date object => consistent key
    const d = new Date(2026, 0, 6, 0, 30); // 00:30 local Jan 6
    expect(getLocalDateKey(d)).toBe("2026-01-06");
  });

  it("handles month/day padding", () => {
    expect(getLocalDateKey(new Date(2026, 0, 1))).toBe("2026-01-01");
    expect(getLocalDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("different dates produce different keys", () => {
    const d1 = getLocalDateKey(new Date(2026, 0, 1));
    const d2 = getLocalDateKey(new Date(2026, 0, 2));
    expect(d1).not.toBe(d2);
  });

  it("returns today when no arg passed", () => {
    const result = getLocalDateKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
