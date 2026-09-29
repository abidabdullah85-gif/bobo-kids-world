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
const OPTION_BG = [
  "from-red-400 to-pink-500","from-blue-400 to-indigo-500",
  "from-yellow-400 to-orange-400","from-green-400 to-teal-500",
  "from-purple-400 to-violet-500","from-pink-400 to-rose-500",
];

export default function ChoiceTemplate({ question, onAnswer, skill }: Props) {
  // Single-select state
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

  // ── Single-select handler ────────────────────────────────────────────────
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
      setTimeout(() => { setWrongId(null); setSelected(null); setAttempts(a => a + 1); }, 600);
    }
  }, [selected, attempts, onAnswer]);

  // ── Multi-select handler ─────────────────────────────────────────────────
  const handleMulti = useCallback((optId: string, isCorrect: boolean) => {
    // Already confirmed = ignore
    if (confirmedIds.has(optId)) return;

    if (isCorrect) {
      playClick();
      const next = new Set(selectedIds).add(optId);
      setSelectedIds(next);
      setConfirmedIds(c => new Set(c).add(optId));

      // All correct answers found?
      if (next.size >= totalCorrect) {
        playCorrect();
        const firstTry = multiAttempts === 0;
        setTimeout(() => onAnswer(true, firstTry), 700);
      }
      // Otherwise: stay on question, gentle confirmation already shown
    } else {
      // Wrong tap — don't penalise harshly, just shake that button
      playRetry();
      setMultiAttempts(a => a + 1);
      setWrongId(optId);
      setTimeout(() => setWrongId(null), 600);
    }
  }, [selectedIds, confirmedIds, totalCorrect, multiAttempts, onAnswer]);

  const handleChoice = isMulti ? handleMulti : handleSingle;

  const isLetter = skill.includes("letter") || skill.includes("sound");
  const isNumber = skill.includes("numeral") || skill.includes("counting");
  const cols = question.options.length <= 2 ? "grid-cols-2" : question.options.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Multi-select progress hint */}
      {isMulti && (
        <div className="flex justify-center items-center gap-2">
          {Array.from({ length: totalCorrect }).map((_, i) => (
            <motion.div key={i}
              className={`w-8 h-8 rounded-full border-4 border-white shadow flex items-center justify-center text-sm font-black ${i < confirmedIds.size ? "bg-green-400 text-white" : "bg-white/60 text-gray-400"}`}
              animate={i < confirmedIds.size ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}>
              {i < confirmedIds.size ? "✓" : "?"}
            </motion.div>
          ))}
          <span className="text-sm font-black text-gray-500 ml-1">{confirmedIds.size}/{totalCorrect} found</span>
        </div>
      )}

      {/* Target display */}
      {question.targetDisplay && !question.targetDisplay.shapeKey && (
        <motion.div className="flex justify-center items-center py-2"
          initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6 }}>
          {question.targetDisplay.displayMode === "colour-swatch" ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-7xl">{question.targetDisplay.label.split(" ")[0]}</span>
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
      {question.targetDisplay?.shapeKey && (
        <div className="flex justify-center py-2"><ShapeDisplay shapeKey={question.targetDisplay.shapeKey} size={100} color="#F0B429"/></div>
      )}

      {/* Item display */}
      {question.itemDisplay && (
        <div className="flex justify-center gap-1 flex-wrap min-h-[70px] bg-white/80 rounded-3xl p-3 shadow-inner" aria-label={question.itemDisplay.srLabel}>
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
        <div className="flex justify-center items-center gap-2 flex-wrap bg-white/80 rounded-3xl p-4 shadow-inner">
          {question.sequenceDisplay.map((item, i) => (
            <motion.div key={i} className="flex items-center gap-2"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
              {item === null
                ? <div className="w-14 h-14 rounded-2xl border-4 border-dashed border-amber-400 flex items-center justify-center text-amber-500 text-3xl font-black bg-amber-50">?</div>
                : <span className="text-3xl bg-white rounded-2xl p-2 shadow-sm">{item}</span>}
              {i < (question.sequenceDisplay!.length - 1) && <span className="text-gray-300 text-2xl font-bold">→</span>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Options */}
      <div className={`grid ${cols} gap-4`}>
        {question.options.map((opt, idx) => {
          const isWrong = wrongId === opt.id;
          const isConfirmed = confirmedIds.has(opt.id); // multi-select: confirmed correct
          const isSingleCorrect = correctId === opt.id; // single-select: correct
          const isGreen = isConfirmed || isSingleCorrect;
          const bgGradient = OPTION_BG[idx % OPTION_BG.length];

          return (
            <motion.button
              key={opt.id}
              onClick={() => handleChoice(opt.id, opt.isCorrect)}
              initial={{ scale: 0, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: idx * 0.08, type: "spring", bounce: 0.5 }}
              whileTap={{ scale: 0.88 }}
              disabled={isConfirmed || (!!selected && !isMulti)}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-3xl p-4 shadow-lg min-h-[110px] focus:outline-none transition-all border-4
                ${isGreen ? "border-green-400 bg-green-50" : isWrong ? "border-red-400 bg-red-50" : "border-white/60 bg-gradient-to-br " + bgGradient}
              `}
              style={{ boxShadow: isGreen ? "0 0 0 4px #06D6A0, 0 8px 24px rgba(0,0,0,0.15)" : isWrong ? "0 0 0 4px #FF4757" : "0 8px 24px rgba(0,0,0,0.15)" }}
              aria-label={opt.label.en}
              aria-pressed={isConfirmed}
            >
              {opt.itemDisplay ? (
                <div className="flex flex-wrap justify-center gap-0.5 max-w-[110px]">
                  {Array.from({ length: opt.itemDisplay.count }).map((_, i) => (
                    <span key={i} className="text-2xl">{opt.itemDisplay!.emoji}</span>
                  ))}
                  <span className="w-full text-center text-2xl font-black text-white mt-1">{opt.itemDisplay.count}</span>
                </div>
              ) : opt.shapeKey ? (
                <ShapeDisplay shapeKey={opt.shapeKey} size={60} color="white"/>
              ) : isLetter && !opt.emoji?.includes("🍎") ? (
                <span className="font-black text-white" style={{ fontSize: "clamp(3rem,15vw,5rem)", textShadow: "3px 3px 0px rgba(0,0,0,0.2)", lineHeight: 1 }}>
                  {opt.emoji ?? opt.label.en}
                </span>
              ) : isNumber && opt.numeric ? (
                <span className="font-black text-white" style={{ fontSize: "clamp(3rem,14vw,5rem)", textShadow: "3px 3px 0px rgba(0,0,0,0.2)", lineHeight: 1 }}>
                  {opt.label.en}
                </span>
              ) : (
                <span style={{
                  fontSize: opt.emojiScale === "lg" ? "clamp(3.5rem,16vw,5.5rem)"
                           : opt.emojiScale === "sm" ? "clamp(1.5rem,7vw,2.5rem)"
                           : "clamp(2.5rem,12vw,4rem)"
                }}>{opt.emoji ?? opt.label.en}</span>
              )}
              {!opt.numeric && !opt.shapeKey && !opt.itemDisplay && (
                <span className="text-sm font-black text-white/90 drop-shadow">{opt.label.en}</span>
              )}

              <AnimatePresence>
                {isWrong && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center rounded-3xl bg-red-500/20">
                    <span className="text-5xl">❌</span>
                  </motion.div>
                )}
                {isGreen && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-2 right-2 text-2xl">✅</motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
