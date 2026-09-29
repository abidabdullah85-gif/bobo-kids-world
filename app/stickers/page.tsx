"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { STICKER_CATALOG, getOwnedStickerCount } from "@/lib/rewards/stickerEngine";
import { useLocalStars } from "@/hooks/useLocalStars";
import { useSyncExternalStore } from "react";

function useMounted() {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}

export default function StickersPage() {
  const router = useRouter();
  const mounted = useMounted();
  const stars = useLocalStars();
  const owned = mounted ? getOwnedStickerCount(stars) : 0;
  const nextAt = (Math.floor(stars / 5) + 1) * 5;
  const starsToNext = nextAt - stars;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => router.push("/")} aria-label="Back to home"
          className="bg-white/25 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl font-black hover:bg-white/40 transition flex-shrink-0">←</button>
        <h1 className="text-white font-black text-xl flex-1">My Stickers! 🌟</h1>
        <div className="bg-white/25 rounded-full px-3 py-1.5 flex items-center gap-1">
          <span className="text-lg">⭐</span>
          <span className="text-white font-black">{mounted ? stars : 0}</span>
        </div>
      </div>

      <div className="px-4 py-6 max-w-md mx-auto flex flex-col gap-5">
        {/* Progress to next sticker */}
        <div className="bg-white rounded-3xl shadow p-5 text-center">
          <p className="text-2xl font-black text-purple-700 mb-1">
            {owned} of {STICKER_CATALOG.length} stickers
          </p>
          {owned < STICKER_CATALOG.length ? (
            <>
              <p className="text-sm text-gray-500 mb-3">
                Earn {starsToNext} more ⭐ to unlock your next sticker!
              </p>
              <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((5 - starsToNext) / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Amazing — you collected them all! 🏆</p>
          )}
        </div>

        {/* Sticker grid */}
        <div className="bg-white rounded-3xl shadow p-5">
          <h2 className="font-bold text-gray-700 mb-4">Your collection</h2>
          <div className="grid grid-cols-4 gap-3">
            {STICKER_CATALOG.map((sticker, i) => {
              const isOwned = i < owned;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", bounce: 0.4 }}
                  className={`aspect-square rounded-2xl flex items-center justify-center text-3xl shadow-sm border-2 ${
                    isOwned
                      ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {isOwned ? (
                    <motion.span
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3 + i * 0.3, repeat: Infinity }}
                    >
                      {sticker}
                    </motion.span>
                  ) : (
                    <span className="text-2xl opacity-20">🔒</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          Play games to earn ⭐ stars and unlock new stickers!
        </p>
      </div>
    </div>
  );
}
