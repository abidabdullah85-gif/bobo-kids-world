"use client";
import { hasJourneyEvidence, JourneyNudge, JourneyReadiness } from "@/lib/mastery/personalization";
import { registerJourneyNudge } from "@/lib/dailyAdventure/dailyAdventureEngine";

export const COUNTING_JOURNEY = {
  foundational: [
    { gameSlug: "count-the-animals", skill: "counting-with-objects" },
    { gameSlug: "feed-bobo", skill: "counting-1-10" },
  ],
  practice: { gameSlug: "number-pop", skill: "numeral-recognition-1-10" },
  application: { gameSlug: "more-or-fewer", skill: "quantity-comparison" },
};

export function getCountingFoundationReadiness(): JourneyReadiness {
  const ready = COUNTING_JOURNEY.foundational.every(f => hasJourneyEvidence(f.skill));
  return ready ? "ready" : "still-building";
}
export function getNumeralPracticeReadiness(): JourneyReadiness {
  return hasJourneyEvidence(COUNTING_JOURNEY.practice.skill) ? "ready" : "still-building";
}

export const COUNTING_JOURNEY_NUDGES: JourneyNudge[] = [
  { gameSlug: "number-pop", isReady: () => getCountingFoundationReadiness() === "ready" },
  { gameSlug: "more-or-fewer", isReady: () => getNumeralPracticeReadiness() === "ready" },
];

COUNTING_JOURNEY_NUDGES.forEach(n => registerJourneyNudge(n));
