"use client";

// ── Phrase picker (no-immediate-repeat) ────────────────────────────────────
function createPhrasePicker(pool: string[]) {
  let last = -1;
  return () => {
    if (pool.length === 1) return pool[0];
    let idx = Math.floor(Math.random() * pool.length);
    if (idx === last) idx = (idx + 1) % pool.length;
    last = idx;
    return pool[idx];
  };
}

// ── Bobo personality labels per skill ─────────────────────────────────────
export function personalizedUnitLabel(skill: string, unit: string): string {
  if (skill.includes("letter") || skill.includes("sound")) return `the letter ${unit.toUpperCase()}`;
  if (skill.includes("numeral") || skill.includes("counting-1")) return `the number ${unit}`;
  if (skill.includes("counting-with")) return `counting to ${unit}`;
  if (skill.includes("color")) return `the color ${unit}`;
  if (skill.includes("shape")) return `the ${unit}`;
  if (skill.includes("size")) return unit;
  if (skill.includes("quantity")) return unit;
  if (skill.includes("pattern")) return `the ${unit} pattern`;
  if (skill.includes("routine")) return `the ${unit} routine`;
  if (skill.includes("safety")) return `${unit} safety`;
  return "this";
}

export function conceptEmoji(skill: string, unit: string): string {
  const colorEmoji: Record<string,string> = {red:"🔴",blue:"🔵",yellow:"🟡",green:"🟢",orange:"🟠",purple:"🟣"};
  const numEmoji: Record<string,string> = {"1":"1️⃣","2":"2️⃣","3":"3️⃣","4":"4️⃣","5":"5️⃣","6":"6️⃣","7":"7️⃣","8":"8️⃣","9":"9️⃣","10":"🔟"};
  const shapeEmoji: Record<string,string> = {circle:"⭕",triangle:"🔺",rectangle:"📄",square:"⬜",oval:"🥚"};
  if (skill.includes("color")) return colorEmoji[unit] ?? "🎨";
  if (skill.includes("numeral") || skill.includes("counting")) return numEmoji[unit] ?? "🔢";
  if (skill.includes("shape")) return shapeEmoji[unit] ?? "🔷";
  return "⭐";
}

// ── Intro lines ────────────────────────────────────────────────────────────
const PILLAR_INTRO: Record<string, string> = {
  literacy: "Let's play with letters! 📚",
  math: "Let's explore numbers! 🔢",
  colors_shapes: "Let's explore colors and shapes! 🎨",
  logic: "Let's figure it out together! 🧩",
  life_skills: "Let's practice together! 🌟",
  world: "Let's discover the world! 🌍",
};

const SKILL_INTRO_OVERRIDE: Record<string, string> = {
  "quantity-comparison": "Let's compare! Which has more? 🔢",
  "pattern-sequencing": "Let's find the pattern! 🔁",
  "routine-sequencing": "Let's think about our routines! 🌅",
  "safety-awareness": "Let's talk about being safe! 🛡️",
};

export function getIntroLine(pillar: string, skill?: string): string {
  if (skill && SKILL_INTRO_OVERRIDE[skill]) return SKILL_INTRO_OVERRIDE[skill];
  return PILLAR_INTRO[pillar] ?? "Let's play with Bobo! 🐻";
}

// Weak-remediation templates (implies prior practice)
const WEAK_REMEDIATION_TEMPLATES = [
  (label: string) => `Let's practice ${label}!`,
  (label: string) => `Let's practice ${label} again!`,
  (label: string) => `Let's try ${label} together!`,
  (label: string) => `Time to practice ${label}!`,
];

// Discovery templates (first time — no "again")
const DISCOVERY_TEMPLATES = [
  (label: string) => `Let's learn ${label}!`,
  (label: string) => `Let's discover ${label}!`,
  (label: string) => `Time to explore ${label}!`,
  (label: string) => `Let's try ${label}!`,
];

let _weakIdx = -1;
let _discIdx = -1;

export function getPersonalizedIntroLine(
  skill: string,
  unit: string,
  mode: "weak" | "discovery" = "weak"
): string {
  const label = personalizedUnitLabel(skill, unit);
  const emoji = conceptEmoji(skill, unit);
  const pool = mode === "weak" ? WEAK_REMEDIATION_TEMPLATES : DISCOVERY_TEMPLATES;
  let idx = Math.floor(Math.random() * pool.length);
  if (mode === "weak") {
    if (idx === _weakIdx) idx = (idx + 1) % pool.length;
    _weakIdx = idx;
  } else {
    if (idx === _discIdx) idx = (idx + 1) % pool.length;
    _discIdx = idx;
  }
  return pool[idx](label) + " " + emoji;
}

// ── Correct message ────────────────────────────────────────────────────────
export function getCorrectMessage(skill: string, unit: string, multiSelect = false): string {
  const e = conceptEmoji(skill, unit);
  if (multiSelect) return `Yes! You found all the ${unit.toUpperCase()}'s! ${e}`;
  if (skill.includes("letter") && !skill.includes("sound")) return `Yes! ${e} That's ${unit.toUpperCase()}!`;
  if (skill.includes("sound")) return `That's the sound — ${unit.toUpperCase()}! ${e}`;
  if (skill.includes("numeral")) return `Yes! ${e} That's ${unit}!`;
  if (skill.includes("counting-with")) return `Yes! ${e} You counted ${unit}!`;
  if (skill.includes("counting-1")) return `Yes! ${e} You gave Bobo ${unit}!`;
  if (skill.includes("color-recognition")) return `Yes! ${e} You found ${unit}!`;
  if (skill.includes("color-sort")) return `Yes! ⭐ Great sorting!`;
  if (skill.includes("shape")) return `Yes! ${e} That's a ${unit}!`;
  if (skill.includes("size")) return `Yes! ⭐ That's the ${unit} one!`;
  if (skill.includes("quantity")) return `Yes! You found the group with ${unit}! ${e}`;
  if (skill.includes("pattern")) return `You found the pattern! 🎉`;
  if (skill.includes("routine")) return `You know what comes next! 🌟`;
  if (skill.includes("safety")) return `You picked the safe choice! 🛡️`;
  return `Yes! ⭐ You got it!`;
}

// ── Retry message ──────────────────────────────────────────────────────────
const GENERIC_RETRY = createPhrasePicker([
  "Almost! Let's try again! 💪",
  "So close! Give it another go! 🌟",
  "Keep going — you've got this! ⭐",
  "Almost there! Try once more! 🐻",
  "Nearly! Let's find it together! 🔍",
  "Good try! One more time! 💫",
  "Almost! Look carefully! 👀",
  "Not quite — try again! 🌈",
]);

export function getRetryMessage(skill: string, unit: string): string {
  if (skill.includes("letter") && !skill.includes("sound")) return `Almost! Let's find ${unit.toUpperCase()}! 🔍`;
  if (skill.includes("sound")) return `Almost! What starts with that sound? 👂`;
  if (skill.includes("numeral")) return `Almost! Let's find ${unit}! 🔢`;
  if (skill.includes("counting-with")) return `Almost! Let's count again! 🔢`;
  if (skill.includes("counting-1")) return `Almost! Count carefully! 🍎`;
  if (skill.includes("color-recognition")) return `Almost! Let's find ${unit}! 🎨`;
  if (skill.includes("color-sort")) return `Almost! Which basket matches? 🎨`;
  if (skill.includes("shape")) return `Almost! Let's find the ${unit}! 🔷`;
  if (skill.includes("quantity")) return `Almost! Which group has ${unit}? 🔢`;
  if (skill.includes("pattern")) return `Almost! Look at the pattern again! 🔁`;
  if (skill.includes("routine")) return `Almost! What comes next in this routine? 🌅`;
  if (skill.includes("safety")) return `Almost! Which one is the safer choice? 🛡️`;
  return GENERIC_RETRY();
}

// ── Completion line ────────────────────────────────────────────────────────
const COMPLETION_MESSAGES = createPhrasePicker([
  "Amazing work! 🌟",
  "Fantastic! You did it! 🎉",
  "Brilliant! Well done! ⭐",
  "Super! You're a star! 🌟",
  "Wonderful job! 🏆",
  "Outstanding! Keep it up! 💫",
  "Excellent! You're amazing! 🎊",
  "Incredible! So proud of you! 🌈",
]);

export function getCompletionLine(skill: string, ratio: number): string {
  if (ratio >= 0.9) {
    if (skill.includes("letter")) return "You're doing great with letters! 📚";
    if (skill.includes("numeral") || skill.includes("counting")) return "You're doing great with numbers! 🔢";
    if (skill.includes("color")) return "You're doing great with colors! 🎨";
    if (skill.includes("shape")) return "You're doing great with shapes! 🔷";
    if (skill.includes("pattern")) return "You're brilliant at patterns! 🔁";
    if (skill.includes("routine")) return "You know your routines so well! 🌟";
    if (skill.includes("safety")) return "You're a safety star! 🛡️";
    return "You're doing amazing! ⭐";
  }
  if (ratio >= 0.6) return "Nice work! Let's keep practicing! 💪";
  return "Let's keep practicing together! 🐻";
}

export function getDailyAdventureCompleteLine(): string {
  const lines = [
    "You finished today's whole adventure! 🎉",
    "All done for today — amazing work! 🌟",
    "You completed today's Bobo Adventure! ⭐",
    "Today's adventure is complete — you rock! 🏆",
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}
