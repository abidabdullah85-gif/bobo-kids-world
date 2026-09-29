import { describe, it, expect, beforeEach } from "vitest";
import { setupLocalStorageMock } from "../__tests__/setupLocalStorage";

const { store } = setupLocalStorageMock();

import { recordGameCompletion, getLocalTotalStars, getLocalGameSummary } from "./rewardEngine";
import { getUnrevealedSticker, getOwnedStickerCount, STICKER_CATALOG } from "./stickerEngine";

beforeEach(() => { window.localStorage.clear(); });

describe("Reward Engine", () => {
  it("starts at 0 stars", () => { expect(getLocalTotalStars()).toBe(0); });

  it("awards stars on completion", () => {
    recordGameCompletion("letter-hunt", 3, 1, 1);
    expect(getLocalTotalStars()).toBe(3);
  });

  it("minimum 1 star per completion", () => {
    const awarded = recordGameCompletion("letter-hunt", 0, 0, 5);
    expect(awarded).toBeGreaterThanOrEqual(1);
  });

  it("accumulates across completions", () => {
    recordGameCompletion("letter-hunt", 3, 1, 1);
    recordGameCompletion("number-pop", 2, 0, 1);
    expect(getLocalTotalStars()).toBe(5);
  });

  it("tracks bestStars per game", () => {
    recordGameCompletion("letter-hunt", 2, 1, 1);
    recordGameCompletion("letter-hunt", 3, 1, 1);
    expect(getLocalGameSummary("letter-hunt")?.bestStars).toBe(3);
  });

  it("tracks completion count", () => {
    recordGameCompletion("letter-hunt", 3, 1, 1);
    recordGameCompletion("letter-hunt", 3, 1, 1);
    expect(getLocalGameSummary("letter-hunt")?.completions).toBe(2);
  });

  it("handles malformed storage gracefully", () => {
    store["bobo-kids-world:progress-v0"] = "NOT_JSON{{{";
    expect(() => getLocalTotalStars()).not.toThrow();
  });
});

describe("Sticker Engine", () => {
  it("no sticker at 0 stars", () => { expect(getUnrevealedSticker(0)).toBeNull(); });
  it("unlocks first sticker at 5 stars", () => { expect(getOwnedStickerCount(5)).toBe(1); });
  it("stickers cap at catalog length", () => { expect(getOwnedStickerCount(999999)).toBe(STICKER_CATALOG.length); });
  it("unrevealed is null when all celebrated", () => {
    store["bobo-kids-world:sticker-celebration-v1"] = "1";
    expect(getUnrevealedSticker(5)).toBeNull();
  });
});
