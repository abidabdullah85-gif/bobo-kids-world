import { describe, it, expect, beforeEach } from "vitest";
import { setupLocalStorageMock } from "../__tests__/setupLocalStorage";

const { store } = setupLocalStorageMock();

import { getSkillStatus, recordSkillAttempt, getAllSkillStatuses } from "./masteryEngine";

beforeEach(() => { window.localStorage.clear(); });

describe("localStorage safety", () => {
  it("fresh user: status is not-started", () => {
    expect(getSkillStatus("letter-hunt")).toBe("not-started");
  });

  it("fresh user: getAllSkillStatuses returns empty object", () => {
    expect(getAllSkillStatuses()).toEqual({});
  });

  it("corrupted JSON does not crash", () => {
    store["bobo-kids-world:mastery-v1"] = "CORRUPTED{{{{";
    expect(() => getSkillStatus("letter-hunt")).not.toThrow();
    expect(getSkillStatus("letter-hunt")).toBe("not-started");
  });

  it("recordSkillAttempt on corrupted storage does not crash", () => {
    store["bobo-kids-world:mastery-v1"] = "bad data";
    expect(() => recordSkillAttempt("letter-hunt", "A", true)).not.toThrow();
  });

  it("missing storage key returns safe defaults", () => {
    delete store["bobo-kids-world:mastery-v1"];
    expect(getSkillStatus("any-skill")).toBe("not-started");
    expect(() => getAllSkillStatuses()).not.toThrow();
  });

  it("returning user: status reflects prior attempts", () => {
    // Record enough attempts to leave not-started
    recordSkillAttempt("letter-hunt", "A", true);
    recordSkillAttempt("letter-hunt", "A", true);
    recordSkillAttempt("letter-hunt", "A", false);
    const status = getSkillStatus("letter-hunt");
    expect(status).not.toBe("not-started");
  });
});
