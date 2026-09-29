"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Bobo from "@/components/bobo/Bobo";
import GameCard from "@/components/game-framework/GameCard";
import { ALL_GAMES } from "@/lib/games/registry";
import { useLocalStars } from "@/hooks/useLocalStars";
import { useAllSkillStatuses } from "@/hooks/useSkillMastery";
import { getTodaysAdventureSlugs, getCompletedAdventureSlugs } from "@/lib/dailyAdventure/dailyAdventureEngine";
import { useSyncExternalStore } from "react";
import { subscribeMastery, getMasterySnapshotKey } from "@/lib/mastery/masteryEngine";

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

const PILLAR_TABS = [
  { key: "adventure", label: "⭐ Today" },
  { key: "all",       label: "🎮 All" },
  { key: "literacy",  label: "📚 ABC" },
  { key: "math",      label: "🔢 123" },
  { key: "colors_shapes", label: "🌈 Colors" },
  { key: "logic",     label: "🧩 Logic" },
  { key: "life_skills", label: "🏠 Life" },
];

const FLOATING_EMOJIS = ["⭐","🌈","🎈","🌟","🎉","💫","🎊","🌸","🍭","🎀"];

export default function HomePage() {
  const router = useRouter();
  const stars = useLocalStars();
  const statuses = useAllSkillStatuses();
  const mounted = useMounted();
  const [activeTab, setActiveTab] = useState("adventure");
  const [adventureSlugs, setAdventureSlugs] = useState<string[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setAdventureSlugs(getTodaysAdventureSlugs(ALL_GAMES));
    setCompletedSlugs(getCompletedAdventureSlugs());
  }, []);

  useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, () => "");
  useEffect(() => { setCompletedSlugs(getCompletedAdventureSlugs()); }, []);

  const filteredGames = ALL_GAMES.filter(g => {
    if (activeTab === "adventure") return adventureSlugs.includes(g.slug);
    if (activeTab === "all") return true;
    return g.pillar === activeTab;
  });

  const adventureDone = adventureSlugs.length > 0 && adventureSlugs.every(s => completedSlugs.includes(s));
  const doneCount = completedSlugs.filter(s => adventureSlugs.includes(s)).length;

  return (
    <div className="min-h-screen bubble-bg relative overflow-hidden">
      {/* Floating background emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {FLOATING_EMOJIS.map((e, i) => (
          <motion.div key={i}
            className="absolute text-2xl opacity-20 select-none"
            style={{ left: `${(i * 10 + 5)}%`, top: `${(i * 9 + 5)}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}>
            {e}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 sticky top-0">
        <div className="bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-400 shadow-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bobo expression="greeting" pose="waving" size="xs" />
              <div>
                <h1 className="font-black text-white text-xl leading-tight" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.15)" }}>Bobo's World! 🐻</h1>
                <p className="text-white/80 text-xs font-bold">Learn &amp; Play!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => router.push("/stickers")}
                className="bg-white/25 backdrop-blur rounded-full px-3 py-2 flex items-center gap-1 border-2 border-white/40"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                aria-label="View sticker collection">
                <span className="text-xl">⭐</span>
                <span className="text-white font-black text-xl">{mounted ? stars : 0}</span>
              </motion.button>
              <button onClick={() => router.push("/parent")}
                className="bg-white/25 backdrop-blur text-white rounded-full w-10 h-10 flex items-center justify-center text-xl border-2 border-white/40 hover:bg-white/40 transition"
                aria-label="Parent dashboard">👨‍👩‍👧</button>
            </div>
          </div>
        </div>
      </div>

      {/* Adventure banner */}
      <div className="relative z-10 px-4 mt-4">
        <AnimatePresence>
          {activeTab === "adventure" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`rounded-3xl p-4 border-3 shadow-lg mb-4 ${adventureDone
                ? "bg-gradient-to-r from-green-400 to-emerald-500 border-green-300"
                : "bg-gradient-to-r from-amber-400 to-orange-400 border-amber-300"}`}>
              <div className="flex items-center gap-3">
                <motion.span className="text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  {adventureDone ? "🏆" : "🗺️"}
                </motion.span>
                <div>
                  <p className="font-black text-white text-base" style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}>
                    {adventureDone ? "All done! Great learning today! 🎉" : "Bobo picked 3 games for today!"}
                  </p>
                  <p className="text-white/80 text-xs mt-0.5 font-medium">
                    {adventureDone ? "Come back tomorrow for more!" : "Play them all to complete your adventure!"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {adventureSlugs.map((_, i) => (
                      <motion.div key={i}
                        className={`w-7 h-7 rounded-full border-2 border-white/60 flex items-center justify-center text-sm ${i < doneCount ? "bg-white" : "bg-white/30"}`}
                        animate={i < doneCount ? { scale: [1, 1.2, 1] } : {}}>
                        {i < doneCount ? "⭐" : String(i+1)}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab bar */}
        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className="flex gap-2 min-w-max">
            {PILLAR_TABS.map(tab => (
              <motion.button key={tab.key} onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.92 }}
                className={`px-4 py-2.5 rounded-full font-black text-sm whitespace-nowrap transition-all border-2 shadow-md ${activeTab === tab.key
                  ? "bg-gradient-to-r from-orange-400 to-amber-400 text-white border-orange-300 shadow-orange-200"
                  : "bg-white text-amber-700 border-amber-200 hover:border-amber-400"}`}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Game grid */}
        <div className="mt-4 pb-8 grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, i) => (
              <GameCard key={game.slug} game={game}
                status={statuses[game.skill] ?? "not-started"}
                onClick={() => router.push(`/games/${game.slug}`)}
                isAdventure={adventureSlugs.includes(game.slug)}
                isDone={completedSlugs.includes(game.slug)}
                index={i} />
            ))}
          </AnimatePresence>
          {filteredGames.length === 0 && (
            <div className="col-span-2 text-center py-16">
              <motion.p className="text-6xl mb-3" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🎮</motion.p>
              <p className="font-black text-gray-500 text-lg">No games here yet!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
