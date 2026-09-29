export interface WorldArea {
  key: string;
  label: string;
  emoji: string;
  color: string;
  description: string;
  gameSlugs: string[];
}

export const WORLD_AREAS: WorldArea[] = [
  { key: "letter-forest", label: "Letter Forest", emoji: "📚", color: "bg-emerald-400", description: "Letters, phonics, and early reading", gameSlugs: ["letter-hunt","letter-match","find-the-letter","letter-sounds"] },
  { key: "number-meadow", label: "Number Meadow", emoji: "🔢", color: "bg-sky-400", description: "Counting, numbers, and comparing", gameSlugs: ["feed-bobo","number-pop","count-the-animals","more-or-fewer"] },
  { key: "color-garden", label: "Color Garden", emoji: "🌈", color: "bg-pink-400", description: "Spotting and sorting colors", gameSlugs: ["color-hunt","color-sort"] },
  { key: "shape-valley", label: "Shape Valley", emoji: "🔷", color: "bg-violet-400", description: "Naming and matching shapes", gameSlugs: ["shape-builder"] },
  { key: "little-giants", label: "Little Giants", emoji: "🐘", color: "bg-orange-400", description: "Big, small, and everything in between", gameSlugs: ["big-or-small"] },
  { key: "puzzle-island", label: "Puzzle Island", emoji: "🧩", color: "bg-yellow-400", description: "Logic, memory, and patterns", gameSlugs: ["what-comes-next"] },
  { key: "bobos-house", label: "Bobo's House", emoji: "🏠", color: "bg-amber-400", description: "Daily routines and staying safe", gameSlugs: ["everyday-routines","everyday-safety"] },
  { key: "learning-forest", label: "Learning Forest", emoji: "🌳", color: "bg-green-300", description: "Nature and world knowledge", gameSlugs: [] },
  { key: "story-village", label: "Story Village", emoji: "📖", color: "bg-rose-300", description: "Stories and imagination", gameSlugs: [] },
  { key: "music-meadow", label: "Music Meadow", emoji: "🎵", color: "bg-cyan-300", description: "Songs and sounds", gameSlugs: [] },
];
