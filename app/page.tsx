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

// Pillar visual config
const PILLAR_CONFIG: Record<string, { bg: string; emoji: string; label: string; shadow: string }> = {
  literacy:      { bg: "from-yellow-300 to-amber-400",   emoji: "📚", label: "Letters",  shadow: "rgba(251,191,36,0.5)" },
  math:          { bg: "from-sky-300 to-blue-400",       emoji: "🔢", label: "Numbers",  shadow: "rgba(56,189,248,0.5)" },
  colors_shapes: { bg: "from-pink-300 to-rose-400",      emoji: "🌈", label: "Colours",  shadow: "rgba(244,114,182,0.5)" },
  logic:         { bg: "from-violet-300 to-purple-400",  emoji: "🧩", label: "Thinking", shadow: "rgba(167,139,250,0.5)" },
  life_skills:   { bg: "from-green-300 to-emerald-400",  emoji: "🏠", label: "Life",     shadow: "rgba(52,211,153,0.5)" },
  world:         { bg: "from-teal-300 to-cyan-400",      emoji: "🌍", label: "World",    shadow: "rgba(45,212,191,0.5)" },
};

// Game icon overrides — show the actual thing, not the pillar emoji
const GAME_ICON: Record<string, string> = {
  "letter-hunt":       "🔤",
  "letter-match":      "🔡",
  "find-the-letter":   "🔍",
  "letter-sounds":     "👂",
  "number-pop":        "💯",
  "count-the-animals": "🐣",
  "feed-bobo":         "🍎",
  "more-or-fewer":     "⚖️",
  "color-hunt":        "🎨",
  "color-sort":        "🖌️",
  "shape-builder":     "🔷",
  "big-or-small":      "🐘",
  "what-comes-next":   "🔮",
  "everyday-routines": "🌅",
  "everyday-safety":   "🦺",
};

const CATEGORY_TABS = [
  { key: "adventure", label: "⭐ Today",    color: "from-amber-400 to-orange-500" },
  { key: "literacy",  label: "📚 ABC",      color: "from-yellow-400 to-amber-500" },
  { key: "math",      label: "🔢 123",      color: "from-sky-400 to-blue-500" },
  { key: "colors_shapes", label: "🌈 Colours", color: "from-pink-400 to-rose-500" },
  { key: "logic",     label: "🧩 Think",   color: "from-violet-400 to-purple-500" },
  { key: "life_skills", label: "🏠 Life",  color: "from-green-400 to-emerald-500" },
];

export default function HomePage() {
  const router = useRouter();
  const stars = useLocalStars();
  const statuses = useAllSkillStatuses();
  const mounted = useMounted();
  const [activeTab, setActiveTab] = useState("adventure");
  const [adventureSlugs, setAdventureSlugs] = useState<string[]>([]);
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setAdventureSlugs(getTodaysAdventureSlugs(ALL_GAMES));
    setCompletedSlugs(getCompletedAdventureSlugs());
  }, []);

  useSyncExternalStore(subscribeMastery, getMasterySnapshotKey, () => "");
  useEffect(() => { setCompletedSlugs(getCompletedAdventureSlugs()); }, []);

  const adventureDone = adventureSlugs.length > 0 && adventureSlugs.every(s => completedSlugs.includes(s));
  const doneCount = completedSlugs.filter(s => adventureSlugs.includes(s)).length;

  // Games to show in "Play & Learn" — up to 6 featured, or all
  const featuredSlugs = ["letter-hunt","number-pop","color-hunt","shape-builder","big-or-small","count-the-animals"];
  const allTabGames = ALL_GAMES.filter(g =>
    activeTab === "adventure" ? adventureSlugs.includes(g.slug) :
    g.pillar === activeTab
  );
  const homeGames = activeTab === "adventure"
    ? allTabGames
    : (showAll ? allTabGames : allTabGames.filter(g => featuredSlugs.includes(g.slug)).slice(0,6).concat(allTabGames.filter(g => !featuredSlugs.includes(g.slug))).slice(0,6));

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #E0F7FF 0%, #B8EAF7 12%, #C8F5D4 30%, #FFF9F0 55%)" }}>

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-50" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", borderBottom: "3px solid rgba(61,191,191,0.2)" }}>
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-2xl">🐻</span>
            <span className="font-black text-teal-600 text-base leading-tight">Bobo's<br/>World</span>
          </div>

          {/* Star badge */}
          <motion.button
            onClick={() => router.push("/stickers")}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-black text-sm border-2"
            style={{ background: "linear-gradient(135deg,#FFD700,#FFA500)", borderColor: "#F0B429", color: "#7A4800", boxShadow: "0 4px 12px rgba(240,180,41,0.4)" }}
            whileTap={{ scale: 0.92 }}
            aria-label="Stars — tap to see stickers">
            ⭐ <span>{mounted ? stars : 0}</span>
          </motion.button>

          {/* Nav */}
          <nav className="flex items-center gap-1.5">
            <button onClick={() => router.push("/stickers")}
              className="rounded-2xl px-3 py-1.5 font-black text-xs text-purple-700 border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 transition"
              aria-label="My stickers">🌟</button>
            <button onClick={() => router.push("/parent")}
              className="rounded-2xl px-3 py-1.5 font-black text-xs text-teal-700 border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 transition"
              aria-label="Parents">👨‍👩‍👧</button>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-2 pb-4">
        {/* Sky decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Clouds */}
          {[{l:"5%",t:"10%",s:1.2,d:0},{l:"60%",t:"5%",s:0.9,d:4},{l:"80%",t:"18%",s:0.7,d:8}].map((c,i)=>(
            <motion.div key={i} className="absolute text-5xl opacity-80 select-none"
              style={{left:c.l,top:c.t,fontSize:`${c.s*3.5}rem`}}
              animate={{x:[0,15,0]}} transition={{duration:6+c.d,repeat:Infinity,ease:"easeInOut"}}>☁️</motion.div>
          ))}
          {/* Sun */}
          <motion.div className="absolute text-5xl select-none" style={{right:"8%",top:"6%"}}
            animate={{rotate:[0,10,-10,0],scale:[1,1.05,1]}} transition={{duration:4,repeat:Infinity}}>☀️</motion.div>
          {/* Stars */}
          {["✨","⭐","💫"].map((s,i)=>(
            <motion.div key={i} className="absolute text-2xl select-none opacity-70"
              style={{left:`${25+i*28}%`,top:`${55+i*8}%`}}
              animate={{y:[0,-8,0],opacity:[0.7,1,0.7]}} transition={{duration:2+i,repeat:Infinity,delay:i*0.7}}>{s}</motion.div>
          ))}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-lg mx-auto px-4 pt-4 flex flex-col items-center text-center">
          {/* Bobo */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
            <Bobo expression="excited" pose="celebrating" size="xl" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="font-black text-3xl mt-2 leading-tight"
            style={{ color: "#1A5F5F", textShadow: "2px 2px 0 rgba(255,255,255,0.8)" }}>
            Let's Play With Bobo! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-teal-700 font-bold text-base mt-1">
            Fun games. Big learning. Every day!
          </motion.p>

          {/* Big CTA */}
          <motion.button
            onClick={() => { setActiveTab("adventure"); document.getElementById("games-section")?.scrollIntoView({ behavior: "smooth" }); }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
            whileTap={{ scale: 0.93 }}
            className="mt-4 font-black text-xl text-white rounded-full px-10 py-4 shadow-xl border-4 border-white/50"
            style={{ background: "linear-gradient(135deg,#3DBFBF,#06D6A0)", boxShadow: "0 8px 28px rgba(61,191,191,0.5)" }}>
            ▶ Play Now!
          </motion.button>
        </div>

        {/* Grass strip */}
        <div className="relative mt-4 h-8 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-8" style={{ background: "linear-gradient(180deg,transparent,#A8E6A3)" }}/>
          <div className="absolute bottom-0 left-0 right-0 flex justify-around text-2xl select-none pointer-events-none">
            {["🌸","🌿","🌸","🌿","🌸","🌿","🌸","🌿"].map((f,i)=><span key={i}>{f}</span>)}
          </div>
        </div>
      </section>

      {/* ── DAILY ADVENTURE ── */}
      <section className="max-w-lg mx-auto px-4 pt-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/70"
          style={{ background: adventureDone
            ? "linear-gradient(135deg,#06D6A0,#2ED573)"
            : "linear-gradient(135deg,#FFB347,#FF8C00)",
            boxShadow: adventureDone ? "0 12px 40px rgba(6,214,160,0.4)" : "0 12px 40px rgba(255,140,0,0.4)"
          }}>
          {/* Header row */}
          <div className="px-5 pt-5 pb-3 flex items-center gap-3">
            <motion.span className="text-4xl" animate={{ rotate: [0,15,-15,0] }} transition={{ duration: 2, repeat: Infinity }}>
              {adventureDone ? "🏆" : "🗺️"}
            </motion.span>
            <div>
              <p className="font-black text-white text-lg leading-tight" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.15)" }}>
                {adventureDone ? "Adventure Complete! 🎉" : "Today's Bobo Adventure!"}
              </p>
              <p className="text-white/85 text-xs font-bold mt-0.5">
                {adventureDone ? "Amazing work! Come back tomorrow!" : "Bobo picked 3 games just for you!"}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="px-5 pb-2 flex items-center gap-3">
            {adventureSlugs.map((slug, i) => {
              const done = completedSlugs.includes(slug);
              const game = ALL_GAMES.find(g => g.slug === slug);
              return (
                <motion.div key={i} className="flex flex-col items-center gap-1">
                  <motion.div
                    className={`w-11 h-11 rounded-2xl border-3 border-white/60 flex items-center justify-center text-xl font-black shadow-md
                      ${done ? "bg-white" : "bg-white/30"}`}
                    animate={done ? { scale: [1,1.15,1] } : {}}
                    transition={{ duration: 0.6, repeat: done ? Infinity : 0, repeatDelay: 2 }}>
                    {done ? "⭐" : GAME_ICON[slug] ?? "🎮"}
                  </motion.div>
                  <span className="text-white/80 text-xs font-bold truncate max-w-[56px] text-center">{game?.title.split(" ")[0]}</span>
                </motion.div>
              );
            })}
            {adventureSlugs.length === 0 && [0,1,2].map(i=>(
              <div key={i} className="w-11 h-11 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-white/40 font-black">{i+1}</div>
            ))}
          </div>

          {/* CTA */}
          {!adventureDone && (
            <div className="px-5 pb-5">
              <button
                onClick={() => { setActiveTab("adventure"); document.getElementById("games-section")?.scrollIntoView({ behavior: "smooth" }); }}
                className="w-full rounded-2xl py-3 font-black text-base text-amber-800 bg-white shadow-lg border-2 border-white/80 hover:shadow-xl transition"
                style={{ boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
                ▶ Start Adventure!
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── GAMES SECTION ── */}
      <section id="games-section" className="max-w-lg mx-auto px-4 pt-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-2xl text-gray-800">🎮 Play &amp; Learn</h2>
          <button onClick={() => setShowAll(s => !s)}
            className="text-teal-600 font-black text-sm border-2 border-teal-300 rounded-full px-3 py-1 bg-teal-50 hover:bg-teal-100 transition">
            {showAll ? "Less ↑" : "See All →"}
          </button>
        </div>

        {/* Category tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {CATEGORY_TABS.map(tab => (
              <motion.button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowAll(false); }}
                whileTap={{ scale: 0.92 }}
                className={`px-4 py-2 rounded-full font-black text-sm whitespace-nowrap transition-all border-3 shadow-md ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${tab.color} text-white border-white/30 shadow-lg`
                    : "bg-white text-gray-600 border-gray-200"}`}>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Game grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 pb-6">
          <AnimatePresence mode="popLayout">
            {homeGames.map((game, i) => {
              const cfg = PILLAR_CONFIG[game.pillar] ?? PILLAR_CONFIG.world;
              const icon = GAME_ICON[game.slug] ?? cfg.emoji;
              const isDone = completedSlugs.includes(game.slug);
              const isAdventure = activeTab === "adventure";
              const status = statuses[game.skill] ?? "not-started";

              return (
                <motion.button key={game.slug}
                  onClick={() => router.push(`/games/${game.slug}`)}
                  initial={{ opacity: 0, scale: 0.85, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ delay: i * 0.06, type: "spring", bounce: 0.4 }}
                  whileHover={{ y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.93 }}
                  className="relative rounded-3xl overflow-hidden shadow-xl text-left focus:outline-none focus:ring-4 focus:ring-teal-400 border-4 border-white"
                  style={{ boxShadow: `0 8px 28px ${cfg.shadow}` }}>

                  {/* Card body */}
                  <div className={`bg-gradient-to-br ${cfg.bg} p-4 flex flex-col items-center justify-center min-h-[150px] gap-2`}>
                    {/* Big game icon */}
                    <motion.span
                      className="text-6xl select-none"
                      animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.08, 1] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}>
                      {icon}
                    </motion.span>

                    {/* Title */}
                    <p className="font-black text-white text-base text-center leading-tight" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.2)" }}>
                      {game.title}
                    </p>

                    {/* Skill label */}
                    <span className="bg-white/30 text-white text-xs font-black rounded-full px-2.5 py-0.5">
                      {cfg.label}
                    </span>
                  </div>

                  {/* Play button strip */}
                  <div className="bg-white/90 px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-black text-gray-500">
                      {status === "mastered" ? "🌟 Mastered" : status === "confident" ? "👍 Doing well" : status === "not-started" ? "✨ New!" : "📖 Learning"}
                    </span>
                    <span className="bg-teal-500 text-white text-xs font-black rounded-full px-3 py-1 shadow">▶ Play</span>
                  </div>

                  {/* Done badge */}
                  {isDone && (
                    <div className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md text-sm">✅</div>
                  )}
                  {isAdventure && !isDone && (
                    <motion.div animate={{ scale: [1,1.1,1] }} transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute top-2 right-2 bg-amber-400 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-md text-sm">⭐</motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {homeGames.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <motion.p className="text-5xl mb-3" animate={{ y: [0,-10,0] }} transition={{ duration: 2, repeat: Infinity }}>🎮</motion.p>
              <p className="font-black text-gray-400">No games here yet!</p>
            </div>
          )}
        </div>

        {/* Show all toggle if hidden games exist */}
        {!showAll && allTabGames.length > 6 && activeTab !== "adventure" && (
          <div className="text-center pb-4">
            <button onClick={() => setShowAll(true)}
              className="font-black text-teal-600 border-2 border-teal-300 rounded-full px-6 py-2.5 bg-white shadow hover:bg-teal-50 transition text-sm">
              See all {allTabGames.length} games →
            </button>
          </div>
        )}
      </section>

      {/* ── STICKER REWARD STRIP ── */}
      <section className="max-w-lg mx-auto px-4 pb-8">
        <motion.button
          onClick={() => router.push("/stickers")}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white text-left"
          style={{ background: "linear-gradient(135deg,#A78BFA,#7C3AED)", boxShadow: "0 8px 32px rgba(124,58,237,0.35)" }}>
          <div className="p-5 flex items-center gap-4">
            <motion.span className="text-5xl" animate={{ rotate: [0,15,-15,0] }} transition={{ duration: 2.5, repeat: Infinity }}>🌟</motion.span>
            <div className="flex-1">
              <p className="font-black text-white text-lg leading-tight">Collect Bobo Stickers!</p>
              <p className="text-purple-200 text-xs font-bold mt-0.5">Play games → Earn ⭐ stars → Unlock stickers!</p>
              <div className="flex items-center gap-1 mt-2">
                {["🦁","🐬","🦋","🌈","🎉"].map((s,i)=>(
                  <motion.span key={i} className="text-xl" animate={{ y: [0,-4,0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i*0.2 }}>{s}</motion.span>
                ))}
                <span className="text-purple-200 text-xs font-bold ml-1">+ more!</span>
              </div>
            </div>
            <span className="text-white font-black text-2xl">→</span>
          </div>
        </motion.button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="max-w-lg mx-auto px-4 pb-8 text-center">
        <button onClick={() => router.push("/parent")}
          className="text-gray-400 text-xs font-bold border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50 transition">
          👨‍👩‍👧 Parent Area
        </button>
        <p className="text-gray-300 text-xs mt-2">Bobo Kids World • Learning through play</p>
      </footer>

    </div>
  );
}
