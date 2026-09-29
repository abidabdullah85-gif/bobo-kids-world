"use client";
import { motion, useReducedMotion } from "framer-motion";

// ── Official expression + pose types ─────────────────────────────────────────
export type BoboExpression =
  | "neutral" | "happy" | "excited" | "curious" | "thinking"
  | "surprised" | "sad" | "worried" | "proud" | "celebrating" | "greeting";
// NOTE: "sad" and "worried" are reserved for story/context screens only.
// Do NOT use them as error/wrong-answer feedback during gameplay.

export type BoboPose =
  | "standing" | "waving" | "pointing" | "thinking" | "celebrating" | "encouraging";

type LegacyExpression = "laughing" | "encouraging" | "confused";
type AnyExpression = BoboExpression | LegacyExpression;

interface Props {
  expression?: AnyExpression;
  pose?: BoboPose;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

// ── OFFICIAL BRAND PALETTE — from master reference sheet ────────────────────
const C = {
  // Fur colours
  fur:        "#8B5E3C",   // Warm Brown — main body fur
  furMid:     "#7A5030",   // slightly darker — ear inner ring, shadow
  furLight:   "#A0724E",   // lighter areas — top of head highlight

  // Face / muzzle
  cream:      "#F5E6CA",   // Cream — muzzle, tummy, inner ears
  creamDark:  "#E8D0A0",   // slightly deeper cream for inner ear

  // Features
  eyeDark:    "#2C1506",   // Dark Brown — eyes, nose, eyebrows, outlines
  noseFill:   "#3D1F08",   // very dark brown nose

  // Outfit — teal dungarees
  teal:       "#3DBFBF",   // Teal Blue — dungaree body
  tealDark:   "#2A9898",   // dungaree shadow / straps
  tealLight:  "#5DD5D5",   // dungaree highlight

  // Outfit — yellow shirt
  yellow:     "#F5C842",   // Warm Yellow — shirt
  yellowDark: "#D4A020",   // shirt shadow

  // Star badge
  star:       "#F0B429",   // Golden Yellow — star on dungarees
  starDark:   "#C8860A",   // star outline

  // Misc
  white:      "#FFFFFF",
  shadow:     "rgba(0,0,0,0.10)",
};

// ── Normalise legacy expression names ────────────────────────────────────────
function normalizeExpr(e: AnyExpression): BoboExpression {
  if (e === "laughing")    return "excited";
  if (e === "encouraging") return "happy";
  if (e === "confused")    return "thinking";
  return e as BoboExpression;
}

// ── Auto-derive pose from expression ─────────────────────────────────────────
function derivePose(expr: BoboExpression, explicit?: BoboPose): BoboPose {
  if (explicit) return explicit;
  if (expr === "celebrating" || expr === "excited") return "celebrating";
  if (expr === "greeting")                          return "waving";
  if (expr === "thinking"   || expr === "curious")  return "thinking";
  if (expr === "proud")                             return "encouraging";
  return "standing";
}

// ── SVG sub-components ────────────────────────────────────────────────────────

/** Eyebrows — expression-driven */
function Brows({ expr }: { expr: BoboExpression }) {
  // Worried/sad: inner corners raised (sad brows)
  if (expr === "sad" || expr === "worried") return (
    <g>
      <path d="M 33 33 Q 38 30 42 33" stroke={C.eyeDark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M 58 33 Q 62 30 67 33" stroke={C.eyeDark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </g>
  );
  // Thinking / curious: one brow raised
  if (expr === "thinking" || expr === "curious") return (
    <g>
      <path d="M 32 33 Q 37 29 43 32" stroke={C.eyeDark} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M 57 32 Q 62 28 68 31" stroke={C.eyeDark} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </g>
  );
  // Surprised: raised high
  if (expr === "surprised") return (
    <g>
      <path d="M 31 30 Q 37 26 43 29" stroke={C.eyeDark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M 57 29 Q 63 25 69 28" stroke={C.eyeDark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    </g>
  );
  // Default neutral/happy brows
  return (
    <g>
      <path d="M 32 35 Q 37 32 43 34" stroke={C.eyeDark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      <path d="M 57 34 Q 62 31 68 33" stroke={C.eyeDark} strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </g>
  );
}

/** Eyes — large, round, expressive as per reference */
function Eyes({ expr }: { expr: BoboExpression }) {
  const r = expr === "surprised" ? 7 : 5.5;

  // Happy/celebrating/proud/greeting: squinting (crescent arcs)
  if (expr === "happy" || expr === "excited" || expr === "celebrating" || expr === "proud" || expr === "greeting") {
    return (
      <g>
        {/* Left eye — closed happy arc */}
        <path d="M 32 40 Q 37 36 43 40" stroke={C.eyeDark} strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* Right eye */}
        <path d="M 57 40 Q 62 36 68 40" stroke={C.eyeDark} strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* Cheek highlights for happy */}
        <ellipse cx="30" cy="46" rx="6" ry="3.5" fill="#E8927C" opacity="0.45"/>
        <ellipse cx="70" cy="46" rx="6" ry="3.5" fill="#E8927C" opacity="0.45"/>
      </g>
    );
  }

  // Sad: droopy eyes with tear
  if (expr === "sad") {
    return (
      <g>
        <circle cx="37" cy="41" r={r} fill={C.eyeDark}/>
        <circle cx="63" cy="41" r={r} fill={C.eyeDark}/>
        {/* Cream highlight */}
        <circle cx="39.5" cy="38.5" r="2.2" fill={C.white}/>
        <circle cx="65.5" cy="38.5" r="2.2" fill={C.white}/>
        <circle cx="38.5" cy="42" r="1" fill={C.white}/>
        <circle cx="64.5" cy="42" r="1" fill={C.white}/>
        {/* Tear */}
        <motion.path d="M 35 46 Q 34 50 36 54" stroke="#90CAF9" strokeWidth="2.5" fill="none" strokeLinecap="round"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}/>
      </g>
    );
  }

  // Standard round eyes (neutral, thinking, surprised, worried, curious)
  return (
    <g>
      <circle cx="37" cy="41" r={r} fill={C.eyeDark}/>
      <circle cx="63" cy="41" r={r} fill={C.eyeDark}/>
      {/* Main cream highlight dot — upper-left of eye as per reference */}
      <circle cx="39.5" cy={expr === "surprised" ? 37 : 38.5} r="2.2" fill={C.white}/>
      <circle cx="65.5" cy={expr === "surprised" ? 37 : 38.5} r="2.2" fill={C.white}/>
      {/* Small secondary highlight */}
      <circle cx="38.5" cy="43" r="1" fill={C.white}/>
      <circle cx="64.5" cy="43" r="1" fill={C.white}/>
      {/* Rosy cheeks — always present except sad */}
      {expr !== "surprised" && (
        <>
          <ellipse cx="30" cy="47" rx="6" ry="3.5" fill="#E8927C" opacity="0.40"/>
          <ellipse cx="70" cy="47" rx="6" ry="3.5" fill="#E8927C" opacity="0.40"/>
        </>
      )}
    </g>
  );
}

/** Mouth — per expression */
function Mouth({ expr }: { expr: BoboExpression }) {
  if (expr === "surprised") return (
    // Open oval mouth
    <ellipse cx="50" cy="58" rx="5.5" ry="6" fill={C.eyeDark}/>
  );
  if (expr === "sad") return (
    <path d="M 41 59 Q 50 54 59 59" stroke={C.eyeDark} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  );
  if (expr === "worried") return (
    <path d="M 42 58 Q 50 54 58 58" stroke={C.eyeDark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
  );
  if (expr === "thinking" || expr === "curious" || expr === "neutral") return (
    <path d="M 43 57 Q 50 60 57 57" stroke={C.eyeDark} strokeWidth="2.2" fill="none" strokeLinecap="round"/>
  );
  // Happy / excited / celebrating / proud / greeting
  return (
    <g>
      <path d="M 40 55 Q 50 65 60 55" stroke={C.eyeDark} strokeWidth="2.8" fill="none" strokeLinecap="round"/>
      {(expr === "excited" || expr === "celebrating") && (
        // Teeth showing
        <path d="M 41 56 Q 50 64 59 56 L 59 59 Q 50 65 41 59 Z" fill={C.white}/>
      )}
    </g>
  );
}

/** Arms — per pose, reference style: rounded plump arms */
function Arms({ pose, expr }: { pose: BoboPose; expr: BoboExpression }) {

  if (pose === "celebrating" || expr === "celebrating" || expr === "excited") {
    return (
      <g>
        {/* Left arm raised — fist up */}
        <motion.g style={{ transformOrigin: "27px 76px" }}
          animate={{ rotate: [-15, 10, -15] }}
          transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}>
          <path d="M 27 76 Q 14 62 15 48" stroke={C.fur} strokeWidth="16" fill="none" strokeLinecap="round"/>
          <circle cx="15" cy="47" r="9" fill={C.fur}/>
          <circle cx="15" cy="47" r="6" fill={C.furMid}/>
        </motion.g>
        {/* Right arm raised — fist up */}
        <motion.g style={{ transformOrigin: "73px 76px" }}
          animate={{ rotate: [15, -10, 15] }}
          transition={{ repeat: Infinity, duration: 0.65, ease: "easeInOut" }}>
          <path d="M 73 76 Q 86 62 85 48" stroke={C.fur} strokeWidth="16" fill="none" strokeLinecap="round"/>
          <circle cx="85" cy="47" r="9" fill={C.fur}/>
          <circle cx="85" cy="47" r="6" fill={C.furMid}/>
        </motion.g>
      </g>
    );
  }

  if (pose === "waving") {
    return (
      <g>
        {/* Left arm — relaxed at side */}
        <path d="M 27 78 Q 18 86 16 94" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="16" cy="94" r="8" fill={C.fur}/>
        {/* Right arm — waving up */}
        <motion.g style={{ transformOrigin: "73px 74px" }}
          animate={{ rotate: [0, -30, 0] }}
          transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}>
          <path d="M 73 74 Q 84 60 86 48" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
          <circle cx="86" cy="47" r="9" fill={C.fur}/>
          <circle cx="86" cy="47" r="5.5" fill={C.cream}/>
        </motion.g>
      </g>
    );
  }

  if (pose === "thinking") {
    return (
      <g>
        {/* Left arm relaxed */}
        <path d="M 27 78 Q 18 86 16 94" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="16" cy="94" r="8" fill={C.fur}/>
        {/* Right arm — raised to chin (thinking gesture) */}
        <path d="M 73 76 Q 76 64 68 56" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="67" cy="55" r="8" fill={C.fur}/>
        <circle cx="67" cy="55" r="5" fill={C.cream}/>
      </g>
    );
  }

  if (pose === "encouraging") {
    return (
      <g>
        {/* Both arms slightly out and up — thumbs up / open arms */}
        <path d="M 27 76 Q 14 70 11 62" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="11" cy="61" r="9" fill={C.fur}/>
        <circle cx="11" cy="61" r="5.5" fill={C.cream}/>
        <path d="M 73 76 Q 86 70 89 62" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="89" cy="61" r="9" fill={C.fur}/>
        <circle cx="89" cy="61" r="5.5" fill={C.cream}/>
      </g>
    );
  }

  if (pose === "pointing") {
    return (
      <g>
        {/* Left arm relaxed */}
        <path d="M 27 78 Q 18 86 16 94" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="16" cy="94" r="8" fill={C.fur}/>
        {/* Right arm pointing */}
        <path d="M 73 76 Q 86 72 96 68" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
        <circle cx="96" cy="67" r="8" fill={C.fur}/>
        <circle cx="96" cy="67" r="4.5" fill={C.cream}/>
      </g>
    );
  }

  // Default standing — arms relaxed at sides (reference default pose)
  return (
    <g>
      <path d="M 27 78 Q 18 86 16 94" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
      <circle cx="16" cy="94" r="8" fill={C.fur}/>
      <path d="M 73 78 Q 82 86 84 94" stroke={C.fur} strokeWidth="15" fill="none" strokeLinecap="round"/>
      <circle cx="84" cy="94" r="8" fill={C.fur}/>
    </g>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function Bobo({
  expression: rawExpr = "happy",
  pose: rawPose,
  size = "md",
  className = "",
}: Props) {
  const expr  = normalizeExpr(rawExpr as AnyExpression);
  const pose  = derivePose(expr, rawPose);
  const prefersReduced = useReducedMotion();

  const sizes = { xs: 64, sm: 88, md: 128, lg: 172, xl: 216 };
  const s = sizes[size];

  const isActive = expr === "excited" || expr === "celebrating";
  const isSad    = expr === "sad" || expr === "worried";

  return (
    <motion.div
      className={`inline-block select-none ${className}`}
      animate={
        prefersReduced ? {} :
        isActive  ? { y: [0, -10, 0], rotate: [-2, 2, -2, 0] } :
        isSad     ? { y: [0, -3, 0] } :
                    { y: [0, -6, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: isActive ? 0.55 : isSad ? 3.5 : 2.4,
        ease: "easeInOut",
      }}
      aria-label={`Bobo the bear, ${expr}`}
      role="img"
    >
      <svg
        width={s}
        height={Math.round(s * 1.18)}
        viewBox="0 0 100 118"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        {/* ── Ground shadow ── */}
        <ellipse cx="50" cy="117" rx="30" ry="5" fill={C.shadow}/>

        {/* ── Ears (behind head) ── */}
        <circle cx="22" cy="26" r="14" fill={C.fur}/>
        <circle cx="78" cy="26" r="14" fill={C.fur}/>
        {/* Inner ear ring */}
        <circle cx="22" cy="26" r="8.5" fill={C.furMid}/>
        <circle cx="78" cy="26" r="8.5" fill={C.furMid}/>
        {/* Inner ear cream */}
        <circle cx="22" cy="26" r="5" fill={C.creamDark}/>
        <circle cx="78" cy="26" r="5" fill={C.creamDark}/>

        {/* ── Legs (behind body) ── */}
        <rect x="30" y="100" width="16" height="18" rx="8" fill={C.teal}/>
        <rect x="54" y="100" width="16" height="18" rx="8" fill={C.teal}/>
        {/* Feet — small dark brown ovals */}
        <ellipse cx="38" cy="116" rx="9" ry="5" fill={C.furMid}/>
        <ellipse cx="62" cy="116" rx="9" ry="5" fill={C.furMid}/>

        {/* ── Body — dungaree base ── */}
        <rect x="22" y="75" width="56" height="42" rx="20" fill={C.teal}/>

        {/* ── Yellow shirt (visible above and under dungarees) ── */}
        <ellipse cx="50" cy="75" rx="24" ry="10" fill={C.yellow}/>
        {/* Shirt collar V */}
        <path d="M 42 72 L 50 78 L 58 72" stroke={C.yellowDark} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        {/* Shirt side bits visible */}
        <rect x="22" y="74" width="8" height="18" rx="4" fill={C.yellow}/>
        <rect x="70" y="74" width="8" height="18" rx="4" fill={C.yellow}/>

        {/* ── Dungaree straps ── */}
        <rect x="37" y="68" width="8" height="20" rx="4" fill={C.tealDark}/>
        <rect x="55" y="68" width="8" height="20" rx="4" fill={C.tealDark}/>
        {/* Strap buttons */}
        <circle cx="41" cy="70" r="3" fill={C.star}/>
        <circle cx="41" cy="70" r="1.5" fill={C.starDark}/>
        <circle cx="59" cy="70" r="3" fill={C.star}/>
        <circle cx="59" cy="70" r="1.5" fill={C.starDark}/>

        {/* ── Star badge on dungaree bib ── */}
        <polygon
          points="50,79 52.5,85 59,85 53.8,89 55.9,95.5 50,91.5 44.1,95.5 46.2,89 41,85 47.5,85"
          fill={C.star} stroke={C.starDark} strokeWidth="0.8"
        />

        {/* ── Dungaree pocket ── */}
        <rect x="40" y="88" width="20" height="14" rx="4" fill={C.tealDark} opacity="0.25"/>

        {/* ── Arms (drawn before head so head overlaps) ── */}
        <Arms pose={pose} expr={expr}/>

        {/* ── Head ── */}
        <circle cx="50" cy="38" r="32" fill={C.fur}/>
        {/* Head subtle top highlight */}
        <ellipse cx="44" cy="20" rx="12" ry="8" fill={C.furLight} opacity="0.25"/>

        {/* ── Muzzle / snout ── */}
        <ellipse cx="50" cy="54" rx="17" ry="13" fill={C.cream}/>

        {/* ── Eyebrows ── */}
        <Brows expr={expr}/>

        {/* ── Eyes ── */}
        <Eyes expr={expr}/>

        {/* ── Nose ── */}
        <ellipse cx="50" cy="50" rx="5" ry="3.8" fill={C.noseFill}/>
        {/* Nose highlight */}
        <ellipse cx="48.5" cy="49" rx="1.6" ry="1" fill="rgba(255,255,255,0.3)"/>

        {/* ── Mouth ── */}
        <Mouth expr={expr}/>

        {/* ── Thinking bubble ── */}
        {(expr === "thinking" || expr === "curious") && (
          <g>
            <circle cx="76" cy="20" r="3"   fill={C.white} opacity="0.75"/>
            <circle cx="83" cy="13" r="4.5" fill={C.white} opacity="0.75"/>
            <circle cx="92" cy="6"  r="6"   fill={C.white} opacity="0.75"/>
          </g>
        )}

        {/* ── Proud star sparkle ── */}
        {expr === "proud" && (
          <motion.text x="80" y="28" fontSize="13" textAnchor="middle"
            animate={{ scale: [1, 1.25, 1], rotate: [-5, 10, -5] }}
            transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}>
            ⭐
          </motion.text>
        )}

        {/* ── Celebrating sparkles ── */}
        {(expr === "celebrating" || expr === "excited") && (
          <>
            <motion.text x="5"  y="20" fontSize="11"
              animate={{ opacity: [0,1,0], y: [20,6,-2] }}
              transition={{ repeat: Infinity, duration: 0.85 }}>✨</motion.text>
            <motion.text x="82" y="20" fontSize="11"
              animate={{ opacity: [0,1,0], y: [20,6,-2] }}
              transition={{ repeat: Infinity, duration: 0.85, delay: 0.28 }}>🌟</motion.text>
            <motion.text x="43" y="6" fontSize="9"
              animate={{ opacity: [0,1,0], y: [6,-2,-8] }}
              transition={{ repeat: Infinity, duration: 0.85, delay: 0.14 }}>⭐</motion.text>
          </>
        )}
      </svg>
    </motion.div>
  );
}
