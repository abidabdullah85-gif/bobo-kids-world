"use client";
import { motion } from "framer-motion";

interface Props { stars: number; max?: number; size?: "sm"|"md"|"lg"; }

export default function StarBar({ stars, max=3, size="md" }: Props) {
  const sizes = { sm:"text-lg", md:"text-2xl", lg:"text-4xl" };
  return (
    <div className="flex items-center gap-1" aria-label={`${stars} out of ${max} stars`}>
      {Array.from({length:max}).map((_, i) => (
        <motion.span
          key={i}
          className={sizes[size]}
          initial={{ scale:0.5, opacity:0 }}
          animate={{ scale: i < stars ? [1.3,1] : 1, opacity:1 }}
          transition={{ delay: i * 0.15, duration:0.3 }}
        >
          {i < stars ? "⭐" : "☆"}
        </motion.span>
      ))}
    </div>
  );
}
