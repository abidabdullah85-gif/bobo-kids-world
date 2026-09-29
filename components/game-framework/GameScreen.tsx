"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Game, Level, GameCompletionSummary } from "@/types/game";
import type { PersonalizedLevelResult } from "@/types/game";
import BoboBubble from "@/components/bobo/BoboBubble";
import ChoiceTemplate from "./templates/ChoiceTemplate";
import DragCountTemplate from "./templates/DragCountTemplate";
import SortTemplate from "./templates/SortTemplate";
import { recordSkillAttempt } from "@/lib/mastery/masteryEngine";
import { recordGameCompletion, recordGameOpened } from "@/lib/rewards/rewardEngine";
import { recordDailyActivity } from "@/lib/dailyAdventure/dailyLog";
import { getIntroLine, getPersonalizedIntroLine, getCorrectMessage, getRetryMessage, getCompletionLine } from "@/lib/dialogue/boboDialogue";
import { playBoboVoice, cancelBoboVoice, toggleMuted, isMuted } from "@/lib/audio/AudioManager";
import type { ChoiceQuestion, SortQuestion, DragCountQuestion } from "@/types/game";

type Phase = "intro"|"playing"|"correct"|"complete";

const PILLAR_BG: Record<string, string> = {
  literacy:      "from-emerald-100 via-green-50 to-teal-50",
  math:          "from-sky-100 via-blue-50 to-indigo-50",
  colors_shapes: "from-pink-100 via-rose-50 to-fuchsia-50",
  logic:         "from-violet-100 via-purple-50 to-indigo-50",
  life_skills:   "from-orange-100 via-amber-50 to-yellow-50",
  world:         "from-teal-100 via-cyan-50 to-sky-50",
};
const PILLAR_ACCENT: Record<string, string> = {
  literacy:      "from-emerald-400 to-green-500",
  math:          "from-sky-400 to-blue-500",
  colors_shapes: "from-pink-400 to-rose-500",
  logic:         "from-violet-400 to-purple-500",
  life_skills:   "from-orange-400 to-amber-500",
  world:         "from-teal-400 to-cyan-500",
};
const PILLAR_ICON: Record<string, string> = {
  literacy: "📚", math: "🔢", colors_shapes: "🌈", logic: "🧩", life_skills: "🏠", world: "🌍",
};

interface Props {
  game: Game;
  personalizedLevel?: PersonalizedLevelResult | null;
  onComplete: (summary: GameCompletionSummary) => void;
  onBack: () => void;
}

// Star burst particles on correct answer
const STAR_BURST = ["⭐","🌟","✨","💫","🎉","🎊","⭐","✨","🌟","💫"];

export default function GameScreen({ game, personalizedLevel, onComplete, onBack }: Props) {
  const level: Level = personalizedLevel?.level ?? game.levels[0];
  const questions = level.questions;
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [correctCount, setCorrectCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [boboText, setBoboText] = useState("");
  const [showBurst, setShowBurst] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const startTime = useRef(Date.now());
  const currentQ = questions[qIdx];
  const bgGradient = PILLAR_BG[game.pillar] ?? "from-amber-100 to-orange-50";
  const accentGradient = PILLAR_ACCENT[game.pillar] ?? "from-amber-400 to-orange-400";

  const [muted, setMuted] = useState(() => typeof window !== "undefined" ? isMuted() : false);
  const handleToggleMute = useCallback(() => { toggleMuted(); setMuted(m => !m); }, []);
  const skipIntro = useCallback(() => { if (phase === "intro") setPhase("playing"); }, [phase]);

  // Show current question prompt in Bobo bubble — update on every question change
  useEffect(() => {
    if (phase === "playing" && currentQ) {
      const cq = currentQ as ChoiceQuestion;
      const displayText = cq.prompt?.en ?? "";
      const spokenText = cq.audioPrompt?.en ?? displayText;
      if (displayText) {
        setBoboText(displayText);
        if (!wrongAttempt) {
          cancelBoboVoice();
          setTimeout(() => playBoboVoice(spokenText), 80);
        }
      }
    }
  }, [qIdx, phase]);

  useEffect(() => {
    recordGameOpened(game.slug);
    const text = personalizedLevel
      ? getPersonalizedIntroLine(personalizedLevel.skill, personalizedLevel.unit, personalizedLevel.mode)
      : getIntroLine(game.pillar, game.skill);
    setBoboText(text);
    playBoboVoice(text);
    const t = setTimeout(() => setPhase("playing"), 1200);
    return () => { clearTimeout(t); cancelBoboVoice(); };
  }, []);

  const handleAnswer = useCallback((correct: boolean, firstTry: boolean) => {
    const unit = (currentQ as ChoiceQuestion).skillUnit ?? "";
    recordSkillAttempt(game.skill, unit, firstTry && correct);

    if (correct) {
      const msg = getCorrectMessage(game.skill, unit);
      setBoboText(msg);
      playBoboVoice(msg);
      setPhase("correct");
      setWrongAttempt(false);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 1600);
      const newCorrect = correctCount + 1;
      const newFTC = firstTryCount + (firstTry ? 1 : 0);
      setCorrectCount(newCorrect);
      if (firstTry) setFirstTryCount(newFTC);

      setTimeout(() => {
        if (qIdx + 1 < questions.length) {
          setQIdx(i => i + 1);
          setWrongAttempt(false);
          setPhase("playing");
        } else {
          finishGame(newFTC, newCorrect);
        }
      }, 1400);
    } else {
      const msg = getRetryMessage(game.skill, unit);
      setBoboText(msg);
      playBoboVoice(msg);
      setWrongAttempt(true);
    }
  }, [qIdx, questions.length, game, currentQ, correctCount, firstTryCount]);

  function finishGame(ftc: number, cc: number) {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const ratio = cc / questions.length;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    const msg = getCompletionLine(game.skill, ratio);
    setBoboText(msg);
    playBoboVoice(msg);
    setPhase("complete");
    const awarded = recordGameCompletion(game.slug, stars, ftc, questions.length);
    recordDailyActivity(game.slug, elapsed, awarded);
    const summary: GameCompletionSummary = {
      slug: game.slug, stars: awarded, correctFirstTry: ftc,
      totalQuestions: questions.length, timeSpentSec: elapsed,
      score: cc, maxScore: questions.length, accuracy: ratio, completed: true,
    };
    setTimeout(() => onComplete(summary), 1400);
  }

  function renderTemplate() {
    if (!currentQ) return null;
    if (game.template === "choice")
      return <ChoiceTemplate question={currentQ as ChoiceQuestion} onAnswer={handleAnswer} skill={game.skill}/>;
    if (game.template === "drag_count")
      return <DragCountTemplate question={currentQ as DragCountQuestion} onAnswer={handleAnswer}/>;
    if (game.template === "sort")
      return <SortTemplate question={currentQ as SortQuestion} onAnswer={handleAnswer}/>;
    return null;
  }

  const totalStars = correctCount >= questions.length * 0.9 ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col relative overflow-hidden`}>

      {/* Star burst on correct answer */}
      <AnimatePresence>
        {showBurst && STAR_BURST.map((e, i) => (
          <motion.div key={i} className="fixed text-3xl pointer-events-none z-50 select-none"
            initial={{ x: "50vw", y: "40vh", scale: 0, opacity: 1 }}
            animate={{
              x: `${8 + i * 8.5}vw`,
              y: `${5 + (i % 4) * 18}vh`,
              scale: [0, 1.4, 0.8],
              opacity: [1, 1, 0],
              rotate: i * 36,
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}>
            {e}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className={`bg-gradient-to-r ${accentGradient} px-3 pt-3 pb-2 shadow-lg flex-shrink-0`}>
        <div className="flex items-center justify-between mb-2">
          {/* Back button — always visible, large */}
          <motion.button onClick={onBack} aria-label="Back to home" whileTap={{ scale: 0.9 }}
            className="bg-white/30 text-white font-black rounded-2xl h-11 px-4 flex items-center gap-1.5 text-base hover:bg-white/45 transition border-2 border-white/30">
            ← <span className="text-sm font-black">Home</span>
          </motion.button>

          {/* Game title */}
          <p className="font-black text-white text-base" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.15)" }}>
            {PILLAR_ICON[game.pillar] ?? "🎮"} {game.title}
          </p>

          {/* Mute — always visible */}
          <motion.button onClick={handleToggleMute} aria-label={muted ? "Unmute" : "Mute"} whileTap={{ scale: 0.9 }}
            className="bg-white/30 text-white rounded-2xl w-11 h-11 flex items-center justify-center text-xl hover:bg-white/45 transition border-2 border-white/30">
            {muted ? "🔇" : "🔊"}
          </motion.button>
        </div>

        {/* Progress — stars earned so far + question dots */}
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: questions.length }).map((_, i) => (
            <motion.div key={i}
              className={`rounded-full border-2 border-white/60 flex items-center justify-center
                ${i < qIdx ? "w-8 h-8 bg-white text-sm" : i === qIdx && phase !== "intro" ? "w-8 h-8 bg-white/60 text-sm" : "w-6 h-6 bg-white/20"}`}
              animate={i === qIdx && phase === "playing" ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.2, repeat: Infinity }}>
              {i < qIdx ? "⭐" : i === qIdx && phase !== "intro" ? "●" : ""}
            </motion.div>
          ))}
          {questions.length > 1 && (
            <span className="text-white/80 text-xs font-black ml-1">{Math.min(qIdx + 1, questions.length)}/{questions.length}</span>
          )}
        </div>
      </div>

      {/* ── BOBO + PROMPT ── */}
      <div className="px-4 pt-3 pb-1 flex-shrink-0">
        <BoboBubble
          text={boboText}
          expression={
            phase === "correct"  ? "celebrating" :
            phase === "complete" ? "proud"       :
            phase === "intro"    ? "greeting"    :
            wrongAttempt         ? "thinking"    : "curious"
          }
          pose={
            phase === "correct"  ? "celebrating" :
            phase === "complete" ? "encouraging" :
            phase === "intro"    ? "waving"      :
            wrongAttempt         ? "encouraging" : "thinking"
          }
          size="md"
        />
      </div>

      {/* ── MAIN GAME AREA ── */}
      <div className="flex-1 px-4 pb-6 overflow-y-auto">
        <AnimatePresence mode="wait">

          {/* INTRO */}
          {phase === "intro" && (
            <motion.div key="intro"
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5 pt-6 cursor-pointer select-none"
              onClick={skipIntro} aria-label="Tap to start">
              <motion.div className="text-9xl"
                animate={{ y: [0, -18, 0], rotate: [-5, 5, -5] }}
                transition={{ duration: 1.4, repeat: Infinity }}>
                {PILLAR_ICON[game.pillar] ?? "🎮"}
              </motion.div>
              <p className="text-3xl font-black text-gray-700 text-center">{game.title}</p>
              <p className="text-base font-bold text-gray-500 text-center max-w-xs">{game.instructions.en}</p>
              <motion.div
                className="mt-2 bg-teal-500 text-white font-black text-lg rounded-full px-8 py-3 shadow-lg"
                animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                Tap to Start! 👆
              </motion.div>
            </motion.div>
          )}

          {/* PLAYING / CORRECT */}
          {(phase === "playing" || phase === "correct") && (
            <motion.div key={`q-${qIdx}`}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", bounce: 0.3 }}>
              {renderTemplate()}
            </motion.div>
          )}

          {/* COMPLETE */}
          {phase === "complete" && (
            <motion.div key="complete"
              initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 py-8">
              <motion.div className="text-8xl"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: 3 }}>🏆</motion.div>
              <div className="flex gap-3">
                {Array.from({ length: totalStars }).map((_, i) => (
                  <motion.span key={i} className="text-5xl"
                    initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.2, type: "spring", bounce: 0.7 }}>⭐</motion.span>
                ))}
              </div>
              <p className="text-2xl font-black text-gray-700 text-center">{boboText}</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
