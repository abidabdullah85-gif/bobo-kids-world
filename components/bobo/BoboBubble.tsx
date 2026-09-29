"use client";
import { motion, AnimatePresence } from "framer-motion";
import Bobo, { BoboExpression, BoboPose } from "./Bobo";

interface Props {
  text: string;
  expression?: BoboExpression | "laughing" | "encouraging" | "confused";
  pose?: BoboPose;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  visible?: boolean;
}

const BUBBLE_COLORS: Record<string, string> = {
  neutral:     "bg-gray-50 border-gray-200",
  happy:       "bg-yellow-50 border-yellow-300",
  excited:     "bg-orange-50 border-orange-300",
  celebrating: "bg-pink-50 border-pink-300",
  thinking:    "bg-blue-50 border-blue-300",
  curious:     "bg-purple-50 border-purple-300",
  surprised:   "bg-yellow-50 border-amber-300",
  sad:         "bg-blue-50 border-blue-200",
  worried:     "bg-blue-50 border-blue-200",
  proud:       "bg-green-50 border-green-300",
  greeting:    "bg-amber-50 border-amber-300",
  encouraging: "bg-green-50 border-green-300",
  laughing:    "bg-orange-50 border-orange-300",
  confused:    "bg-blue-50 border-blue-300",
};

export default function BoboBubble({
  text,
  expression = "happy",
  pose,
  size = "md",
  className = "",
  visible = true,
}: Props) {
  const bubbleColor = BUBBLE_COLORS[expression] ?? "bg-white border-yellow-200";
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
          className={`flex items-end gap-3 ${className}`}
        >
          <Bobo expression={expression as BoboExpression} pose={pose} size={size} />
          <div className={`relative rounded-3xl rounded-bl-none px-5 py-3 shadow-lg max-w-xs border-2 ${bubbleColor}`}>
            <p className="text-gray-700 font-bold text-base leading-snug">{text}</p>
            <div
              className={`absolute -bottom-3 left-5 w-5 h-5 border-b-2 border-l-2 rotate-45 translate-y-[-2px] ${bubbleColor}`}
              style={{ background: "inherit" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
