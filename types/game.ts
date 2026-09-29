// ── Core Types ──────────────────────────────────────────────────────────────

export type MasteryStatus =
  | "not-started"
  | "discovering"   // new in Phase 6: first few attempts
  | "learning"
  | "practicing"
  | "confident"
  | "mastered";     // new in Phase 6: sustained confident across 3+ days

export type Pillar =
  | "literacy"
  | "math"
  | "colors_shapes"
  | "logic"
  | "life_skills"
  | "world";

export type Domain =
  | "Literacy"
  | "Numeracy"
  | "Colors & Shapes"
  | "Cognitive Skills"
  | "Life Skills"
  | "World Knowledge";

export type GameTemplate = "choice" | "drag_count" | "sort";
export type ProgressionType = "progressive" | "unit-based";

export type ShapeKey = "circle" | "square" | "triangle" | "rectangle" | "oval";

// ── Choice template types ───────────────────────────────────────────────────

export interface ChoiceOption {
  id: string;
  label: { en: string; ms?: string };
  emoji?: string;
  shapeKey?: ShapeKey;
  isCorrect: boolean;
  numeric?: boolean;
  itemDisplay?: { emoji: string; count: number; srLabel: string };
  /** Relative visual scale for emoji display — used by size-comparison games (e.g. Big or Small) */
  emojiScale?: "sm" | "md" | "lg";
}

export interface ChoiceQuestion {
  id: string;
  prompt: { en: string; ms?: string };
  audioPrompt?: { en: string };
  skillUnit: string;
  options: ChoiceOption[];
  targetDisplay?: { label: string; shapeKey?: ShapeKey; displayMode?: "letter" | "colour-swatch" };
  itemDisplay?: { emoji: string; count: number; srLabel: string };
  sequenceDisplay?: (string | null)[];
  multiSelect?: boolean;
  totalCorrect?: number;
  numeric?: boolean;
}

// ── Sort template types ─────────────────────────────────────────────────────

export type SortColor = "red" | "blue" | "yellow" | "green";

export interface SortItem {
  id: string;
  emoji: string;
  groupKey: SortColor;
  label: string;
}

export interface SortBasket {
  key: SortColor;
  label: string;
  emoji: string;
}

export interface SortQuestion {
  id: string;
  prompt: { en: string };
  skillUnit: string;
  items: SortItem[];
  baskets: SortBasket[];
}

// ── DragCount template types ────────────────────────────────────────────────

export interface DragCountQuestion {
  id: string;
  prompt: { en: string };
  skillUnit: string;
  targetCount: number;
  poolSize: number;
  itemEmoji: string;
  basketEmoji: string;
}

// ── Level / Game ────────────────────────────────────────────────────────────

export interface Level {
  difficulty: 1 | 2 | 3;
  questions: (ChoiceQuestion | SortQuestion | DragCountQuestion)[];
}

export interface PersonalizedLevelResult {
  level: Level;
  skill: string;
  unit: string;
  mode: "weak" | "discovery";
}

export interface Game {
  slug: string;
  title: string;
  ageRange: [number, number];
  pillar: Pillar;
  skill: string;
  template: GameTemplate;
  progressionType: ProgressionType;
  instructions: { en: string; ms?: string };
  levels: Level[];
  reward: { stars: number; badgeKey?: string };
  // Phase 6 additions (optional for backward compat)
  difficulty?: 1 | 2 | 3;
  estimatedDurationMin?: number;
  learningObjective?: string;
  prerequisiteSkills?: string[];
}

// ── Completion ──────────────────────────────────────────────────────────────

export interface GameCompletionSummary {
  slug: string;
  stars: number;
  correctFirstTry: number;
  totalQuestions: number;
  timeSpentSec: number;
  // Phase 6 additions
  score?: number;
  maxScore?: number;
  accuracy?: number;
  hintsUsed?: number;
  completed?: boolean;
  sessionId?: string;
  skillIds?: string[];
}
