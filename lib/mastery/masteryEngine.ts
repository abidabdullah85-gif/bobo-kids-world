"use client";
import { getLocalDateKey } from "@/lib/time/localDate";

import type { MasteryStatus } from "@/types/game";

// ── Config ───────────────────────────────────────────────────────────────────

const STORAGE_KEY = "bobo-kids-world:mastery-v1";
const RECENT_WINDOW = 8;
const CONFIDENT_MIN_ATTEMPTS = 5;
const CONFIDENT_ACCURACY = 0.8;
const MASTERED_MIN_DAYS = 3;     // Phase 6: 3+ distinct days at confident level
const DISCOVERING_MAX_ATTEMPTS = 2; // Phase 6: first 1-2 attempts = discovering

// ── Types ────────────────────────────────────────────────────────────────────

export interface UnitStats {
  attempts: number;
  correctFirstTry: number;
  recentOutcomes: boolean[];   // last RECENT_WINDOW first-try results
  sessionDates: string[];      // distinct local calendar days
}

export interface SkillRecord {
  units: Record<string, UnitStats>;
  recentOutcomes: boolean[];   // skill-level rolling window
  sessionDates: string[];
}

interface MasteryStore {
  skills: Record<string, SkillRecord>;
}

export interface SkillEvidence {
  status: MasteryStatus;
  attempts: number;
  sessionDates: number;
}

// ── Persistence ───────────────────────────────────────────────────────────────

let _cache: MasteryStore | null = null;
let _rawCache = "";
const listeners = new Set<() => void>();

function readLocal(): MasteryStore {
  if (typeof window === "undefined") return { skills: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? "";
    if (raw === _rawCache && _cache) return _cache;
    _rawCache = raw;
    _cache = raw ? JSON.parse(raw) : { skills: {} };
    return _cache!;
  } catch {
    return { skills: {} };
  }
}

function writeLocal(store: MasteryStore) {
  if (typeof window === "undefined") return;
  try {
    _cache = store;
    _rawCache = JSON.stringify(store);
    localStorage.setItem(STORAGE_KEY, _rawCache);
    listeners.forEach((fn) => fn());
  } catch {}
}

export function subscribeMastery(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getMasterySnapshotKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) ?? "";
}

// ── Resolve status ─────────────────────────────────────────────────────────

export function resolveStatus(
  recentOutcomes: boolean[],
  sessionDates: string[],
  totalAttempts = recentOutcomes.length
): MasteryStatus {
  if (totalAttempts === 0) return "not-started";

  // Phase 6: discovering = first 1-2 attempts regardless of accuracy
  if (totalAttempts <= DISCOVERING_MAX_ATTEMPTS) return "discovering";

  const recent = recentOutcomes.slice(-RECENT_WINDOW);
  const correct = recent.filter(Boolean).length;
  const accuracy = recent.length > 0 ? correct / recent.length : 0;

  // Mastered: confident-level performance across 3+ distinct days
  if (
    recent.length >= CONFIDENT_MIN_ATTEMPTS &&
    accuracy >= CONFIDENT_ACCURACY &&
    sessionDates.length >= MASTERED_MIN_DAYS
  ) {
    return "mastered";
  }

  // Confident: good accuracy + 2+ days
  if (
    recent.length >= CONFIDENT_MIN_ATTEMPTS &&
    accuracy >= CONFIDENT_ACCURACY &&
    sessionDates.length >= 2
  ) {
    return "confident";
  }

  if (accuracy >= 0.5) return "practicing";
  return "learning";
}

// ── Read ───────────────────────────────────────────────────────────────────

function getTodayKey(): string {
  return getLocalDateKey();
}

function getOrCreateSkill(store: MasteryStore, skill: string): SkillRecord {
  if (!store.skills[skill]) {
    store.skills[skill] = { units: {}, recentOutcomes: [], sessionDates: [] };
  }
  return store.skills[skill];
}

function getOrCreateUnit(rec: SkillRecord, unit: string): UnitStats {
  if (!rec.units[unit]) {
    rec.units[unit] = {
      attempts: 0,
      correctFirstTry: 0,
      recentOutcomes: [],
      sessionDates: [],
    };
  }
  return rec.units[unit];
}

export function getSkillStatus(skill: string): MasteryStatus {
  const rec = readLocal().skills[skill];
  if (!rec) return "not-started";
  return resolveStatus(rec.recentOutcomes, rec.sessionDates);
}

export function getAllSkillStatuses(): Record<string, MasteryStatus> {
  const store = readLocal();
  const out: Record<string, MasteryStatus> = {};
  for (const skill of Object.keys(store.skills)) {
    out[skill] = getSkillStatus(skill);
  }
  return out;
}

export function getSkillEvidence(skill: string): SkillEvidence {
  const rec = readLocal().skills[skill];
  const recentOutcomes = rec?.recentOutcomes ?? [];
  return {
    status: resolveStatus(
      recentOutcomes,
      rec?.sessionDates ?? [],
      rec ? Object.values(rec.units).reduce((s, u) => s + u.attempts, 0) : 0
    ),
    attempts: recentOutcomes.length,
    sessionDates: (rec?.sessionDates ?? []).length,
  };
}

export function getWeakUnits(skill: string, max = 3): string[] {
  const rec = readLocal().skills[skill];
  if (!rec) return [];
  return Object.entries(rec.units)
    .filter(([, u]) => u.attempts > 0 && u.correctFirstTry / u.attempts < 0.8)
    .sort(([, a], [, b]) => a.correctFirstTry / a.attempts - b.correctFirstTry / b.attempts)
    .slice(0, max)
    .map(([unit]) => unit);
}

export function getAttemptedUnits(skill: string): string[] {
  const rec = readLocal().skills[skill];
  if (!rec) return [];
  return Object.keys(rec.units).filter((u) => rec.units[u].attempts > 0);
}

// ── Write ──────────────────────────────────────────────────────────────────

export function recordSkillAttempt(
  skill: string,
  unit: string,
  correctFirstTry: boolean
) {
  const store = readLocal();
  const rec = getOrCreateSkill(store, skill);
  const unitStats = getOrCreateUnit(rec, unit);
  const today = getTodayKey();

  // Skill-level signal
  rec.recentOutcomes = [...rec.recentOutcomes, correctFirstTry].slice(-RECENT_WINDOW);
  if (!rec.sessionDates.includes(today)) {
    rec.sessionDates = [...rec.sessionDates, today].slice(-30);
  }

  // Unit-level signal
  unitStats.attempts++;
  if (correctFirstTry) unitStats.correctFirstTry++;
  unitStats.recentOutcomes = [...unitStats.recentOutcomes, correctFirstTry].slice(-RECENT_WINDOW);
  if (!unitStats.sessionDates.includes(today)) {
    unitStats.sessionDates = [...unitStats.sessionDates, today];
  }

  writeLocal(store);
}

/** Additive per-unit evidence (for Color Sort's per-color signal) */
export function recordUnitEvidence(
  skill: string,
  unit: string,
  correct: boolean
) {
  const store = readLocal();
  const rec = getOrCreateSkill(store, skill);
  const unitStats = getOrCreateUnit(rec, unit);

  unitStats.attempts++;
  if (correct) unitStats.correctFirstTry++;
  unitStats.recentOutcomes = [...unitStats.recentOutcomes, correct].slice(-RECENT_WINDOW);

  // Notify listeners but don't update skill-level recentOutcomes
  _cache = store;
  _rawCache = JSON.stringify(store);
  try { localStorage.setItem(STORAGE_KEY, _rawCache); } catch {}
  listeners.forEach((fn) => fn());
}
