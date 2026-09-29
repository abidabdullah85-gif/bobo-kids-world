"use client";
import { useState, useEffect, useCallback } from "react";
import { useSyncExternalStore } from "react";
import { subscribeMastery, getMasterySnapshotKey } from "@/lib/mastery/masteryEngine";
import { getPersonalizedLevelOne } from "@/lib/mastery/personalization";
import type { PersonalizedLevelResult } from "@/types/game";

function useHasMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export function usePersonalizedLevelOne(slug: string, generation: number): PersonalizedLevelResult | null {
  const mounted = useHasMounted();
  const [result, setResult] = useState<PersonalizedLevelResult | null>(null);
  const [gen, setGen] = useState(generation);

  // Only recompute when generation bumps (new playthrough)
  useEffect(() => {
    if (!mounted) return;
    if (generation !== gen) {
      setGen(generation);
      setResult(getPersonalizedLevelOne(slug));
    }
  }, [generation, gen, slug, mounted]);

  // Initial compute after mount
  useEffect(() => {
    if (mounted && result === null) {
      setResult(getPersonalizedLevelOne(slug));
    }
  }, [mounted, slug]);

  return result;
}
