import { describe, it, expect, beforeEach } from "vitest";
import { setupLocalStorageMock } from "../__tests__/setupLocalStorage";

setupLocalStorageMock();

import { pickAdventureGames, ADVENTURE_SIZE } from "./dailyAdventureEngine";
import { ALL_GAMES } from "@/lib/games/registry";

beforeEach(() => { window.localStorage.clear(); });

describe("Daily Adventure Engine", () => {
  it(`picks exactly ${ADVENTURE_SIZE} games`, () => {
    expect(pickAdventureGames(ALL_GAMES)).toHaveLength(ADVENTURE_SIZE);
  });

  it("no duplicate slugs", () => {
    const slugs = pickAdventureGames(ALL_GAMES);
    expect(new Set(slugs).size).toBe(ADVENTURE_SIZE);
  });

  it("all slugs exist in registry", () => {
    const allSlugs = new Set(ALL_GAMES.map(g => g.slug));
    pickAdventureGames(ALL_GAMES).forEach(s => expect(allSlugs.has(s)).toBe(true));
  });

  it("date-deterministic — same date yields same result", () => {
    expect(pickAdventureGames(ALL_GAMES)).toEqual(pickAdventureGames(ALL_GAMES));
  });

  it("handles empty list without crash", () => {
    expect(pickAdventureGames([])).toHaveLength(0);
  });

  it("handles fewer games than ADVENTURE_SIZE", () => {
    const few = ALL_GAMES.slice(0, 2);
    expect(pickAdventureGames(few).length).toBeLessThanOrEqual(2);
  });

  it("picks from more than one skill", () => {
    const slugs = pickAdventureGames(ALL_GAMES);
    const games = ALL_GAMES.filter(g => slugs.includes(g.slug));
    expect(new Set(games.map(g => g.skill)).size).toBeGreaterThan(1);
  });
});
