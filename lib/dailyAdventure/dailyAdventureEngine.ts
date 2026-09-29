"use client";
import { getLocalDateKey } from "@/lib/time/localDate";
import type { Game } from "@/types/game";
import type { MasteryStatus } from "@/types/game";
import type { JourneyNudge } from "@/lib/mastery/personalization";
import { getAllSkillStatuses } from "@/lib/mastery/masteryEngine";


export const ADVENTURE_SIZE = 3;
const STORAGE_KEY = "bobo-kids-world:adventure-v1";
const JOURNEY_NUDGE_AMOUNT = 0.4;

// Journey nudges registered by journey modules
const JOURNEY_NUDGES: JourneyNudge[] = [];
export function registerJourneyNudge(n: JourneyNudge) { JOURNEY_NUDGES.push(n); }

const TIER: Record<MasteryStatus, number> = {
  "not-started": 0,
  "discovering": 0,
  "learning": 0,
  "practicing": 1,
  "confident": 2,
  "mastered": 2,
};

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function xorshift32(x: number): number { x ^= x << 13; x ^= x >> 17; x ^= x << 5; return x >>> 0; }

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr]; let s = hashSeed(String(seed));
  for (let i = a.length - 1; i > 0; i--) { s = xorshift32(s); const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function tierFor(game: Game, statuses: Record<string, MasteryStatus>): number {
  const base = TIER[statuses[game.skill] ?? "not-started"];
  const nudge = JOURNEY_NUDGES.find(n => n.gameSlug === game.slug);
  if (nudge && base < 2 && nudge.isReady()) return base - JOURNEY_NUDGE_AMOUNT;
  return base;
}

/** Pick diverse games within tiers — prevents same-skill siblings both landing */
function pickDiverseWithinTiers(ranked: Array<{game: Game; tier: number}>): string[] {
  const selected: string[] = [];
  const seenSkills = new Set<string>();
  // Group by tier
  const byTier = new Map<number, Game[]>();
  for (const {game, tier} of ranked) {
    const t = Math.floor(tier * 10) / 10; // normalize
    if (!byTier.has(tier)) byTier.set(tier, []);
    byTier.get(tier)!.push(game);
  }
  const sortedTiers = [...new Set(ranked.map(r => r.tier))].sort((a, b) => a - b);
  
  for (const tier of sortedTiers) {
    if (selected.length >= ADVENTURE_SIZE) break;
    const games = byTier.get(tier) ?? [];
    for (const game of games) {
      if (selected.length >= ADVENTURE_SIZE) break;
      if (!seenSkills.has(game.skill)) {
        selected.push(game.slug);
        seenSkills.add(game.skill);
      }
    }
  }
  // Fill remaining if skill-diversity exhausted
  if (selected.length < ADVENTURE_SIZE) {
    for (const {game} of ranked) {
      if (selected.length >= ADVENTURE_SIZE) break;
      if (!selected.includes(game.slug)) selected.push(game.slug);
    }
  }
  return selected;
}

export function pickAdventureGames(allGames: Game[]): string[] {
  const statuses = getAllSkillStatuses();
  const dateKey = getLocalDateKey();
  const seed = hashSeed(dateKey);
  const shuffled = seededShuffle(allGames, seed);
  const ranked = shuffled
    .map(game => ({ game, tier: tierFor(game, statuses) }))
    .sort((a, b) => a.tier - b.tier);
  return pickDiverseWithinTiers(ranked);
}

interface AdventureStore { date: string; slugs: string[]; }

export function getTodaysAdventureSlugs(allGames: Game[]): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored: AdventureStore = JSON.parse(raw);
      if (stored.date === getLocalDateKey()) return stored.slugs;
    }
  } catch {}
  const slugs = pickAdventureGames(allGames);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getLocalDateKey(), slugs }));
  } catch {}
  return slugs;
}

export function getCompletedAdventureSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("bobo-kids-world:daily-log-v1");
    if (!raw) return [];
    const log = JSON.parse(raw);
    return log.days?.[getLocalDateKey()]?.gameSlugs ?? [];
  } catch { return []; }
}
