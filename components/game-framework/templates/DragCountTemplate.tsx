"use client";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DragCountQuestion } from "@/types/game";
import { playCorrect, playClick, playRetry } from "@/lib/audio/AudioManager";

interface Props {
  question: DragCountQuestion;
  onAnswer: (correct: boolean, firstTry: boolean) => void;
}

export default function DragCountTemplate({ question, onAnswer }: Props) {
  const { targetCount, poolSize, itemEmoji, basketEmoji } = question;
  const [inBasket, setInBasket] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [shake, setShake] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setInBasket(0); setSubmitted(false); setFirstTry(true); setShake(false); setJustAdded(false);
  }, [question.id]);

  const add = useCallback(() => {
    if (inBasket < poolSize && !submitted) {
      playClick();
      setInBasket(n => n + 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 400);
    }
  }, [inBasket, poolSize, submitted]);

  const remove = useCallback(() => {
    if (inBasket > 0 && !submitted) setInBasket(n => n - 1);
  }, [inBasket, submitted]);

  const submit = useCallback(() => {
    if (submitted || inBasket === 0) return;
    setSubmitted(true);
    const correct = inBasket === targetCount;
    if (correct) {
      playCorrect();
      setTimeout(() => onAnswer(true, firstTry), 800);
    } else {
      playRetry();
      setShake(true);
      setFirstTry(false);
      setTimeout(() => { setInBasket(0); setSubmitted(false); setShake(false); }, 950);
    }
  }, [inBasket, targetCount, submitted, firstTry, onAnswer]);

  const poolRemaining = poolSize - inBasket;
  const isReady = inBasket === targetCount;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto pt-2">

      {/* Target — how many Bobo wants */}
      <motion.div
        className="bg-amber-50 rounded-3xl p-5 w-full text-center border-3 border-amber-200 shadow-lg"
        animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 2, repeat: Infinity }}>
        <p className="text-base font-black text-amber-700 mb-1">{question.prompt.en}</p>
        <p className="text-7xl font-black text-amber-500 leading-none">{targetCount}</p>
        <p className="text-3xl mt-1">{itemEmoji}</p>
      </motion.div>

      {/* Basket — shows what child has added */}
      <motion.div
        className={`bg-white rounded-3xl p-4 w-full shadow-xl border-4 ${isReady ? "border-green-400" : "border-gray-100"} transition-all`}
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-3xl">{basketEmoji}</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-700">{inBasket}</span>
            <span className="text-gray-400 font-bold">/</span>
            <span className="text-2xl font-black text-amber-500">{targetCount}</span>
          </div>
        </div>
        {/* Items in basket */}
        <div className="flex flex-wrap gap-2 justify-center min-h-[60px] items-center">
          <AnimatePresence>
            {Array.from({ length: inBasket }).map((_, i) => (
              <motion.span key={i} className="text-4xl"
                initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }} transition={{ type: "spring", bounce: 0.6 }}>
                {itemEmoji}
              </motion.span>
            ))}
          </AnimatePresence>
          {inBasket === 0 && (
            <p className="text-gray-300 text-sm font-bold">tap {itemEmoji} to add!</p>
          )}
        </div>
        {/* Remove button */}
        {inBasket > 0 && !submitted && (
          <button onClick={remove}
            className="mt-2 w-full text-xs font-black text-gray-400 py-1 hover:text-red-400 transition">
            ← take one out
          </button>
        )}
      </motion.div>

      {/* Pool of items to tap */}
      <div className="bg-white/70 rounded-3xl p-4 w-full shadow-md border-2 border-gray-100">
        <p className="text-center text-sm text-gray-400 mb-3 font-bold">
          {poolRemaining > 0 ? `Tap to add ${itemEmoji}` : "All picked up!"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center min-h-[72px] items-center">
          {Array.from({ length: poolRemaining }).map((_, i) => (
            <motion.button key={`pool-${i}`} onClick={add}
              whileTap={{ scale: 0.7 }}
              animate={i === 0 && poolRemaining > 0 ? { scale: [1, 1.12, 1] } : {}}
              transition={i === 0 ? { duration: 1.5, repeat: Infinity } : {}}
              className="text-5xl p-3 rounded-2xl active:bg-amber-100 transition-colors focus:outline-none"
              aria-label={`Add ${itemEmoji}`}>
              {itemEmoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit button — only when something is in basket */}
      <AnimatePresence>
        {inBasket > 0 && !submitted && (
          <motion.button
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            onClick={submit}
            className={`w-full py-5 rounded-full font-black text-2xl shadow-xl border-4 border-white/50 transition-all ${
              isReady
                ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white"
                : "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
            }`}
            style={{ boxShadow: isReady ? "0 8px 28px rgba(6,214,160,0.5)" : "0 8px 28px rgba(255,140,0,0.35)" }}
            whileTap={{ scale: 0.95 }}>
            {isReady ? "✅ Give to Bobo!" : `Bobo wants ${targetCount}... (${inBasket} so far)`}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
