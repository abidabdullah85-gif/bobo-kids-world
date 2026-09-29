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

  // Reset when question changes
  useEffect(() => { setInBasket(0); setSubmitted(false); setFirstTry(true); setShake(false); }, [question.id]);

  const add = useCallback(() => {
    if (inBasket < poolSize && !submitted) { playClick(); setInBasket(n => n + 1); }
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
      setTimeout(() => { setInBasket(0); setSubmitted(false); setShake(false); }, 900);
    }
  }, [inBasket, targetCount, submitted, firstTry, onAnswer]);

  const poolRemaining = poolSize - inBasket;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      {/* Target prompt */}
      <div className="bg-amber-50 rounded-3xl p-4 w-full text-center border-2 border-amber-200">
        <p className="text-xl font-black text-amber-800">{question.prompt.en}</p>
        <p className="text-5xl font-black text-amber-600 mt-1">{targetCount}</p>
      </div>

      {/* Pool of items */}
      <div className="bg-white rounded-3xl p-4 w-full shadow-md border-2 border-gray-100">
        <p className="text-center text-sm text-gray-400 mb-3 font-bold">Tap to pick up {itemEmoji}</p>
        <div className="flex flex-wrap gap-2 justify-center min-h-[80px] items-center">
          {Array.from({ length: poolRemaining }).map((_, i) => (
            <motion.button key={`pool-${i}`} onClick={add} whileTap={{ scale: 0.75 }}
              className="text-4xl p-3 focus:outline-none hover:scale-110 transition-transform rounded-2xl active:bg-amber-100"
              aria-label={`Add ${itemEmoji}`}>
              {itemEmoji}
            </motion.button>
          ))}
          {poolRemaining === 0 && <span className="text-gray-300 text-sm font-bold">Pool empty</span>}
        </div>
      </div>

      {/* Basket */}
      <motion.div
        className={`rounded-3xl p-4 w-full border-4 shadow-md transition-all ${inBasket === targetCount ? "border-green-400 bg-green-50" : "border-amber-300 bg-amber-50"}`}
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center text-4xl mb-2">{basketEmoji}</div>
        <div className="flex flex-wrap gap-1 justify-center min-h-[60px] items-center">
          <AnimatePresence>
            {Array.from({ length: inBasket }).map((_, i) => (
              <motion.button key={`basket-${i}`}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                onClick={remove} className="text-3xl" aria-label="Remove one">
                {itemEmoji}
              </motion.button>
            ))}
          </AnimatePresence>
          {inBasket === 0 && <span className="text-gray-400 text-sm font-bold">Empty — add {itemEmoji}</span>}
        </div>
        <p className="text-center font-black text-2xl mt-2 text-amber-700">{inBasket} / {targetCount}</p>
      </motion.div>

      <motion.button onClick={submit} disabled={inBasket === 0}
        whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-orange-400 to-amber-400 disabled:opacity-40 text-white font-black text-xl px-10 py-4 rounded-full shadow-xl transition-all w-full border-4 border-white/40">
        Done! ✓
      </motion.button>
    </div>
  );
}
