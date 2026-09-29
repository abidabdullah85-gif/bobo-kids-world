"use client";
import { useSyncExternalStore, useMemo } from "react";
import { subscribeMastery, getMasterySnapshotKey, getSkillStatus, getAllSkillStatuses } from "@/lib/mastery/masteryEngine";

export function useSkillStatus(skill: string) {
  const key = useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, () => "");
  return useMemo(() => key === "" ? "not-started" : getSkillStatus(skill), [key, skill]);
}

export function useAllSkillStatuses() {
  const key = useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, () => "");
  return useMemo(() => key === "" ? {} : getAllSkillStatuses(), [key]);
}
