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
  const [baskets,   setBaskets]   = useState<Record<string, string[]>>(
    Object.fromEntries(question.baskets.map(b => [b.key, []]))
  );
  const [selected,    setSelected]    = useState<string | null>(null);
  const [wrongBasket, setWrongBasket] = useState<string | null>(null);
  const [firstTry,    setFirstTry]    = useState(true);

  const basketColors: Record<SortColor, string> = {
    red:    "bg-red-100 border-red-300",
    blue:   "bg-blue-100 border-blue-300",
    yellow: "bg-yellow-100 border-yellow-300",
    green:  "bg-green-100 border-green-300",
  };

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
      setTimeout(() => { setWrongBasket(null); setSelected(null); }, 700);
      return;
    }

    playClick();
    const newBaskets   = { ...baskets, [basketKey]: [...baskets[basketKey], selected] };
    const newRemaining = remaining.filter(id => id !== selected);
    setBaskets(newBaskets);
    setRemaining(newRemaining);
    setSelected(null);
    setWrongBasket(null);

    if (newRemaining.length === 0) {
      playCorrect();
      setTimeout(() => onAnswer(true, firstTry), 600);
    }
  }, [selected, question.items, remaining, baskets, firstTry, onAnswer]);

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">

      {/* Items pool */}
      <div className="bg-white rounded-3xl p-4 shadow-lg border-2 border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">👆</span>
          <p className="font-black text-sm text-gray-600">
            {selected ? "Now tap a basket! 👇" : "Tap an item to pick it up!"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center min-h-[80px] items-center">
          <AnimatePresence>
            {remaining.map(id => {
              const item = question.items.find(i => i.id === id)!;
              return (
                <motion.button key={id} onClick={() => handleItemClick(id)}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 0.85 }}
                  className={`text-5xl p-3 rounded-2xl border-4 transition-all focus:outline-none shadow-md
                    ${selected === id
                      ? "border-amber-400 bg-amber-50 scale-115 shadow-amber-200 shadow-lg"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                  aria-label={item.label} aria-pressed={selected === id}>
                  {item.emoji}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {remaining.length === 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 font-black text-lg">
              All sorted! 🎉
            </motion.span>
          )}
        </div>
      </div>

      {/* Baskets */}
      <div className={`grid grid-cols-${Math.min(question.baskets.length, 3)} gap-3`}>
        {question.baskets.map(basket => {
          const color = basketColors[basket.key] ?? "bg-gray-100 border-gray-300";
          return (
            <motion.button key={basket.key} onClick={() => handleBasketClick(basket.key)}
              animate={wrongBasket === basket.key ? { x: [-8,8,-8,8,0] } : {}}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border-4 p-3 min-h-[120px] flex flex-col items-center gap-1.5 transition-all focus:outline-none shadow-md
                ${color}
                ${selected ? "hover:scale-105 cursor-pointer ring-2 ring-amber-300" : "cursor-default"}
                ${wrongBasket === basket.key ? "border-red-500 ring-2 ring-red-300" : ""}`}
              aria-label={`${basket.label} basket`}>
              <span className="text-4xl">{basket.emoji}</span>
              <span className="text-sm font-black text-gray-700">{basket.label}</span>
              {/* Sorted items */}
              <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                {baskets[basket.key].map(id => {
                  const item = question.items.find(i => i.id === id);
                  return item ? (
                    <motion.span key={id} className="text-2xl" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {item.emoji}
                    </motion.span>
                  ) : null;
                })}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
