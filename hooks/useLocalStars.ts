"use client";
import { useSyncExternalStore } from "react";
import { subscribeReward, getLocalTotalStars, getAllLocalGameSummaries } from "@/lib/rewards/rewardEngine";

export function useLocalStars() {
  return useSyncExternalStore(subscribeReward, getLocalTotalStars, () => 0);
}

export function useAllGameSummaries() {
  return useSyncExternalStore(subscribeReward, getAllLocalGameSummaries, () => ({}));
}
