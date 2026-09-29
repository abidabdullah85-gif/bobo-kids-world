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

// Card backgrounds per position — vivid and distinct
const OPTION_BG = [
  "from-red-400 to-pink-500",
  "from-blue-400 to-indigo-500",
  "from-yellow-400 to-orange-400",
  "from-green-400 to-teal-500",
  "from-purple-400 to-violet-500",
  "from-pink-400 to-rose-500",
];

export default function ChoiceTemplate({ question, onAnswer, skill }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  // Multi-select
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
      setTimeout(() => onAnswer(true, firstTry), 750);
    } else {
      playRetry();
      setWrongId(optId);
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
        setTimeout(() => onAnswer(true, multiAttempts === 0), 750);
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

  // Layout: 2 options → side by side big; 3-4 → 2 cols; more → 2 cols
  const cols = question.options.length === 2 ? "grid-cols-2" : "grid-cols-2";
  // Min height scales with option count
  const cardMinH = question.options.length <= 2 ? "min-h-[160px]" : "min-h-[130px]";

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto pt-2">

      {/* Multi-select progress */}
      {isMulti && (
        <div className="flex justify-center items-center gap-3 py-1">
          {Array.from({ length: totalCorrect }).map((_, i) => (
            <motion.div key={i}
              className={`w-10 h-10 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-base font-black
                ${i < confirmedIds.size ? "bg-green-400 text-white" : "bg-white/70 text-gray-400"}`}
              animate={i < confirmedIds.size ? { scale: [1,1.35,1] } : {}}
              transition={{ duration: 0.35 }}>
              {i < confirmedIds.size ? "✓" : "?"}
            </motion.div>
          ))}
          <span className="text-sm font-black text-gray-600 ml-1">{confirmedIds.size}/{totalCorrect} found</span>
        </div>
      )}

      {/* Target display — letter */}
      {question.targetDisplay && !question.targetDisplay.shapeKey && (
        <motion.div className="flex justify-center items-center py-2"
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}>
          {question.targetDisplay.displayMode === "colour-swatch" ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-8xl">{question.targetDisplay.label.split(" ")[0]}</span>
              <span className="text-2xl font-black text-gray-700">{question.targetDisplay.label.split(" ").slice(1).join(" ")}</span>
            </div>
          ) : (
            <span className="letter-display font-black"
              style={{ color: getLetterColor(question.targetDisplay.label), textShadow: "6px 6px 0px rgba(0,0,0,0.15)", WebkitTextStroke: "2px rgba(0,0,0,0.1)" }}>
              {question.targetDisplay.label}
            </span>
          )}
        </motion.div>
      )}

      {/* Target display — shape */}
      {question.targetDisplay?.shapeKey && (
        <div className="flex justify-center py-2">
          <ShapeDisplay shapeKey={question.targetDisplay.shapeKey} size={110} color="#F0B429"/>
        </div>
      )}

      {/* Item display — counting objects */}
      {question.itemDisplay && (
        <div className="flex justify-center gap-1.5 flex-wrap bg-white/80 rounded-3xl p-4 shadow-inner"
          aria-label={question.itemDisplay.srLabel}>
          {Array.from({ length: question.itemDisplay.count }).map((_, i) => (
            <motion.span key={i} className="text-5xl"
              initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.07, type: "spring", bounce: 0.5 }}>
              {question.itemDisplay!.emoji}
            </motion.span>
          ))}
        </div>
      )}

      {/* Sequence display */}
      {question.sequenceDisplay && (
        <div className="flex justify-center items-center gap-2 flex-wrap bg-white/80 rounded-3xl p-4 shadow-inner">
          {question.sequenceDisplay.map((item, i) => (
            <motion.div key={i} className="flex items-center gap-2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
              {item === null
                ? <div className="w-16 h-16 rounded-2xl border-4 border-dashed border-amber-400 flex items-center justify-center text-amber-500 text-4xl font-black bg-amber-50">?</div>
                : <span className="text-4xl bg-white rounded-2xl p-2 shadow-sm">{item}</span>}
              {i < (question.sequenceDisplay!.length - 1) && <span className="text-gray-300 text-2xl font-bold">→</span>}
            </motion.div>
          ))}
        </div>
      )}

      {/* ── OPTION BUTTONS — the main interactive area ── */}
      <div className={`grid ${cols} gap-4`}>
        {question.options.map((opt, idx) => {
          const isWrong = wrongId === opt.id;
          const isConfirmed = confirmedIds.has(opt.id);
          const isSingleCorrect = correctId === opt.id;
          const isGreen = isConfirmed || isSingleCorrect;
          const bgGradient = OPTION_BG[idx % OPTION_BG.length];

          return (
            <motion.button
              key={opt.id}
              onClick={() => handleChoice(opt.id, opt.isCorrect)}
              initial={{ scale: 0, y: 30 }}
              animate={{
                scale: 1, y: 0,
                // Shake on wrong
                x: isWrong ? [0, -10, 10, -8, 8, 0] : 0,
              }}
              transition={{
                delay: idx * 0.08,
                type: "spring", bounce: 0.5,
                x: isWrong ? { duration: 0.5 } : undefined,
              }}
              whileTap={{ scale: 0.88 }}
              disabled={isConfirmed || (!!selected && !isMulti)}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl p-4 shadow-xl ${cardMinH} focus:outline-none focus:ring-4 focus:ring-white/60 transition-all border-4
                ${isGreen ? "border-green-300 bg-green-50" :
                  isWrong ? "border-red-400 bg-red-50" :
                  `border-white/50 bg-gradient-to-br ${bgGradient}`}`}
              style={{
                boxShadow: isGreen
                  ? "0 0 0 4px #06D6A0, 0 8px 28px rgba(0,0,0,0.15)"
                  : isWrong
                    ? "0 0 0 4px #FF4757, 0 8px 28px rgba(0,0,0,0.15)"
                    : "0 8px 28px rgba(0,0,0,0.15)"
              }}
              aria-label={opt.label.en}
              aria-pressed={isConfirmed}
            >
              {/* ── Main object — LARGE ── */}
              {opt.itemDisplay ? (
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: opt.itemDisplay.count }).map((_, i) => (
                    <span key={i} className="text-3xl">{opt.itemDisplay!.emoji}</span>
                  ))}
                  <span className="w-full text-center text-3xl font-black text-white mt-1">{opt.itemDisplay.count}</span>
                </div>
              ) : opt.shapeKey ? (
                <ShapeDisplay shapeKey={opt.shapeKey} size={70} color="white"/>
              ) : isLetter && !opt.emoji?.includes("🍎") ? (
                <span className="font-black text-white" style={{
                  fontSize: "clamp(3.5rem,16vw,6rem)",
                  textShadow: "3px 3px 0px rgba(0,0,0,0.25)", lineHeight: 1
                }}>
                  {opt.emoji ?? opt.label.en}
                </span>
              ) : isNumber && opt.numeric ? (
                <span className="font-black text-white" style={{
                  fontSize: "clamp(3.5rem,15vw,6rem)",
                  textShadow: "3px 3px 0px rgba(0,0,0,0.25)", lineHeight: 1
                }}>
                  {opt.label.en}
                </span>
              ) : (
                <span style={{
                  fontSize: opt.emojiScale === "lg" ? "clamp(4rem,18vw,6.5rem)"
                           : opt.emojiScale === "sm" ? "clamp(2rem,9vw,3.5rem)"
                           : "clamp(3rem,14vw,5rem)"
                }}>
                  {opt.emoji ?? opt.label.en}
                </span>
              )}

              {/* Label under object */}
              {!opt.numeric && !opt.shapeKey && !opt.itemDisplay && (
                <span className="text-base font-black text-white drop-shadow-md">{opt.label.en}</span>
              )}

              {/* Wrong overlay — gentle, not harsh red X */}
              <AnimatePresence>
                {isWrong && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center rounded-3xl bg-red-500/15">
                    <span className="text-5xl">🤔</span>
                  </motion.div>
                )}
                {isGreen && (
                  <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-2 right-2 text-3xl">✅</motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
