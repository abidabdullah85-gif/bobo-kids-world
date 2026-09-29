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
      setTimeout(() => { setInBasket(0); setSubmitted(false); setShake(false); }, 1000);
    }
  }, [inBasket, targetCount, submitted, firstTry, onAnswer]);

  const poolRemaining = poolSize - inBasket;
  const isRight = inBasket === targetCount;

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto pt-2">

      {/* Target — large and clear */}
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
        className="bg-white rounded-3xl p-5 w-full text-center shadow-xl border-4 border-amber-200">
        <p className="text-base font-black text-amber-700 mb-1">{question.prompt.en}</p>
        <motion.span className="text-8xl font-black text-amber-500 block"
          animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          {targetCount}
        </motion.span>
        <p className="text-3xl mt-1">{itemEmoji}</p>
      </motion.div>

      {/* Basket */}
      <motion.div
        animate={shake ? { x: [-8,8,-8,8,0] } : { scale: isRight ? [1,1.05,1] : 1 }}
        transition={{ duration: 0.5 }}
        className={`relative bg-white rounded-3xl p-4 w-full shadow-xl border-4 min-h-[120px] flex flex-col items-center justify-center
          ${isRight ? "border-green-400" : shake ? "border-orange-400" : "border-amber-200"}`}>
        <p className="text-4xl mb-2">{basketEmoji}</p>
        {/* Items in basket */}
        <div className="flex flex-wrap justify-center gap-1 min-h-[40px]">
          <AnimatePresence>
            {Array.from({ length: inBasket }).map((_, i) => (
              <motion.span key={i} className="text-3xl"
                initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0 }}>
                {itemEmoji}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        {/* Counter badge */}
        <motion.div
          animate={isRight ? { scale: [1,1.2,1], backgroundColor: ["#FFF7ED","#DCFCE7"] } : {}}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center font-black text-lg text-amber-700 shadow-md">
          {inBasket}
        </motion.div>
      </motion.div>

      {/* Controls */}
      <div className="flex items-center gap-4 w-full">
        <motion.button whileTap={{ scale: 0.88 }} onClick={remove} disabled={inBasket === 0 || submitted}
          className="w-14 h-14 rounded-2xl bg-white border-3 border-gray-200 shadow-lg text-2xl font-black text-gray-500 disabled:opacity-30 flex-shrink-0">
          −
        </motion.button>

        {/* Pool of tappable items — big tap targets */}
        <div className="flex-1 bg-white/80 rounded-2xl p-3 shadow-inner border-2 border-gray-100 min-h-[72px] flex flex-wrap gap-2 justify-center items-center">
          <AnimatePresence>
            {Array.from({ length: poolRemaining }).map((_, i) => (
              <motion.button key={`pool-${i}`} onClick={add} whileTap={{ scale: 0.75 }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="text-4xl p-2.5 focus:outline-none rounded-2xl active:bg-amber-100 transition"
                aria-label={`Add ${itemEmoji}`}>
                {itemEmoji}
              </motion.button>
            ))}
          </AnimatePresence>
          {poolRemaining === 0 && <span className="text-gray-300 font-bold text-sm">Pool empty</span>}
        </div>

        <motion.button whileTap={{ scale: 0.88 }} onClick={add} disabled={inBasket >= poolSize || submitted}
          className="w-14 h-14 rounded-2xl bg-amber-400 border-3 border-amber-300 shadow-lg text-2xl font-black text-white disabled:opacity-30 flex-shrink-0">
          +
        </motion.button>
      </div>

      {/* Submit */}
      <motion.button
        onClick={submit}
        disabled={inBasket === 0 || submitted}
        whileTap={{ scale: 0.93 }}
        animate={isRight ? { scale: [1,1.04,1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`w-full py-4 rounded-2xl font-black text-xl text-white shadow-xl border-4 border-white/50 transition-all
          ${inBasket === 0 || submitted ? "bg-gray-300 opacity-50" : isRight ? "bg-green-500" : "bg-teal-500"}`}>
        {isRight ? "✅ That's " + targetCount + "! Give Bobo!" : "Give to Bobo! " + basketEmoji}
      </motion.button>
    </div>
  );
}
