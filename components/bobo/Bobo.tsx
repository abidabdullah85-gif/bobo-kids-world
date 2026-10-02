"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

// ── Types — same public API as before ────────────────────────────────────────
export type BoboExpression =
  | "neutral" | "happy" | "excited" | "curious" | "thinking"
  | "surprised" | "sad" | "worried" | "proud" | "celebrating" | "greeting"
  | "encouraging" | "teaching";

// NOTE: "sad" and "worried" are reserved for story/context screens only.
// Do NOT use them as error/wrong-answer feedback during gameplay.

export type BoboPose =
  | "standing" | "waving" | "pointing" | "thinking" | "celebrating" | "encouraging";

type LegacyExpression = "laughing" | "confused";
type AnyExpression = BoboExpression | LegacyExpression;

interface Props {
  expression?: AnyExpression;
  pose?: BoboPose;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

// ── Normalise legacy names ────────────────────────────────────────────────────
function normalizeExpr(e: AnyExpression): BoboExpression {
  if (e === "laughing") return "excited";
  if (e === "confused") return "thinking";
  return e as BoboExpression;
}

// ── Map expression → approved artwork file ───────────────────────────────────
const EXPR_IMAGE: Record<BoboExpression, string> = {
  happy:       "/bobo/bobo-happy.png",       // standing, open smile
  neutral:     "/bobo/bobo-proud.png",        // calm, confident
  greeting:    "/bobo/bobo-greeting.png",     // waving hello
  encouraging: "/bobo/bobo-greeting.png",     // waving, open smile
  teaching:    "/bobo/bobo-greeting.png",     // gesturing
  excited:     "/bobo/bobo-excited.png",      // jumping, eyes closed joy
  celebrating: "/bobo/bobo-celebrating.png",  // arms up, confetti, wink
  proud:       "/bobo/bobo-celebrating.png",  // arms up, winning pose
  curious:     "/bobo/bobo-thinking.png",     // paw to chin
  thinking:    "/bobo/bobo-thinking.png",     // paw to chin
  surprised:   "/bobo/bobo-surprised.png",    // hands at mouth, wide eyes
  worried:     "/bobo/bobo-surprised.png",    // closest available
  sad:         "/bobo/bobo-sad.png",          // reserved — not used in gameplay
};

// ── Sizes (px) — same as previous component ──────────────────────────────────
const SIZES = { xs: 64, sm: 88, md: 128, lg: 172, xl: 216 };

// ── Component ─────────────────────────────────────────────────────────────────
export default function Bobo({
  expression: rawExpr = "happy",
  pose: _pose,          // accepted for API compatibility; image already shows pose
  size = "md",
  className = "",
}: Props) {
  const expr   = normalizeExpr(rawExpr as AnyExpression);
  const src    = EXPR_IMAGE[expr];
  const px     = SIZES[size];
  const prefersReduced = useReducedMotion();

  const isActive = expr === "excited" || expr === "celebrating";
  const isSad    = expr === "sad"     || expr === "worried";

  return (
    <motion.div
      className={`inline-block select-none ${className}`}
      style={{ width: px, flexShrink: 0 }}
      animate={
        prefersReduced ? {} :
        isActive ? { y: [0, -10, 0], rotate: [-3, 3, -3, 0] } :
        isSad    ? { y: [0, -3,  0] } :
                   { y: [0, -7,  0] }
      }
      transition={
        prefersReduced ? {} :
        isActive ? { duration: 0.55, repeat: Infinity, repeatType: "loop" } :
                   { duration: 3.2,  repeat: Infinity, ease: "easeInOut" }
      }
    >
      <Image
        src={src}
        alt={`Bobo is ${expr}`}
        width={px}
        height={px}
        style={{ width: px, height: "auto", display: "block" }}
        priority={size === "xl" || size === "lg"}
        draggable={false}
      />
    </motion.div>
  );
}
