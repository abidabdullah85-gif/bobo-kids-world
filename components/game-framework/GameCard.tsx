"use client";
import { motion } from "framer-motion";
import type { Game } from "@/types/game";
import type { MasteryStatus } from "@/types/game";

interface Props { game: Game; status?: MasteryStatus; onClick: () => void; isAdventure?: boolean; isDone?: boolean; index?: number; }

const PILLAR_LABEL: Record<string, string> = {
  literacy:      "🔤 Letters",
  math:          "🔢 Numbers",
  colors_shapes: "🎨 Colours & Shapes",
  logic:         "🧠 Thinking",
  life_skills:   "🏠 Everyday Skills",
  world:         "🌍 World",
};

const PILLAR_CONFIG: Record<string, { gradient: string; emoji: string; bg: string }> = {
  literacy:      { gradient: "from-emerald-400 to-green-500",   emoji: "📚", bg: "bg-emerald-400" },
  math:          { gradient: "from-sky-400 to-blue-500",         emoji: "🔢", bg: "bg-sky-400" },
  colors_shapes: { gradient: "from-pink-400 to-rose-500",        emoji: "🌈", bg: "bg-pink-400" },
  logic:         { gradient: "from-violet-400 to-purple-500",    emoji: "🧩", bg: "bg-violet-400" },
  life_skills:   { gradient: "from-orange-400 to-amber-500",     emoji: "🏠", bg: "bg-orange-400" },
  world:         { gradient: "from-teal-400 to-cyan-500",        emoji: "🌍", bg: "bg-teal-400" },
};

const STATUS_BADGE: Record<MasteryStatus, { label: string; color: string }> = {
  "not-started": { label: "",           color: "" },
  "discovering": { label: "🔍 New!",    color: "bg-blue-500" },
  "learning":    { label: "📖 Learning", color: "bg-yellow-500" },
  "practicing":  { label: "✏️ Practice", color: "bg-orange-500" },
  "confident":   { label: "👍 Great!",  color: "bg-green-500" },
  "mastered":    { label: "🌟 Master!", color: "bg-purple-500" },
};

export default function GameCard({ game, status = "not-started", onClick, isAdventure = false, isDone = false, index = 0 }: Props) {
  const cfg = PILLAR_CONFIG[game.pillar] ?? PILLAR_CONFIG.world;
  const badge = STATUS_BADGE[status];

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: "spring", bounce: 0.4 }}
      whileHover={{ scale: 1.04, y: -3 }}
      whileTap={{ scale: 0.93 }}
      className={`relative w-full text-left rounded-3xl overflow-hidden shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-400 border-4 border-white/60 transition-all ${isDone ? "opacity-80" : ""}`}
      style={{ boxShadow: isAdventure && !isDone ? "0 8px 30px rgba(255,140,0,0.35)" : "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <div className={`bg-gradient-to-br ${cfg.gradient} p-5 min-h-[130px] flex flex-col justify-between`}>
        {/* Badges */}
        <div className="flex justify-between items-start">
          <motion.span className="text-5xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}>
            {cfg.emoji}
          </motion.span>
          <div className="flex flex-col gap-1 items-end">
            {isDone && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-white/90 text-green-700 text-xs font-black rounded-full px-2 py-0.5">✅ Done</motion.span>
            )}
            {isAdventure && !isDone && (
              <motion.span animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="bg-white/90 text-amber-700 text-xs font-black rounded-full px-2 py-0.5">⭐ Today</motion.span>
            )}
            {badge.label && !isDone && (
              <span className={`${badge.color} text-white text-xs font-black rounded-full px-2 py-0.5`}>{badge.label}</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-white font-black text-lg leading-tight" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.2)" }}>{game.title}</h3>
          <p className="text-white/80 text-xs font-bold mt-0.5">{PILLAR_LABEL[game.pillar] ?? ""}</p>
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute top-2 right-12 w-3 h-3 rounded-full bg-white/20"/>
      <div className="absolute top-5 right-8 w-2 h-2 rounded-full bg-white/15"/>
    </motion.button>
  );
}
