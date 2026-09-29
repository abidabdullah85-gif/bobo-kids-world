"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SortQuestion, SortColor } from "@/types/game";
import { playCorrect, playRetry, playClick } from "@/lib/audio/AudioManager";

interface Props {
  question: SortQuestion;
  onAnswer: (correct: boolean, firstTry: boolean) => void;
}

export default function SortTemplate({ question, onAnswer }: Props) {
  const [remaining, setRemaining] = useState(question.items.map(i => i.id));
  const [baskets, setBaskets] = useState<Record<string, string[]>>(
    Object.fromEntries(question.baskets.map(b => [b.key, []]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongBasket, setWrongBasket] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(true);

  const handleItemClick = useCallback((id: string) => {
    playClick();
    setSelected(prev => prev === id ? null : id);
  }, []);

  const handleBasketClick = useCallback((basketKey: string) => {
    if (!selected) return;
    const item = question.items.find(i => i.id === selected)!;

    if (item.groupKey !== basketKey) {
      playRetry();
      setWrongBasket(basketKey);
      setFirstTry(false);
      setTimeout(() => setWrongBasket(null), 600);
      return;
    }

    playClick();
    setBaskets(prev => ({ ...prev, [basketKey]: [...prev[basketKey], selected] }));
    setRemaining(prev => prev.filter(id => id !== selected));
    setSelected(null);

    const newRemaining = remaining.filter(id => id !== selected);
    if (newRemaining.length === 0) {
      playCorrect();
      setTimeout(() => onAnswer(true, firstTry), 700);
    }
  }, [selected, question.items, remaining, firstTry, onAnswer]);

  const basketColors: Record<SortColor, string> = {
    red:    "border-red-400 bg-red-50",
    blue:   "border-blue-400 bg-blue-50",
    green:  "border-green-400 bg-green-50",
    yellow: "border-yellow-400 bg-yellow-50",
  };

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">

      {/* Items to sort */}
      <div className="bg-white rounded-3xl p-4 shadow-md min-h-[90px]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-2xl">{selected ? "👇" : "👆"}</span>
          <p className="text-base font-black text-gray-600 text-center">
            {selected ? "Now tap a basket!" : "Tap an item to pick it up!"}
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <AnimatePresence>
            {remaining.map(id => {
              const item = question.items.find(i => i.id === id)!;
              return (
                <motion.button key={id} onClick={() => handleItemClick(id)}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.88 }}
                  className={`text-5xl p-3 rounded-2xl border-4 transition-all focus:outline-none ${
                    selected === id
                      ? "border-amber-400 bg-amber-50 scale-115 shadow-xl"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                  aria-label={item.label} aria-pressed={selected === id}>
                  {item.emoji}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {remaining.length === 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 font-black text-xl">
              All sorted! 🎉
            </motion.span>
          )}
        </div>
      </div>

      {/* Baskets */}
      <div className={`grid grid-cols-${Math.min(question.baskets.length, 3)} gap-3`}>
        {question.baskets.map(basket => (
          <motion.button key={basket.key}
            onClick={() => handleBasketClick(basket.key)}
            animate={wrongBasket === basket.key ? { x: [-7,7,-7,0] } : {}}
            transition={{ duration: 0.35 }}
            className={`rounded-2xl border-4 p-3 min-h-[110px] flex flex-col items-center gap-1.5 transition-all focus:outline-none shadow-md
              ${basketColors[basket.key as SortColor] ?? "border-gray-300 bg-gray-50"}
              ${selected ? "cursor-pointer hover:scale-105 hover:shadow-xl" : "cursor-default"}
              ${wrongBasket === basket.key ? "border-red-500" : ""}`}
            aria-label={`${basket.label} basket`}>
            <span className="text-4xl">{basket.emoji}</span>
            <span className="text-sm font-black text-gray-700">{basket.label}</span>
            <div className="flex flex-wrap gap-0.5 justify-center mt-1">
              {baskets[basket.key].map(id => {
                const item = question.items.find(i => i.id === id);
                return item ? (
                  <motion.span key={id} className="text-2xl"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    {item.emoji}
                  </motion.span>
                ) : null;
              })}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
