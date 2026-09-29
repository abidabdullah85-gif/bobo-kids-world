import { describe, it, expect, beforeEach } from "vitest";
import { setupLocalStorageMock } from "../__tests__/setupLocalStorage";

setupLocalStorageMock();

import { pickWithDiscoveryFallback, pickDiscoveryCandidate } from "./personalization";

beforeEach(() => { window.localStorage.clear(); });

describe("Personalization", () => {
  it("pickDiscoveryCandidate returns null for empty pool", () => {
    expect(pickDiscoveryCandidate("test-skill", [])).toBeNull();
  });

  it("pickDiscoveryCandidate returns item from pool", () => {
    const result = pickDiscoveryCandidate("test-skill", ["A", "B", "C"]);
    expect(["A", "B", "C"]).toContain(result);
  });

  it("excludes collision units", () => {
    expect(pickDiscoveryCandidate("test-skill", ["A", "B", "C"], ["A", "B"])).toBe("C");
  });

  it("returns null when all units are collisions", () => {
    expect(pickDiscoveryCandidate("test-skill", ["A"], ["A"])).toBeNull();
  });

  it("pickWithDiscoveryFallback returns null for empty pool", () => {
    expect(pickWithDiscoveryFallback("test-skill", [])).toBeNull();
  });

  it("returns a unit from eligible list", () => {
    const units = ["A", "B", "C", "D", "E"];
    expect(units).toContain(pickWithDiscoveryFallback("test-skill", units));
  });

  it("is deterministic for same date+state", () => {
    const units = ["A", "B", "C", "D", "E"];
    expect(pickWithDiscoveryFallback("test-skill", units)).toBe(pickWithDiscoveryFallback("test-skill", units));
  });
});
