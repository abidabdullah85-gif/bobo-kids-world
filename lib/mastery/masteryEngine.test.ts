import { describe, it, expect } from "vitest";
import { resolveStatus } from "./masteryEngine";

// Tests lock in the 6-state behavior before any other step changes it.

describe("resolveStatus — Phase 6 6-state model", () => {
  it("returns not-started with 0 attempts", () => {
    expect(resolveStatus([], [], 0)).toBe("not-started");
  });

  it("returns discovering for 1 attempt", () => {
    expect(resolveStatus([true], ["2026-01-01"], 1)).toBe("discovering");
  });

  it("returns discovering for 2 attempts", () => {
    expect(resolveStatus([true, true], ["2026-01-01"], 2)).toBe("discovering");
  });

  it("returns learning with 3 attempts at 33% accuracy", () => {
    expect(resolveStatus([true, false, false], ["2026-01-01"], 3)).toBe("learning");
  });

  it("returns practicing with 3 attempts at 67% accuracy", () => {
    expect(resolveStatus([true, true, false], ["2026-01-01"], 3)).toBe("practicing");
  });

  it("returns practicing at exactly 50% (boundary)", () => {
    expect(resolveStatus([true, false, true, false], ["2026-01-01"], 4)).toBe("practicing");
  });

  it("returns practicing even at 80%+ accuracy if only 1 session day", () => {
    const outcomes = [true, true, true, true, true, true]; // 100%
    expect(resolveStatus(outcomes, ["2026-01-01"], 6)).toBe("practicing");
  });

  it("returns confident with ≥5 attempts, ≥80% accuracy, 2+ days", () => {
    const outcomes = [true, true, true, true, true]; // 100%, 5 attempts
    expect(resolveStatus(outcomes, ["2026-01-01", "2026-01-02"], 5)).toBe("confident");
  });

  it("returns confident at exactly 80% accuracy (inclusive)", () => {
    const outcomes = [true, true, true, true, false]; // 80%, 5 attempts
    expect(resolveStatus(outcomes, ["2026-01-01", "2026-01-02"], 5)).toBe("confident");
  });

  it("returns practicing at 79% accuracy with 5 attempts and 2 days", () => {
    const outcomes = [true, true, true, false, false]; // 60%, should be practicing
    expect(resolveStatus(outcomes, ["2026-01-01", "2026-01-02"], 5)).toBe("practicing");
  });

  it("returns mastered with ≥5 attempts, ≥80% accuracy, 3+ days", () => {
    const outcomes = [true, true, true, true, true];
    expect(resolveStatus(outcomes, ["2026-01-01", "2026-01-02", "2026-01-03"], 5)).toBe("mastered");
  });

  it("returns confident (not mastered) with only 2 days at perfect accuracy", () => {
    const outcomes = [true, true, true, true, true, true];
    expect(resolveStatus(outcomes, ["2026-01-01", "2026-01-02"], 6)).toBe("confident");
  });

  it("uses rolling window — early errors don't permanently hurt", () => {
    // First 20 all wrong, last 8 all right — recent window is 8
    const outcomes = [
      ...Array(20).fill(false),
      ...Array(8).fill(true),
    ];
    const recent = outcomes.slice(-8);
    expect(resolveStatus(recent, ["2026-01-01", "2026-01-02"], 28)).toBe("confident");
  });
});
