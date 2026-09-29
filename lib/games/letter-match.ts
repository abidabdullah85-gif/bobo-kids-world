import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";
import { choiceLevel } from "./letter-hunt";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function sampleLetters(target: string, count: number): string[] {
  return LETTERS.filter(l => l !== target).sort(() => Math.random() - 0.5).slice(0, count);
}
function matchLevel(target: string, distractors: string[], difficulty: 1|2|3): Level {
  return {
    difficulty,
    questions: [{
      id: `lm-${target}-${difficulty}`,
      prompt: { en: `Find the matching letter!` },
      skillUnit: target,
      targetDisplay: { label: target },
      options: [target, ...distractors].sort(() => Math.random() - 0.5).map(l => ({
        id: l, label: { en: l }, emoji: l, isCorrect: l === target,
      })),
    }],
  };
}
const letterMatch: Game = {
  slug: "letter-match", title: "Letter Match",
  ageRange: [3, 5], pillar: "literacy", skill: "uppercase-letter-recognition",
  template: "choice", progressionType: "progressive",
  difficulty: 1, estimatedDurationMin: 3,
  learningObjective: "Match uppercase letters visually",
  instructions: { en: "Tap the letter that matches Bobo's letter!" },
  levels: [
    matchLevel("A", sampleLetters("A", 2), 1),
    matchLevel("T", sampleLetters("T", 3), 2),
    matchLevel("E", sampleLetters("E", 4), 3),
  ],
  reward: { stars: 3, badgeKey: "letter-match-star" },
};
registerPersonalization("letter-match", {
  skill: "uppercase-letter-recognition",
  eligibleUnits: LETTERS,
  buildLevel: (unit) => matchLevel(unit, sampleLetters(unit, 2), 1),
  pickTarget: pickWithDiscoveryFallback,
});
export default letterMatch;
