"use client";
import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { getGame } from "@/lib/games/registry";
import { getPersonalizedLevelOne } from "@/lib/mastery/personalization";
import type { GameCompletionSummary } from "@/types/game";
import { getUnrevealedSticker, markStickersCelebrated, getOwnedStickerCount } from "@/lib/rewards/stickerEngine";
import { useLocalStars } from "@/hooks/useLocalStars";

const GameScreen = dynamic(() => import("@/components/game-framework/GameScreen"), { ssr:false });
const CompletionScreen = dynamic(() => import("@/components/game-framework/CompletionScreen"), { ssr:false });

type View = "playing"|"complete";

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : Array.isArray(params.slug) ? params.slug[0] : "";
  const game = getGame(slug);
  const stars = useLocalStars();

  const [view, setView] = useState<View>("playing");
  const [summary, setSummary] = useState<GameCompletionSummary | null>(null);
  const [newSticker, setNewSticker] = useState<string | null>(null);
  const [generation, setGeneration] = useState(0);

  const personalizedLevel = getPersonalizedLevelOne(slug);

  const handleComplete = useCallback((s: GameCompletionSummary) => {
    const total = stars + s.stars;
    const unrevealed = getUnrevealedSticker(total);
    if (unrevealed) {
      setNewSticker(unrevealed);
      markStickersCelebrated(getOwnedStickerCount(total));
    }
    setSummary(s);
    setView("complete");
  }, [stars]);

  const handlePlayAgain = useCallback(() => {
    setView("playing");
    setSummary(null);
    setNewSticker(null);
    setGeneration(g => g + 1);
  }, []);

  if (!game) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-4xl">😕</p>
      <p className="font-bold text-gray-600">Game not found</p>
      <button onClick={() => router.push("/")} className="bg-amber-400 text-white font-bold px-6 py-3 rounded-full">Go Home</button>
    </div>
  );

  if (view === "complete" && summary) {
    return <CompletionScreen summary={summary} gameTitle={game.title} newSticker={newSticker}
      onPlayAgain={handlePlayAgain} onHome={() => router.push("/")} />;
  }

  return (
    <GameScreen
      key={generation}
      game={game}
      personalizedLevel={personalizedLevel}
      onComplete={handleComplete}
      onBack={() => router.push("/")}
    />
  );
}
