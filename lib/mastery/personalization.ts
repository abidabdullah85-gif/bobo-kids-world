"use client";
import { getLocalDateKey } from "@/lib/time/localDate";

import type { Level, PersonalizedLevelResult } from "@/types/game";
import {
  getWeakUnits,
  getAttemptedUnits,
  getSkillEvidence,
} from "./masteryEngine";

export const JOURNEY_MIN_ATTEMPTS = 3;
const DISCOVERY_PERIOD = 5;

export interface PersonalizationConfig {
  skill: string;
  eligibleUnits: string[];
  laterLevelUnits?: string[];
  buildLevel: (unit: string, difficulty: 1) => Level;
  pickTarget?: (skill: string, eligibleUnits: string[], collisionUnits?: string[]) => string | null;
}

export type JourneyReadiness = "still-building" | "ready";
export interface JourneyNudge { gameSlug: string; isReady: () => boolean; }

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function xorshift32(x: number): number { x ^= x << 13; x ^= x >> 17; x ^= x << 5; return x >>> 0; }
function getTodayKey(): string { return getLocalDateKey(); }

export function isPeriodicDiscoveryDay(skill: string): boolean {
  const { sessionDates } = getSkillEvidence(skill);
  return sessionDates % DISCOVERY_PERIOD === 0;
}

export function pickDiscoveryCandidate(
  skill: string, eligibleUnits: string[], collisionUnits: string[] = []
): string | null {
  const attempted = new Set(getAttemptedUnits(skill));
  const pool = eligibleUnits.filter((u) => !attempted.has(u) && !collisionUnits.includes(u));
  if (pool.length === 0) return null;
  const seed = hashSeed(skill + getTodayKey());
  return pool[xorshift32(seed) % pool.length];
}

export function pickWithDiscoveryFallback(
  skill: string, eligibleUnits: string[], collisionUnits: string[] = []
): string | null {
  if (isPeriodicDiscoveryDay(skill)) {
    const d = pickDiscoveryCandidate(skill, eligibleUnits, collisionUnits);
    if (d) return d;
  }
  const weak = getWeakUnits(skill, 3).filter(
    (u) => eligibleUnits.includes(u) && !collisionUnits.includes(u)
  );
  if (weak.length > 0) {
    const seed = hashSeed(skill + getTodayKey());
    return weak[xorshift32(seed) % weak.length];
  }
  return pickDiscoveryCandidate(skill, eligibleUnits, collisionUnits);
}

export function hasJourneyEvidence(skill: string): boolean {
  const { status, attempts } = getSkillEvidence(skill);
  return (status === "practicing" || status === "confident" || status === "mastered") && attempts >= JOURNEY_MIN_ATTEMPTS;
}

export function getPersonalizedLevelOne(slug: string): PersonalizedLevelResult | null {
  const config = CONFIG[slug];
  if (!config) return null;
  const pickFn = config.pickTarget ?? pickWithDiscoveryFallback;
  const unit = pickFn(config.skill, config.eligibleUnits, config.laterLevelUnits);
  if (!unit) return null;
  if (config.laterLevelUnits?.includes(unit)) return null;
  const attempted = getAttemptedUnits(config.skill);
  const mode: "weak" | "discovery" = attempted.includes(unit) ? "weak" : "discovery";
  return { level: config.buildLevel(unit, 1), skill: config.skill, unit, mode };
}

export const CONFIG: Record<string, PersonalizationConfig> = {};
export function registerPersonalization(slug: string, cfg: PersonalizationConfig) { CONFIG[slug] = cfg; }
