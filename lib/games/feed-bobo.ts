import type { Game, Level, DragCountQuestion } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";

function dragLevel(target: number, poolSize: number, difficulty: 1|2|3): Level {
  if (poolSize < target) throw new Error(`Feed Bobo: poolSize (${poolSize}) must be >= target (${target})`);
  const q: DragCountQuestion = {
    id: `fb-${target}-${difficulty}`,
    prompt: { en: `Give Bobo ${target} apple${target > 1 ? "s" : ""}!` },
    skillUnit: String(target),
    targetCount: target,
    poolSize,
    itemEmoji: "🍎",
    basketEmoji: "🧺",
  };
  return { difficulty, questions: [q] };
}

const feedBobo: Game = {
  slug: "feed-bobo", title: "Feed Bobo",
  ageRange: [3, 5], pillar: "math", skill: "counting-1-10",
  template: "drag_count", progressionType: "progressive",
  difficulty: 1, estimatedDurationMin: 3,
  learningObjective: "Produce a counted quantity by dragging objects",
  instructions: { en: "Tap apples to put them in Bobo's basket!" },
  levels: [dragLevel(3, 5, 1), dragLevel(5, 8, 2), dragLevel(7, 10, 3)],
  reward: { stars: 3, badgeKey: "feed-bobo-star" },
};

registerPersonalization("feed-bobo", {
  skill: "counting-1-10",
  eligibleUnits: ["1", "2", "3", "4"],
  buildLevel: (unit) => dragLevel(parseInt(unit), parseInt(unit) + 2, 1),
  pickTarget: pickWithDiscoveryFallback,
});

export default feedBobo;
