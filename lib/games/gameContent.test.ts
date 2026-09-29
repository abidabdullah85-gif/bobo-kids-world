import { describe, it, expect } from "vitest";
import { ALL_GAMES } from "./registry";
import type { ChoiceQuestion, DragCountQuestion, SortQuestion } from "@/types/game";

describe("Game Content Validation", () => {
  describe("Choice games", () => {
    const choiceGames = ALL_GAMES.filter(g => g.template === "choice");
    choiceGames.forEach(game => {
      describe(`${game.slug}`, () => {
        game.levels.forEach((level, li) => {
          level.questions.forEach((q, qi) => {
            const cq = q as ChoiceQuestion;
            it(`level ${li + 1} q${qi + 1}: has options`, () => {
              expect(cq.options).toBeDefined();
              expect(cq.options.length).toBeGreaterThan(0);
            });
            it(`level ${li + 1} q${qi + 1}: has at least one correct answer`, () => {
              const correct = cq.options.filter(o => o.isCorrect);
              expect(correct.length).toBeGreaterThan(0);
            });
            it(`level ${li + 1} q${qi + 1}: multi-select totalCorrect matches options`, () => {
              if (!cq.multiSelect) return;
              const correctCount = cq.options.filter(o => o.isCorrect).length;
              expect(cq.totalCorrect).toBeDefined();
              expect(cq.totalCorrect).toBe(correctCount);
            });
            it(`level ${li + 1} q${qi + 1}: no duplicate option ids`, () => {
              const ids = cq.options.map(o => o.id);
              expect(new Set(ids).size).toBe(ids.length);
            });
          });
        });
      });
    });
  });

  describe("DragCount games", () => {
    const dragGames = ALL_GAMES.filter(g => g.template === "drag_count");
    dragGames.forEach(game => {
      describe(`${game.slug}`, () => {
        game.levels.forEach((level, li) => {
          level.questions.forEach((q, qi) => {
            const dq = q as DragCountQuestion;
            it(`level ${li + 1} q${qi + 1}: has targetCount`, () => {
              expect(dq.targetCount).toBeGreaterThan(0);
            });
            it(`level ${li + 1} q${qi + 1}: poolSize >= targetCount`, () => {
              expect(dq.poolSize).toBeGreaterThanOrEqual(dq.targetCount);
            });
            it(`level ${li + 1} q${qi + 1}: has itemEmoji`, () => {
              expect(dq.itemEmoji).toBeTruthy();
            });
            it(`level ${li + 1} q${qi + 1}: has basketEmoji`, () => {
              expect(dq.basketEmoji).toBeTruthy();
            });
          });
        });
      });
    });
  });

  describe("Sort games", () => {
    const sortGames = ALL_GAMES.filter(g => g.template === "sort");
    sortGames.forEach(game => {
      describe(`${game.slug}`, () => {
        game.levels.forEach((level, li) => {
          level.questions.forEach((q, qi) => {
            const sq = q as SortQuestion;
            it(`level ${li + 1} q${qi + 1}: has items`, () => {
              expect(sq.items.length).toBeGreaterThan(0);
            });
            it(`level ${li + 1} q${qi + 1}: has baskets`, () => {
              expect(sq.baskets.length).toBeGreaterThan(0);
            });
            it(`level ${li + 1} q${qi + 1}: all items have valid groupKey`, () => {
              const basketKeys = new Set(sq.baskets.map(b => b.key));
              sq.items.forEach(item => expect(basketKeys.has(item.groupKey)).toBe(true));
            });
          });
        });
      });
    });
  });
});
