import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";
import { pickWithDiscoveryFallback } from "@/lib/mastery/personalization";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function sampleLetters(target: string, count: number): string[] {
  return LETTERS.filter(l => l !== target).sort(() => Math.random() - 0.5).slice(0, count);
}

export function choiceLevel(target: string, distractors: string[], difficulty: 1|2|3): Level {
  return {
    difficulty,
    questions: [{
      id: `lh-${target}-${difficulty}`,
      prompt: { en: `Find the letter ${target}! 🔍` },
      audioPrompt: { en: `Find the letter ${target}` },
      skillUnit: target,
      options: [target, ...distractors].sort(() => Math.random() - 0.5).map(l => ({
        id: l, label: { en: l }, emoji: l, isCorrect: l === target,
      })),
    }],
  };
}

const letterHunt: Game = {
  slug: "letter-hunt", title: "Letter Hunt",
  ageRange: [3, 4], pillar: "literacy", skill: "uppercase-letter-recognition",
  template: "choice", progressionType: "progressive",
  difficulty: 1, estimatedDurationMin: 3,
  learningObjective: "Recognise uppercase letters by name",
  prerequisiteSkills: [],
  instructions: { en: "Tap the letter Bobo asks for!" },
  levels: [
    choiceLevel("B", sampleLetters("B", 2), 1),
    choiceLevel("C", sampleLetters("C", 3), 2),
    choiceLevel("M", sampleLetters("M", 4), 3),
  ],
  reward: { stars: 3, badgeKey: "letter-hunt-star" },
};

registerPersonalization("letter-hunt", {
  skill: "uppercase-letter-recognition",
  eligibleUnits: LETTERS,
  buildLevel: (unit) => choiceLevel(unit, sampleLetters(unit, 2), 1),
  pickTarget: pickWithDiscoveryFallback,
});

export default letterHunt;
