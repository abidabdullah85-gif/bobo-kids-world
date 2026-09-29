import { describe, it, expect } from "vitest";
import feedBobo from "./feed-bobo";
import type { DragCountQuestion } from "@/types/game";

describe("Feed Bobo — DragCount data integrity", () => {
  it("level 1 target=3, pool=5", () => {
    const q = feedBobo.levels[0].questions[0] as DragCountQuestion;
    expect(q.targetCount).toBe(3);
    expect(q.poolSize).toBe(5);
  });

  it("level 2 target=5, pool=8", () => {
    const q = feedBobo.levels[1].questions[0] as DragCountQuestion;
    expect(q.targetCount).toBe(5);
    expect(q.poolSize).toBe(8);
  });

  it("level 3 target=7, pool=10", () => {
    const q = feedBobo.levels[2].questions[0] as DragCountQuestion;
    expect(q.targetCount).toBe(7);
    expect(q.poolSize).toBe(10);
  });

  it("all levels: poolSize >= targetCount (no impossible question)", () => {
    feedBobo.levels.forEach((level, i) => {
      level.questions.forEach(q => {
        const dq = q as DragCountQuestion;
        expect(dq.poolSize).toBeGreaterThanOrEqual(dq.targetCount);
      });
    });
  });

  it("all levels: has itemEmoji and basketEmoji", () => {
    feedBobo.levels.forEach(level => {
      level.questions.forEach(q => {
        const dq = q as DragCountQuestion;
        expect(dq.itemEmoji).toBeTruthy();
        expect(dq.basketEmoji).toBeTruthy();
      });
    });
  });

  it("all levels: targetCount > 0", () => {
    feedBobo.levels.forEach(level => {
      level.questions.forEach(q => {
        expect((q as DragCountQuestion).targetCount).toBeGreaterThan(0);
      });
    });
  });
});
