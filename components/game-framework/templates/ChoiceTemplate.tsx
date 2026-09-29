"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChoiceQuestion } from "@/types/game";
import ShapeDisplay from "@/components/ui/ShapeDisplay";
import { playCorrect, playRetry, playClick } from "@/lib/audio/AudioManager";

interface Props {
  question: ChoiceQuestion;
  onAnswer: (correct: boolean, firstTry: boolean) => void;
  skill: string;
}

const LETTER_COLORS = ["#FF4757","#FF6B35","#FFA502","#2ED573","#1E90FF","#7B2FBE","#FF6348","#3742FA","#EF476F","#06D6A0"];
function getLetterColor(letter: string): string {
  return LETTER_COLORS[letter.charCodeAt(0) % LETTER_COLORS.length];
}

// Card background gradients — rich, distinct per position
const OPTION_BG = [
  "from-red-400 via-pink-400 to-rose-500",
  "from-blue-400 via-indigo-400 to-blue-500",
  "from-yellow-400 via-amber-400 to-orange-400",
  "from-green-400 via-teal-400 to-emerald-500",
  "from-purple-400 via-violet-400 to-purple-500",
  "from-pink-400 via-fuchsia-400 to-pink-500",
];

export default function ChoiceTemplate({ question, onAnswer, skill }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [multiAttempts, setMultiAttempts] = useState(0);

  const isMulti = !!question.multiSelect;
  const totalCorrect = question.totalCorrect ?? question.options.filter(o => o.isCorrect).length;

  useEffect(() => {
    setSelected(null); setWrongId(null); setCorrectId(null); setAttempts(0);
    setSelectedIds(new Set()); setConfirmedIds(new Set()); setMultiAttempts(0);
  }, [question.id]);

  const handleSingle = useCallback((optId: string, isCorrect: boolean) => {
    if (selected) return;
    setSelected(optId);
    const firstTry = attempts === 0;
    if (isCorrect) {
      setCorrectId(optId);
      playCorrect();
      setTimeout(() => onAnswer(true, firstTry), 700);
    } else {
      playRetry();
      setWrongId(optId);
      // Shake then reset — encouraging, not punishing
      setTimeout(() => { setWrongId(null); setSelected(null); setAttempts(a => a + 1); }, 700);
    }
  }, [selected, attempts, onAnswer]);

  const handleMulti = useCallback((optId: string, isCorrect: boolean) => {
    if (confirmedIds.has(optId)) return;
    if (isCorrect) {
      playClick();
      const next = new Set(selectedIds).add(optId);
      setSelectedIds(next);
      setConfirmedIds(c => new Set(c).add(optId));
      if (next.size >= totalCorrect) {
        playCorrect();
        setTimeout(() => onAnswer(true, multiAttempts === 0), 700);
      }
    } else {
      playRetry();
      setMultiAttempts(a => a + 1);
      setWrongId(optId);
      setTimeout(() => setWrongId(null), 700);
    }
  }, [selectedIds, confirmedIds, totalCorrect, multiAttempts, onAnswer]);

  const handleChoice = isMulti ? handleMulti : handleSingle;

  const isLetter = skill.includes("letter") || skill.includes("sound");
  const isNumber = skill.includes("numeral") || skill.includes("counting");

  // Layout: 2 options = side-by-side large, 3 = row of 3, 4+ = 2 cols
  const cols = question.options.length === 2 ? "grid-cols-2" :
               question.options.length === 3 ? "grid-cols-3" : "grid-cols-2";

  // Card min-height: bigger for 2 options, normal for more
  const cardHeight = question.options.length <= 2 ? "min-h-[180px]" : "min-h-[130px]";

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">

      {/* Multi-select progress */}
      {isMulti && (
        <div className="flex justify-center items-center gap-3 py-1">
          {Array.from({ length: totalCorrect }).map((_, i) => (
            <motion.div key={i}
              className={`w-10 h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center text-lg font-black
                ${i < confirmedIds.size ? "bg-green-400 text-white" : "bg-white/70 text-gray-400"}`}
              animate={i < confirmedIds.size ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}>
              {i < confirmedIds.size ? "✓" : "?"}
            </motion.div>
          ))}
          <span className="text-sm font-black text-gray-600 bg-white/80 rounded-full px-3 py-1 shadow">
            {confirmedIds.size}/{totalCorrect} found
          </span>
        </div>
      )}

      {/* Target display — BIG */}
      {question.targetDisplay && !question.targetDisplay.shapeKey && (
        <motion.div className="flex justify-center items-center py-1"
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}>
          {question.targetDisplay.displayMode === "colour-swatch" ? (
            <div className="flex flex-col items-center gap-2 bg-white/70 rounded-3xl px-8 py-4 shadow-md">
              <span className="text-8xl">{question.targetDisplay.label.split(" ")[0]}</span>
              <span className="text-2xl font-black text-gray-700">{question.targetDisplay.label.split(" ").slice(1).join(" ")}</span>
            </div>
          ) : (
            <div className="bg-white/70 rounded-3xl px-8 py-4 shadow-md">
              <span className="letter-display font-black"
                style={{ color: getLetterColor(question.targetDisplay.label), textShadow: "6px 6px 0px rgba(0,0,0,0.15)", WebkitTextStroke: "2px rgba(0,0,0,0.1)" }}>
                {question.targetDisplay.label}
              </span>
            </div>
          )}
        </motion.div>
      )}
      {question.targetDisplay?.shapeKey && (
        <div className="flex justify-center py-2">
          <div className="bg-white/70 rounded-3xl p-4 shadow-md">
            <ShapeDisplay shapeKey={question.targetDisplay.shapeKey} size={110} color="#F0B429"/>
          </div>
        </div>
      )}

      {/* Item display — counting objects */}
      {question.itemDisplay && (
        <div className="flex justify-center gap-1.5 flex-wrap bg-white/80 rounded-3xl p-4 shadow-md border-2 border-white/60"
          aria-label={question.itemDisplay.srLabel}>
          {Array.from({ length: question.itemDisplay.count }).map((_, i) => (
            <motion.span key={i} className="text-4xl"
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.07, type: "spring", bounce: 0.5 }}>
              {question.itemDisplay!.emoji}
            </motion.span>
          ))}
        </div>
      )}

      {/* Sequence display */}
      {question.sequenceDisplay && (
        <div className="flex justify-center items-center gap-2 flex-wrap bg-white/80 rounded-3xl p-4 shadow-md">
          {question.sequenceDisplay.map((item, i) => (
            <motion.div key={i} className="flex items-center gap-2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
              {item === null
                ? <div className="w-16 h-16 rounded-2xl border-4 border-dashed border-amber-400 flex items-center justify-center text-amber-500 text-4xl font-black bg-amber-50">?</div>
                : <span className="text-4xl bg-white rounded-2xl p-2 shadow-sm">{item}</span>}
              {i < (question.sequenceDisplay!.length - 1) && <span className="text-gray-300 text-3xl font-bold">→</span>}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── OPTION BUTTONS — LARGE ── */}
      <div className={`grid ${cols} gap-4`}>
        {question.options.map((opt, idx) => {
          const isWrong = wrongId === opt.id;
          const isConfirmed = confirmedIds.has(opt.id);
          const isSingleCorrect = correctId === opt.id;
          const isGreen = isConfirmed || isSingleCorrect;
          const bg = OPTION_BG[idx % OPTION_BG.length];

          return (
            <motion.button
              key={opt.id}
              onClick={() => handleChoice(opt.id, opt.isCorrect)}
              initial={{ scale: 0, y: 24 }}
              animate={isWrong
                ? { x: [-8, 8, -6, 6, 0], scale: 1, y: 0 }
                : { scale: 1, y: 0 }
              }
              transition={isWrong
                ? { x: { duration: 0.4 }, scale: { delay: idx * 0.08, type: "spring", bounce: 0.5 } }
                : { delay: idx * 0.08, type: "spring", bounce: 0.5 }
              }
              whileTap={{ scale: 0.88 }}
              disabled={isConfirmed || (!!selected && !isMulti)}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-3xl shadow-xl focus:outline-none transition-all border-4 ${cardHeight}
                ${isGreen
                  ? "border-green-300 bg-green-50"
                  : isWrong
                    ? "border-orange-300 bg-orange-50"
                    : `border-white/70 bg-gradient-to-br ${bg}`}`}
              style={{
                boxShadow: isGreen
                  ? "0 0 0 4px #06D6A0, 0 10px 30px rgba(0,0,0,0.12)"
                  : isWrong
                    ? "0 0 0 3px #FB923C, 0 10px 30px rgba(0,0,0,0.12)"
                    : "0 10px 30px rgba(0,0,0,0.15)",
              }}
              aria-label={opt.label.en}
              aria-pressed={isConfirmed}
            >
              {/* Main visual — LARGE */}
              {opt.itemDisplay ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex flex-wrap justify-center gap-1 max-w-[120px]">
                    {Array.from({ length: opt.itemDisplay.count }).map((_, i) => (
                      <span key={i} className="text-3xl">{opt.itemDisplay!.emoji}</span>
                    ))}
                  </div>
                  <span className="text-3xl font-black text-white mt-1" style={{ textShadow: "2px 2px 0 rgba(0,0,0,0.2)" }}>
                    {opt.itemDisplay.count}
                  </span>
                </div>
              ) : opt.shapeKey ? (
                <ShapeDisplay shapeKey={opt.shapeKey} size={70} color="white"/>
              ) : isLetter && !opt.emoji?.includes("🍎") ? (
                <span className="font-black"
                  style={{
                    fontSize: "clamp(3.5rem,17vw,6rem)",
                    textShadow: "3px 3px 0px rgba(0,0,0,0.2)",
                    color: isGreen ? "#16a34a" : isWrong ? "#c2410c" : "white",
                    lineHeight: 1,
                  }}>
                  {opt.emoji ?? opt.label.en}
                </span>
              ) : isNumber && opt.numeric ? (
                <span className="font-black"
                  style={{
                    fontSize: "clamp(3.5rem,16vw,6rem)",
                    textShadow: "3px 3px 0px rgba(0,0,0,0.2)",
                    color: isGreen ? "#16a34a" : isWrong ? "#c2410c" : "white",
                    lineHeight: 1,
                  }}>
                  {opt.label.en}
                </span>
              ) : (
                <span style={{
                  fontSize: opt.emojiScale === "lg" ? "clamp(4rem,18vw,6.5rem)"
                           : opt.emojiScale === "sm" ? "clamp(2rem,9vw,3.5rem)"
                           : "clamp(3rem,14vw,5rem)",
                  filter: isGreen ? "drop-shadow(0 0 8px rgba(6,214,160,0.6))" : "none",
                }}>
                  {opt.emoji ?? opt.label.en}
                </span>
              )}

              {/* Text label under emoji */}
              {!opt.numeric && !opt.shapeKey && !opt.itemDisplay && (
                <span className={`text-sm font-black drop-shadow ${isGreen ? "text-green-700" : isWrong ? "text-orange-700" : "text-white/95"}`}>
                  {opt.label.en}
                </span>
              )}

              {/* Correct tick */}
              <AnimatePresence>
                {isGreen && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute top-2 right-2 bg-green-400 rounded-full w-8 h-8 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    ✓
                  </motion.div>
                )}
                {isWrong && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute top-2 right-2 bg-orange-400 rounded-full w-8 h-8 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    ↩
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
