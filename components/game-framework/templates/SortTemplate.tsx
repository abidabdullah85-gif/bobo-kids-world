"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SortQuestion, SortColor } from "@/types/game";
import { playCorrect, playClick, playRetry } from "@/lib/audio/AudioManager";

interface Props { question: SortQuestion; onAnswer: (correct: boolean, firstTry: boolean) => void; }

export default function SortTemplate({ question, onAnswer }: Props) {
  const [baskets, setBaskets] = useState<Record<string, string[]>>(
    Object.fromEntries(question.baskets.map(b => [b.key, []]))
  );
  const [remaining, setRemaining] = useState(question.items.map(i => i.id));
  const [selected, setSelected] = useState<string | null>(null);
  const [firstTry, setFirstTry] = useState(true);
  const [wrongBasket, setWrongBasket] = useState<string | null>(null);

  const handleItemClick = useCallback((id: string) => {
    playClick();
    setSelected(prev => prev === id ? null : id);
  }, []);

  const handleBasketClick = useCallback((basketKey: string) => {
    if (!selected) return;
    const item = question.items.find(i => i.id === selected);
    if (!item) return;
    if (item.groupKey !== basketKey) {
      setWrongBasket(basketKey);
      playRetry();
      setTimeout(() => setWrongBasket(null), 500);
      setFirstTry(false);
      setSelected(null);
      return;
    }
    playClick();
    setBaskets(prev => ({ ...prev, [basketKey]: [...prev[basketKey], selected] }));
    setRemaining(prev => prev.filter(id => id !== selected));
    setSelected(null);
    // Check completion
    const newRemaining = remaining.filter(id => id !== selected);
    if (newRemaining.length === 0) {
      playCorrect();
      setTimeout(() => onAnswer(true, firstTry), 800);
    }
  }, [selected, question.items, remaining, firstTry, onAnswer]);

  const basketColors: Record<SortColor, string> = {
    red:"border-red-400 bg-red-50", blue:"border-blue-400 bg-blue-50",
    yellow:"border-yellow-400 bg-yellow-50", green:"border-green-400 bg-green-50",
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-lg mx-auto">
      {/* Items to sort */}
      <div className="bg-white rounded-3xl p-4 shadow-md min-h-[80px]">
        {/* Visual instruction: selected item shows a downward arrow hint */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-lg">👆</span>
          <p className="text-sm text-center text-gray-500 font-bold">
            {selected ? "Now tap a basket! 👇" : "Tap an item to pick it up!"}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          <AnimatePresence>
            {remaining.map(id => {
              const item = question.items.find(i => i.id === id)!;
              return (
                <motion.button key={id} onClick={() => handleItemClick(id)}
                  initial={{scale:0}} animate={{scale:1}} exit={{scale:0}}
                  whileTap={{scale:0.9}}
                  className={`text-4xl p-2 rounded-2xl border-4 transition-all focus:outline-none ${selected===id ? "border-amber-400 bg-amber-50 scale-110" : "border-transparent bg-gray-50"}`}
                  aria-label={item.label} aria-pressed={selected===id}>
                  {item.emoji}
                </motion.button>
              );
            })}
          </AnimatePresence>
          {remaining.length === 0 && <span className="text-green-500 font-bold text-lg">All sorted! 🎉</span>}
        </div>
      </div>

      {/* Baskets */}
      <div className={`grid grid-cols-${Math.min(question.baskets.length, 4)} gap-3`}>
        {question.baskets.map(basket => (
          <motion.button key={basket.key} onClick={() => handleBasketClick(basket.key)}
            animate={wrongBasket === basket.key ? { x:[-6,6,-6,0] } : {}}
            className={`rounded-2xl border-4 p-3 min-h-[100px] flex flex-col items-center gap-1 transition-all focus:outline-none ${basketColors[basket.key]} ${selected ? "hover:scale-105 cursor-pointer" : "cursor-default"} ${wrongBasket===basket.key ? "border-red-500" : ""}`}
            aria-label={`${basket.label} basket`}>
            <span className="text-3xl">{basket.emoji}</span>
            <span className="text-sm font-black text-gray-700">{basket.label}</span>
            <div className="flex flex-wrap gap-0.5 justify-center mt-1">
              {baskets[basket.key].map(id => {
                const item = question.items.find(i => i.id === id);
                return item ? <motion.span key={id} className="text-xl" initial={{scale:0}} animate={{scale:1}}>{item.emoji}</motion.span> : null;
              })}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
