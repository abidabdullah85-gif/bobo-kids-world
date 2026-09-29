"use client";
import { hasJourneyEvidence, JourneyNudge, JourneyReadiness } from "@/lib/mastery/personalization";
import { registerJourneyNudge } from "@/lib/dailyAdventure/dailyAdventureEngine";

export const COLORS_JOURNEY = {
  foundational: { gameSlug: "color-hunt", skill: "color-recognition" },
  application: { gameSlug: "color-sort", skill: "color-sorting" },
};

export function getColorsFoundationReadiness(): JourneyReadiness {
  return hasJourneyEvidence(COLORS_JOURNEY.foundational.skill) ? "ready" : "still-building";
}

export const COLORS_JOURNEY_NUDGES: JourneyNudge[] = [
  { gameSlug: "color-sort", isReady: () => getColorsFoundationReadiness() === "ready" },
];

COLORS_JOURNEY_NUDGES.forEach(n => registerJourneyNudge(n));
