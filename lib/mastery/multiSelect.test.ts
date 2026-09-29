import { describe, it, expect } from "vitest";

// Logic extracted from ChoiceTemplate multi-select state machine
// Tests the pure logic without React

function simulateMultiSelect(
  options: Array<{ id: string; isCorrect: boolean }>,
  totalCorrect: number,
  tapSequence: string[]
): { completed: boolean; firstTry: boolean; confirmedIds: Set<string> } {
  let confirmedIds = new Set<string>();
  let multiAttempts = 0;
  let completed = false;
  let firstTry = true;

  for (const tapId of tapSequence) {
    if (completed) break;
    if (confirmedIds.has(tapId)) continue; // already confirmed, ignore

    const opt = options.find(o => o.id === tapId);
    if (!opt) continue;

    if (opt.isCorrect) {
      confirmedIds = new Set(confirmedIds).add(tapId);
      if (confirmedIds.size >= totalCorrect) {
        completed = true;
        firstTry = multiAttempts === 0;
      }
    } else {
      multiAttempts++;
    }
  }

  return { completed, firstTry, confirmedIds };
}

describe("Multi-select logic", () => {
  const options = [
    { id: "A-0", isCorrect: true },
    { id: "B-0", isCorrect: false },
    { id: "A-1", isCorrect: true },
    { id: "C-0", isCorrect: false },
  ];
  const totalCorrect = 2;

  it("selecting only 1 correct does NOT complete", () => {
    const { completed } = simulateMultiSelect(options, totalCorrect, ["A-0"]);
    expect(completed).toBe(false);
  });

  it("selecting both correct answers completes", () => {
    const { completed } = simulateMultiSelect(options, totalCorrect, ["A-0", "A-1"]);
    expect(completed).toBe(true);
  });

  it("selecting same correct twice does not double-count", () => {
    const { completed, confirmedIds } = simulateMultiSelect(options, totalCorrect, ["A-0", "A-0", "A-0"]);
    expect(completed).toBe(false);
    expect(confirmedIds.size).toBe(1);
  });

  it("incorrect selection does not complete", () => {
    const { completed } = simulateMultiSelect(options, totalCorrect, ["B-0", "C-0"]);
    expect(completed).toBe(false);
  });

  it("incorrect then correct still completes", () => {
    const { completed } = simulateMultiSelect(options, totalCorrect, ["B-0", "A-0", "A-1"]);
    expect(completed).toBe(true);
  });

  it("firstTry is false when incorrect was selected first", () => {
    const { firstTry } = simulateMultiSelect(options, totalCorrect, ["B-0", "A-0", "A-1"]);
    expect(firstTry).toBe(false);
  });

  it("firstTry is true when only correct answers tapped", () => {
    const { firstTry } = simulateMultiSelect(options, totalCorrect, ["A-0", "A-1"]);
    expect(firstTry).toBe(true);
  });

  it("single correct answer question completes on first correct tap", () => {
    const singleOpts = [{ id: "A", isCorrect: true }, { id: "B", isCorrect: false }];
    const { completed } = simulateMultiSelect(singleOpts, 1, ["A"]);
    expect(completed).toBe(true);
  });
});

describe("Single-select logic (regression guard)", () => {
  function simulateSingleSelect(
    options: Array<{ id: string; isCorrect: boolean }>,
    tapId: string
  ): { correct: boolean } {
    const opt = options.find(o => o.id === tapId);
    return { correct: opt?.isCorrect ?? false };
  }

  it("correct tap returns correct", () => {
    expect(simulateSingleSelect([{ id: "A", isCorrect: true }], "A").correct).toBe(true);
  });

  it("incorrect tap returns incorrect", () => {
    expect(simulateSingleSelect([{ id: "A", isCorrect: true }, { id: "B", isCorrect: false }], "B").correct).toBe(false);
  });
});
