import type { Domain } from "@/types/game";

// ── Flat skill → display topic (backward-compat, used by ParentSnapshot) ───

export const SKILL_TOPIC: Record<string, string> = {
  "uppercase-letter-recognition": "Letters",
  "visual-letter-scanning": "Letters",
  "beginning-sound-recognition": "Letter Sounds",
  "numeral-recognition-1-10": "Numbers",
  "counting-1-10": "Counting",
  "counting-with-objects": "Counting",
  "quantity-comparison": "Comparing",
  "color-recognition": "Colors",
  "color-sorting": "Colors",
  "shape-recognition": "Shapes",
  "size-comparison": "Sizes",
  "pattern-sequencing": "Patterns",
  "routine-sequencing": "Routines",
  "safety-awareness": "Safety",
};

export const TOPIC_ORDER = [
  "Letters",
  "Letter Sounds",
  "Numbers",
  "Counting",
  "Comparing",
  "Colors",
  "Shapes",
  "Sizes",
  "Patterns",
  "Routines",
  "Safety",
];

// ── Phase 6: hierarchical domain layer ─────────────────────────────────────

export const SKILL_DOMAIN: Record<string, Domain> = {
  "uppercase-letter-recognition": "Literacy",
  "visual-letter-scanning": "Literacy",
  "beginning-sound-recognition": "Literacy",
  "numeral-recognition-1-10": "Numeracy",
  "counting-1-10": "Numeracy",
  "counting-with-objects": "Numeracy",
  "quantity-comparison": "Numeracy",
  "color-recognition": "Colors & Shapes",
  "color-sorting": "Colors & Shapes",
  "shape-recognition": "Colors & Shapes",
  "size-comparison": "Cognitive Skills",
  "pattern-sequencing": "Cognitive Skills",
  "routine-sequencing": "Life Skills",
  "safety-awareness": "Life Skills",
};

export const DOMAIN_ORDER: Domain[] = [
  "Literacy",
  "Numeracy",
  "Colors & Shapes",
  "Cognitive Skills",
  "Life Skills",
  "World Knowledge",
];
