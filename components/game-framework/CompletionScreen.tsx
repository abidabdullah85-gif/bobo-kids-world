"use client";
import { motion } from "framer-motion";
import type { GameCompletionSummary } from "@/types/game";
import Bobo from "@/components/bobo/Bobo";
import { playCelebration } from "@/lib/audio/AudioManager";
import { useEffect } from "react";

interface Props { summary: GameCompletionSummary; gameTitle: string; onPlayAgain: () => void; onHome: () => void; newSticker?: string | null; }

const CONFETTI_ITEMS = ["⭐","🌟","✨","🎉","🎊","🌈","🎈","💫","❤️","🍭","🎀","🌸"];

export default function CompletionScreen({ summary, gameTitle, onPlayAgain, onHome, newSticker }: Props) {
  useEffect(() => { playCelebration(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-300 via-orange-200 to-pink-200 flex flex-col items-center justify-center px-4 py-8 gap-5 relative overflow-hidden">
      {/* Background confetti */}
      {CONFETTI_ITEMS.map((e, i) => (
        <motion.div key={i} className="fixed text-3xl pointer-events-none select-none"
          style={{ left: `${(i * 8 + 3)}%`, top: "-5%" }}
          animate={{ y: ["0vh", "110vh"], rotate: [0, 360], opacity: [1, 1, 0] }}
          transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, delay: i * 0.2, ease: "linear" }}>
          {e}
        </motion.div>
      ))}

      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6 }}>
        <Bobo expression="celebrating" pose="celebrating" size="xl" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-center">
        <h1 className="text-4xl font-black text-white" style={{ textShadow: "3px 3px 0 rgba(0,0,0,0.15)" }}>Amazing! 🎉</h1>
        <p className="text-lg font-black text-white/80 mt-1">{gameTitle}</p>
      </motion.div>

      {/* Stars */}
      <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {Array.from({ length: summary.stars }).map((_, i) => (
          <motion.span key={i} className="text-6xl" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.2, type: "spring", bounce: 0.8 }}>⭐</motion.span>
        ))}
      </motion.div>

      {/* Positive summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="bg-white/90 rounded-3xl shadow-xl p-5 w-full max-w-sm border-4 border-white/60 text-center">
        {summary.correctFirstTry === summary.totalQuestions ? (
          <p className="text-lg font-black text-green-600">Perfect round! 🌟 Got them all first try!</p>
        ) : summary.correctFirstTry >= Math.ceil(summary.totalQuestions * 0.7) ? (
          <p className="text-lg font-black text-amber-600">Great work! Almost perfect! 💪</p>
        ) : (
          <p className="text-lg font-black text-teal-600">Good practice! Keep playing! 🔄</p>
        )}
        <p className="text-sm text-gray-400 mt-1">{summary.correctFirstTry} of {summary.totalQuestions} on the first try</p>
      </motion.div>

      {/* New sticker */}
      {newSticker && (
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.9, type: "spring", bounce: 0.7 }}
          className="bg-white/90 rounded-3xl shadow-xl p-5 text-center border-4 border-purple-200">
          <p className="text-sm font-black text-purple-600 mb-2">🎁 New sticker unlocked!</p>
          <span className="text-7xl">{newSticker}</span>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="flex flex-col gap-3 w-full max-w-sm z-10">
        <motion.button onClick={onPlayAgain} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-orange-400 to-amber-400 text-white font-black text-xl py-5 rounded-full shadow-xl w-full border-4 border-white/40"
          style={{ textShadow: "1px 1px 0 rgba(0,0,0,0.15)" }}>
          Play Again 🔄
        </motion.button>
        <motion.button onClick={onHome} whileTap={{ scale: 0.95 }}
          className="bg-white/80 text-amber-700 font-black text-lg py-4 rounded-full shadow-lg w-full border-2 border-amber-200 hover:bg-white transition">
          Home 🏠
        </motion.button>
      </motion.div>
    </div>
  );
}
