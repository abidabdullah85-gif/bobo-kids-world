import { describe, it, expect } from "vitest";
import { ALL_GAMES, GAME_REGISTRY, getGame } from "./registry";
import { SKILL_DOMAIN } from "@/lib/mastery/skillTopics";

const VALID_PILLARS = ["literacy","math","colors_shapes","logic","life_skills","world"];
const VALID_TEMPLATES = ["choice","drag_count","sort"];

describe("Game Registry", () => {
  it("registers exactly 15 games", () => {
    expect(ALL_GAMES).toHaveLength(15);
  });

  it("every game has a unique slug", () => {
    const slugs = ALL_GAMES.map(g => g.slug);
    expect(new Set(slugs).size).toBe(15);
  });

  it("every game resolves via getGame(slug)", () => {
    ALL_GAMES.forEach(g => {
      expect(getGame(g.slug)).toBeDefined();
      expect(getGame(g.slug)?.slug).toBe(g.slug);
    });
  });

  it("every game has a valid pillar", () => {
    ALL_GAMES.forEach(g => {
      expect(VALID_PILLARS).toContain(g.pillar);
    });
  });

  it("every game has a valid template", () => {
    ALL_GAMES.forEach(g => {
      expect(VALID_TEMPLATES).toContain(g.template);
    });
  });

  it("every game has a skill mapped to a domain", () => {
    ALL_GAMES.forEach(g => {
      expect(SKILL_DOMAIN[g.skill]).toBeDefined();
    });
  });

  it("every game has at least one level", () => {
    ALL_GAMES.forEach(g => {
      expect(g.levels.length).toBeGreaterThan(0);
    });
  });

  it("every game has valid age range", () => {
    ALL_GAMES.forEach(g => {
      expect(g.ageRange[0]).toBeGreaterThanOrEqual(1);
      expect(g.ageRange[1]).toBeGreaterThanOrEqual(g.ageRange[0]);
    });
  });

  it("every game has a learning objective", () => {
    ALL_GAMES.forEach(g => {
      expect(g.learningObjective).toBeTruthy();
    });
  });

  it("getGame returns undefined for unknown slug", () => {
    expect(getGame("non-existent-game")).toBeUndefined();
  });

  it("GAME_REGISTRY contains all game slugs", () => {
    ALL_GAMES.forEach(g => {
      expect(GAME_REGISTRY[g.slug]).toBeDefined();
    });
  });
});
