"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Bobo from "@/components/bobo/Bobo";
import { ALL_GAMES } from "@/lib/games/registry";
import { useLocalStars } from "@/hooks/useLocalStars";
import { useAllSkillStatuses } from "@/hooks/useSkillMastery";
import { getTodaysAdventureSlugs, getCompletedAdventureSlugs } from "@/lib/dailyAdventure/dailyAdventureEngine";
import { useSyncExternalStore } from "react";
import { subscribeMastery, getMasterySnapshotKey } from "@/lib/mastery/masteryEngine";

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

// Category nav config
const CATEGORIES = [
  { key: "all",          label: "All",       emoji: "🎮", color: "bg-teal-500",   active: "bg-teal-500 text-white",   pill: "bg-teal-100 text-teal-700 border-teal-300" },
  { key: "literacy",     label: "Letters",   emoji: "📚", color: "bg-amber-400",  active: "bg-amber-400 text-white",  pill: "bg-amber-50 text-amber-700 border-amber-300" },
  { key: "math",         label: "Numbers",   emoji: "🔢", color: "bg-sky-500",    active: "bg-sky-500 text-white",    pill: "bg-sky-50 text-sky-700 border-sky-300" },
  { key: "colors_shapes",label: "Colours",   emoji: "🌈", color: "bg-pink-500",   active: "bg-pink-500 text-white",   pill: "bg-pink-50 text-pink-700 border-pink-300" },
  { key: "logic",        label: "Thinking",  emoji: "🧩", color: "bg-violet-500", active: "bg-violet-500 text-white", pill: "bg-violet-50 text-violet-700 border-violet-300" },
  { key: "life_skills",  label: "Life Skills",emoji: "🏠", color: "bg-green-500",  active: "bg-green-500 text-white",  pill: "bg-green-50 text-green-700 border-green-300" },
];

// Card colour per pillar — light pastel backgrounds like LearnWorld
const CARD_BG: Record<string, string> = {
  literacy:      "#FFFBEB",
  math:          "#F0F9FF",
  colors_shapes: "#FFF0F3",
  logic:         "#F5F3FF",
  life_skills:   "#F0FDF4",
  world:         "#F0FDFA",
};
const SUBJECT_PILL_COLOR: Record<string, string> = {
  literacy:      "#F59E0B",
  math:          "#0EA5E9",
  colors_shapes: "#EC4899",
  logic:         "#8B5CF6",
  life_skills:   "#22C55E",
  world:         "#14B8A6",
};
const SUBJECT_LABEL: Record<string, string> = {
  literacy:"Letters", math:"Numbers", colors_shapes:"Colours",
  logic:"Thinking", life_skills:"Life Skills", world:"World",
};

// Big 3D-style emoji per game
const GAME_ICON: Record<string, string> = {
  "letter-hunt":        "🔤",
  "letter-match":       "🔡",
  "find-the-letter":    "🔍",
  "letter-sounds":      "🔊",
  "number-pop":         "🔢",
  "count-the-animals":  "🐣",
  "feed-bobo":          "🍎",
  "more-or-fewer":      "⚖️",
  "color-hunt":         "🎨",
  "color-sort":         "🖌️",
  "shape-builder":      "🔷",
  "big-or-small":       "🐘",
  "what-comes-next":    "🔮",
  "everyday-routines":  "🌅",
  "everyday-safety":    "🦺",
};

export default function HomePage() {
  const router = useRouter();
  const stars = useLocalStars();
  const statuses = useAllSkillStatuses();
  const mounted = useMounted();
  const [activeCategory, setActiveCategory] = useState("all");
  const [adventureSlugs, setAdventureSlugs] = useState<string[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  useEffect(() => {
    setAdventureSlugs(getTodaysAdventureSlugs(ALL_GAMES));
    setCompletedSlugs(getCompletedAdventureSlugs());
  }, []);

  useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, () => "");

  const adventureDone = adventureSlugs.length > 0 && adventureSlugs.every(s => completedSlugs.includes(s));
  const doneCount = completedSlugs.filter(s => adventureSlugs.includes(s)).length;

  const filteredGames = activeCategory === "all"
    ? ALL_GAMES
    : ALL_GAMES.filter(g => g.pillar === activeCategory);

  const activeCat = CATEGORIES.find(c => c.key === activeCategory) ?? CATEGORIES[0];

  return (
    <div className="min-h-screen" style={{ background: "#f0f4ff" }}>

      {/* ── TOP NAV BAR ── */}
      <header className="sticky top-0 z-50 shadow-md" style={{ background: "linear-gradient(135deg,#6C3FC5,#E91E8C)" }}>
        <div className="max-w-6xl mx-auto px-4">
          {/* Logo row */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2">
              <Bobo expression="happy" pose="standing" size="xs"/>
              <span className="font-black text-white text-xl" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.2)" }}>
                Bobo Kids World
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Stars badge */}
              <motion.button
                onClick={() => router.push("/stickers")}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-black text-sm border-2 border-yellow-300"
                style={{ background: "#FFD700", color: "#7A4800" }}
                whileTap={{ scale: 0.92 }}
                aria-label="Stars">
                ⭐ {mounted ? stars : 0}
              </motion.button>
              <button onClick={() => router.push("/parent")}
                className="rounded-full px-4 py-1.5 font-black text-sm text-white border-2 border-white/40 bg-white/20 hover:bg-white/30 transition"
                aria-label="Parent area">
                👨‍👩‍👧 Parent
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max pb-1">
              {CATEGORIES.map(cat => (
                <motion.button key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  whileTap={{ scale: 0.93 }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-black text-sm whitespace-nowrap border-2 transition-all ${
                    activeCategory === cat.key
                      ? "bg-white text-purple-700 border-white shadow-lg"
                      : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                  }`}>
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#B8E4FF 0%,#D4F5D4 100%)" }}>
        {/* Grass row */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around text-3xl select-none pointer-events-none pb-1">
          {Array.from({length: 18}).map((_,i) => <span key={i}>{i%3===0?"🌿":"🌸"}</span>)}
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: headline */}
          <div className="text-center md:text-left flex-1">
            <motion.div className="flex justify-center md:justify-start mb-2">
              <span className="text-5xl">☀️</span>
            </motion.div>
            <motion.h1
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              className="font-black text-4xl md:text-5xl leading-tight"
              style={{ color:"#1A1A4E", textShadow:"2px 2px 0 rgba(255,255,255,0.6)" }}>
              15 Learning<br/>Games!
            </motion.h1>
            <p className="text-lg font-bold text-blue-800 mt-2">
              Letters · Numbers · Colours · Shapes · Life Skills
            </p>
            <motion.button
              onClick={() => document.getElementById("games-grid")?.scrollIntoView({ behavior:"smooth" })}
              initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}
              whileTap={{ scale:0.93 }}
              className="mt-5 inline-flex items-center gap-2 rounded-full px-8 py-4 font-black text-xl text-white shadow-xl border-4 border-white/40"
              style={{ background:"linear-gradient(135deg,#6C3FC5,#E91E8C)", boxShadow:"0 8px 28px rgba(108,63,197,0.45)" }}>
              ▶ Play Now!
            </motion.button>
          </div>

          {/* Right: Bobo */}
          <motion.div
            animate={{ y:[0,-14,0] }} transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}
            className="flex-shrink-0">
            <Bobo expression="excited" pose="celebrating" size="xl"/>
          </motion.div>
        </div>
      </section>

      {/* ── DAILY ADVENTURE ── */}
      <section className="max-w-6xl mx-auto px-4 pt-8">
        <motion.div
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
          style={{ background: adventureDone
            ? "linear-gradient(135deg,#06D6A0,#00B894)"
            : "linear-gradient(135deg,#FF8C00,#FFB347)",
            boxShadow: adventureDone ? "0 12px 40px rgba(6,214,160,0.35)" : "0 12px 40px rgba(255,140,0,0.35)"
          }}>
          <div className="p-5 flex flex-col sm:flex-row items-center gap-4">
            <motion.span className="text-5xl flex-shrink-0"
              animate={{ rotate:[0,12,-12,0] }} transition={{ duration:2.2, repeat:Infinity }}>
              {adventureDone ? "🏆" : "🗺️"}
            </motion.span>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-black text-white text-xl leading-tight" style={{ textShadow:"1px 2px 0 rgba(0,0,0,0.15)" }}>
                {adventureDone ? "Adventure Complete! 🎉" : "Today's Bobo Adventure!"}
              </p>
              <p className="text-white/85 text-sm font-bold mt-0.5">
                {adventureDone ? "Great work! Come back tomorrow!" : "Bobo picked 3 games just for you!"}
              </p>
              {/* Progress dots */}
              <div className="flex items-center gap-3 mt-3 justify-center sm:justify-start">
                {adventureSlugs.map((slug, i) => {
                  const done = completedSlugs.includes(slug);
                  const game = ALL_GAMES.find(g => g.slug === slug);
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-12 h-12 rounded-2xl border-2 border-white/60 flex items-center justify-center font-black shadow ${done ? "bg-white" : "bg-white/25"}`}
                        style={{ fontSize: "1.5rem" }}
                        animate={done ? { scale:[1,1.15,1] } : {}}
                        transition={{ duration:0.6, repeat:done?Infinity:0, repeatDelay:2 }}>
                        {done ? "⭐" : (GAME_ICON[slug] ?? "🎮")}
                      </motion.div>
                      <span className="text-white/80 text-xs font-bold truncate max-w-[52px] text-center">
                        {game?.title.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
                {adventureSlugs.length === 0 && [0,1,2].map(i => (
                  <div key={i} className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white/40 font-black text-lg">{i+1}</div>
                ))}
              </div>
            </div>
            {!adventureDone && (
              <button
                onClick={() => { setActiveCategory("all"); document.getElementById("games-grid")?.scrollIntoView({ behavior:"smooth" }); }}
                className="flex-shrink-0 bg-white rounded-2xl px-6 py-3 font-black text-base shadow-lg border-2 border-white hover:shadow-xl transition"
                style={{ color:"#FF8C00" }}>
                ▶ Start!
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── GAMES SECTION ── */}
      <section id="games-grid" className="max-w-6xl mx-auto px-4 pt-8 pb-16">
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-2xl text-gray-800">
            {filteredGames.length} Games
            {activeCategory !== "all" && ` · ${activeCat.label}`}
          </h2>
          {activeCategory !== "all" && (
            <button onClick={() => setActiveCategory("all")}
              className="text-purple-600 font-black text-sm border-2 border-purple-200 rounded-full px-3 py-1 bg-white hover:bg-purple-50 transition">
              See All →
            </button>
          )}
        </div>

        {/* Game grid — 5 columns on desktop like LearnWorld, 2 on mobile */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
          <AnimatePresence mode="popLayout">
            {filteredGames.map((game, i) => {
              const icon = GAME_ICON[game.slug] ?? "🎮";
              const isDone = completedSlugs.includes(game.slug);
              const isAdventure = adventureSlugs.includes(game.slug);
              const status = statuses[game.skill] ?? "not-started";
              const cardBg = CARD_BG[game.pillar] ?? "#F9FAFB";

              return (
                <motion.button key={game.slug}
                  onClick={() => router.push(`/games/${game.slug}`)}
                  initial={{ opacity:0, y:20, scale:0.9 }}
                  animate={{ opacity:1, y:0, scale:1 }}
                  exit={{ opacity:0, scale:0.85 }}
                  transition={{ delay:i*0.04, type:"spring", bounce:0.35 }}
                  whileHover={{ y:-4, scale:1.03 }}
                  whileTap={{ scale:0.93 }}
                  className={`relative flex flex-col rounded-3xl overflow-hidden shadow-lg text-left focus:outline-none focus:ring-4 focus:ring-purple-300 border-2 border-white bg-white`}
                  style={{ boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>

                  {/* Image area — light coloured bg with large emoji */}
                  <div className="flex items-center justify-center py-8 relative" style={{ background: cardBg }}>
                    <motion.span className="select-none" style={{ fontSize: "4.5rem", lineHeight: 1 }}
                      animate={{ y:[0,-6,0] }}
                      transition={{ duration:2.5+i*0.2, repeat:Infinity, ease:"easeInOut", delay:i*0.15 }}>
                      {icon}
                    </motion.span>
                    {/* Difficulty badge — "Easy" like LearnWorld */}
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-black rounded-full px-2 py-0.5 flex items-center gap-0.5">
                      ⭐ Easy
                    </div>
                    {/* Done badge */}
                    {isDone && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-black rounded-full px-2 py-0.5">✅ Done</div>
                    )}
                    {isAdventure && !isDone && (
                      <motion.div animate={{ scale:[1,1.1,1] }} transition={{ duration:1.5, repeat:Infinity }}
                        className="absolute top-2 right-2 bg-orange-400 text-white text-xs font-black rounded-full px-2 py-0.5">
                        ⭐ Today
                      </motion.div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <h3 className="font-black text-gray-900 text-sm leading-tight">{game.title}</h3>
                    {/* Subject pill */}
                    <span className="inline-block self-start rounded-full px-2 py-0.5 text-xs font-black text-white"
                      style={{ background: SUBJECT_PILL_COLOR[game.pillar] ?? "#6B7280" }}>
                      {SUBJECT_LABEL[game.pillar]}
                    </span>
                    {/* Learning objective */}
                    {game.learningObjective && (
                      <p className="text-xs text-gray-500 leading-snug line-clamp-2">{game.learningObjective}</p>
                    )}
                    {/* Play Now button */}
                    <button
                      className="mt-auto w-full rounded-full py-2.5 font-black text-sm text-white shadow-md transition hover:shadow-lg"
                      style={{ background:"linear-gradient(135deg,#6C3FC5,#E91E8C)" }}>
                      ▶ Play Now!
                    </button>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* ── STICKER REWARD STRIP ── */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <motion.button
          onClick={() => router.push("/stickers")}
          whileTap={{ scale:0.97 }}
          className="w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white text-left"
          style={{ background:"linear-gradient(135deg,#7B2FBE,#E91E8C)", boxShadow:"0 8px 32px rgba(123,47,190,0.35)" }}>
          <div className="p-5 flex items-center gap-4">
            <motion.span className="text-5xl" animate={{ rotate:[0,15,-15,0] }} transition={{ duration:2.5, repeat:Infinity }}>🌟</motion.span>
            <div className="flex-1">
              <p className="font-black text-white text-lg">Collect Bobo Stickers!</p>
              <p className="text-purple-200 text-sm font-bold">Play games → Earn ⭐ stars → Unlock stickers!</p>
              <div className="flex items-center gap-1 mt-2">
                {["🦁","🐬","🦋","🌈","🎉","🐸","🦄"].map((s,i)=>(
                  <motion.span key={i} className="text-2xl"
                    animate={{ y:[0,-5,0] }} transition={{ duration:1.5, repeat:Infinity, delay:i*0.2 }}>{s}</motion.span>
                ))}
              </div>
            </div>
            <span className="text-white font-black text-3xl">→</span>
          </div>
        </motion.button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-6xl mx-auto px-4 pb-8 text-center">
        <button onClick={() => router.push("/parent")}
          className="text-gray-400 text-xs font-bold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition">
          👨‍👩‍👧 Parent Dashboard
        </button>
        <p className="text-gray-300 text-xs mt-2">Bobo Kids World · Learning through play</p>
      </footer>
    </div>
  );
}
