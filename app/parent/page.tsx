"use client";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { subscribeMastery, getMasterySnapshotKey } from "@/lib/mastery/masteryEngine";
import { getDomainSummaries, getBoboRecommendation } from "@/lib/mastery/parentSnapshot";
import { useLocalStars } from "@/hooks/useLocalStars";
import { getWeeklyStats, getTodayStats } from "@/lib/dailyAdventure/dailyLog";
import { getAllLocalGameSummaries } from "@/lib/rewards/rewardEngine";
import { GAME_REGISTRY } from "@/lib/games/registry";
import MasteryBadge from "@/components/ui/MasteryBadge";
import Bobo from "@/components/bobo/Bobo";
import { useMemo } from "react";

function useMounted() {
  return useSyncExternalStore(()=>()=>{},()=>true,()=>false);
}

export default function ParentPage() {
  const router = useRouter();
  const mounted = useMounted();
  const stars = useLocalStars();
  useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, ()=>"");
  const domains = useMemo(()=> mounted ? getDomainSummaries() : [], [mounted]);
  const rec = useMemo(()=> mounted ? getBoboRecommendation() : {noHistory:true}, [mounted]);
  const weekly = useMemo(()=> mounted ? getWeeklyStats() : {completions:0,timeSpentSec:0,starsEarned:0}, [mounted]);
  const gameSummaries = useMemo(()=> mounted ? getAllLocalGameSummaries() : {}, [mounted]);
  const todaySlugs = useMemo(()=> mounted ? getTodayStats().gameSlugs : [], [mounted]);
  const gamesPlayed = Object.keys(gameSummaries).length;
  const mins = Math.round(weekly.timeSpentSec/60);

  return (
    <div className="min-h-screen bg-amber-50/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-4 py-4 flex items-center gap-3">
        <button onClick={()=>router.push("/")} aria-label="Back to home"
          className="bg-white/25 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl font-black hover:bg-white/40 transition flex-shrink-0">←</button>
        <h1 className="text-white font-black text-xl flex-1">Parent Dashboard</h1>
      </div>

      <div className="px-4 py-6 flex flex-col gap-5 max-w-md mx-auto">
        {/* Weekly summary */}
        <div className="bg-white rounded-3xl shadow p-5">
          <h2 className="font-bold text-gray-700 mb-1 text-lg">This week</h2>
          <p className="text-xs text-gray-400 mb-4">Your child's learning activity</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              {label:"Games played",value:weekly.completions,emoji:"🎮"},
              {label:weekly.completions===1 ? "minute" : "minutes",value:mins||"<1",emoji:"⏱️"},
              {label:"Stars earned",value:weekly.starsEarned,emoji:"⭐"},
            ].map(({label,value,emoji})=>(
              <div key={label} className="text-center bg-teal-50 rounded-2xl p-3">
                <p className="text-2xl font-black text-teal-600">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{emoji} {label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What your child practised today */}
        {todaySlugs.length > 0 && (
          <div className="bg-white rounded-3xl shadow p-5">
            <h2 className="font-bold text-gray-700 mb-1 text-lg">Today's games</h2>
            <p className="text-xs text-gray-400 mb-3">What your child practised today</p>
            <div className="flex flex-col gap-2">
              {todaySlugs.map(slug => {
                const game = GAME_REGISTRY[slug];
                if (!game) return null;
                const pillarEmoji: Record<string,string> = {
                  literacy:"🔤", math:"🔢", colors_shapes:"🎨",
                  logic:"🧩", life_skills:"🏠", world:"🌍"
                };
                return (
                  <div key={slug} className="flex items-center gap-3 bg-teal-50 rounded-2xl px-4 py-2.5">
                    <span className="text-xl">{pillarEmoji[game.pillar] ?? "🎮"}</span>
                    <div>
                      <p className="font-bold text-gray-700 text-sm">{game.title}</p>
                      <p className="text-xs text-gray-400">{game.learningObjective}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bobo recommendation */}
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <Bobo expression="curious" pose="thinking" size="sm"/>
            <div>
              <p className="font-bold text-amber-800 text-sm mb-1">Bobo suggests:</p>
              {"noHistory" in rec ? (
                <p className="text-gray-600 text-sm">Play a few games first — then Bobo will suggest what to focus on! 🎮</p>
              ) : "allConfident" in rec ? (
                <p className="text-gray-600 text-sm">Your child is doing great across all areas! Keep up the great work 🌟</p>
              ) : (
                <>
                  <p className="text-gray-600 text-sm">Try some more <strong>{"topic" in rec ? rec.topic : ""}</strong> games today — that's where your child can grow the most!</p>
                  <p className="text-xs text-gray-400 mt-1">Bobo will automatically pick these in Today's Adventure.</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Domain progress */}
        {domains.length > 0 && (
          <div className="bg-white rounded-3xl shadow p-5">
            <h2 className="font-bold text-gray-700 mb-1 text-lg">Learning progress</h2>
            <p className="text-xs text-gray-400 mb-4">How your child is doing in each area</p>
            <div className="flex flex-col gap-4">
              {domains.map(d=>(
                <div key={d.domain}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-gray-700 text-sm">{d.domain}</p>
                    <MasteryBadge status={d.overallStatus} size="xs"/>
                  </div>
                  <div className="flex flex-col gap-1 pl-3 border-l-2 border-amber-200">
                    {d.topics.map(t=>(
                      <div key={t.topic} className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{t.topic}</p>
                        <MasteryBadge status={t.status} size="xs" showLabel={false}/>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {domains.length === 0 && (
          <div className="bg-white rounded-3xl shadow p-8 text-center">
            <p className="text-4xl mb-3">🎮</p>
            <p className="text-gray-500 font-medium">No progress yet.</p>
            <p className="text-sm text-gray-400 mt-1">Play some games to see learning data here!</p>
          </div>
        )}

        {/* Total stars + sticker link */}
        <div className="bg-white rounded-3xl shadow p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-700">Total Stars</p>
            <p className="text-xs text-gray-400">{gamesPlayed} games played</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-3xl">⭐</span>
              <span className="text-3xl font-black text-amber-500">{stars}</span>
            </div>
            <button onClick={()=>router.push("/stickers")}
              className="bg-purple-100 text-purple-700 rounded-2xl px-3 py-2 text-sm font-black hover:bg-purple-200 transition">
              🌟 Stickers
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">Progress stored locally on this device</p>
      </div>
    </div>
  );
}
