"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Game, Level, GameCompletionSummary } from "@/types/game";
import type { PersonalizedLevelResult } from "@/types/game";
import Bobo from "@/components/bobo/Bobo";
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

// Per-pillar colour system
const PILLAR_HEADER: Record<string, string> = {
  literacy:      "from-emerald-500 to-green-600",
  math:          "from-sky-500 to-blue-600",
  colors_shapes: "from-pink-500 to-rose-600",
  logic:         "from-violet-500 to-purple-600",
  life_skills:   "from-orange-500 to-amber-600",
  world:         "from-teal-500 to-cyan-600",
};
const PILLAR_BG: Record<string, string> = {
  literacy:      "from-emerald-50 via-green-50 to-teal-50",
  math:          "from-sky-50 via-blue-50 to-indigo-50",
  colors_shapes: "from-pink-50 via-rose-50 to-fuchsia-50",
  logic:         "from-violet-50 via-purple-50 to-indigo-50",
  life_skills:   "from-orange-50 via-amber-50 to-yellow-50",
  world:         "from-teal-50 via-cyan-50 to-sky-50",
};
const PILLAR_ICON: Record<string, string> = {
  literacy:"📚", math:"🔢", colors_shapes:"🌈", logic:"🧩", life_skills:"🏠", world:"🌍",
};

// Celebration confetti items
const CONFETTI = ["⭐","🌟","✨","💫","🎉","🎊","🌈","❤️","🎈","🍭"];

interface Props {
  game: Game;
  personalizedLevel?: PersonalizedLevelResult | null;
  onComplete: (summary: GameCompletionSummary) => void;
  onBack: () => void;
}

export default function GameScreen({ game, personalizedLevel, onComplete, onBack }: Props) {
  const level: Level = personalizedLevel?.level ?? game.levels[0];
  const questions = level.questions;
  const [qIdx, setQIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [correctCount, setCorrectCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [boboText, setBoboText] = useState("");
  const [boboExpression, setBoboExpression] = useState<"greeting"|"curious"|"thinking"|"celebrating"|"proud"|"encouraging">("greeting");
  const [showConfetti, setShowConfetti] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const [starPop, setStarPop] = useState(false);
  const startTime = useRef(Date.now());
  const currentQ = questions[qIdx];
  const bgGradient = PILLAR_BG[game.pillar] ?? "from-amber-50 to-orange-50";
  const headerGradient = PILLAR_HEADER[game.pillar] ?? "from-teal-500 to-cyan-600";

  const [muted, setMuted] = useState(() => typeof window !== "undefined" ? isMuted() : false);
  const handleToggleMute = useCallback(() => { toggleMuted(); setMuted(m => !m); }, []);

  const skipIntro = useCallback(() => { if (phase === "intro") setPhase("playing"); }, [phase]);

  // ── Update Bobo prompt per question ──────────────────────────────────────
  useEffect(() => {
    if (phase === "playing" && currentQ) {
      const cq = currentQ as ChoiceQuestion;
      const displayText = cq.prompt?.en ?? "";
      const spokenText = cq.audioPrompt?.en ?? displayText;
      if (displayText) {
        setBoboText(displayText);
        setBoboExpression("curious");
        if (!wrongAttempt) {
          cancelBoboVoice();
          setTimeout(() => playBoboVoice(spokenText), 80);
        }
      }
    }
  }, [qIdx, phase]);

  // ── Intro ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    recordGameOpened(game.slug);
    const text = personalizedLevel
      ? getPersonalizedIntroLine(personalizedLevel.skill, personalizedLevel.unit, personalizedLevel.mode)
      : getIntroLine(game.pillar, game.skill);
    setBoboText(text);
    setBoboExpression("greeting");
    playBoboVoice(text);
    const t = setTimeout(() => setPhase("playing"), 1200);
    return () => { clearTimeout(t); cancelBoboVoice(); };
  }, []);

  // ── Answer handler ────────────────────────────────────────────────────────
  const handleAnswer = useCallback((correct: boolean, firstTry: boolean) => {
    const unit = (currentQ as ChoiceQuestion).skillUnit ?? "";
    recordSkillAttempt(game.skill, unit, firstTry && correct);

    if (correct) {
      const msg = getCorrectMessage(game.skill, unit);
      setBoboText(msg);
      setBoboExpression("celebrating");
      cancelBoboVoice();
      setTimeout(() => playBoboVoice(msg), 80);
      setPhase("correct");
      setWrongAttempt(false);
      setShowConfetti(true);
      setStarPop(true);
      setTimeout(() => { setShowConfetti(false); setStarPop(false); }, 1600);

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
      setBoboExpression("encouraging");
      cancelBoboVoice();
      setTimeout(() => playBoboVoice(msg), 80);
      setWrongAttempt(true);
    }
  }, [qIdx, questions.length, game, currentQ, correctCount, firstTryCount]);

  function finishGame(ftc: number, cc: number) {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const ratio = cc / questions.length;
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
    const msg = getCompletionLine(game.skill, ratio);
    setBoboText(msg);
    setBoboExpression("proud");
    cancelBoboVoice();
    setTimeout(() => playBoboVoice(msg), 80);
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

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col relative overflow-hidden`}>

      {/* ── Confetti burst on correct ── */}
      <AnimatePresence>
        {showConfetti && CONFETTI.map((e, i) => (
          <motion.div key={i} className="fixed text-3xl pointer-events-none z-50 select-none"
            initial={{ x: "50vw", y: "45vh", scale: 0, opacity: 1 }}
            animate={{ x: `${8 + i * 8.5}vw`, y: `${5 + (i % 4) * 18}vh`, scale: [0, 1.4, 1], opacity: [1, 1, 0], rotate: i * 45 }}
            transition={{ duration: 1.3, ease: "easeOut" }}>
            {e}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── Star pop +⭐ ── */}
      <AnimatePresence>
        {starPop && (
          <motion.div className="fixed top-1/3 left-1/2 z-50 pointer-events-none select-none"
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -80, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}>
            <span className="text-4xl font-black text-yellow-400" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>+⭐</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <div className={`bg-gradient-to-r ${headerGradient} shadow-lg`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button onClick={onBack} aria-label="Back to home"
            className="bg-white/25 text-white font-black rounded-full w-12 h-12 flex items-center justify-center text-xl hover:bg-white/40 active:scale-90 transition shadow-md">
            ←
          </button>
          <div className="flex flex-col items-center">
            <h1 className="font-black text-white text-base leading-tight" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.2)" }}>
              {game.title}
            </h1>
          </div>
          <button onClick={handleToggleMute} aria-label={muted ? "Unmute" : "Mute"}
            className="bg-white/25 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl hover:bg-white/40 active:scale-90 transition shadow-md">
            {muted ? "🔇" : "🔊"}
          </button>
        </div>

        {/* Progress bar + dots */}
        {questions.length > 1 && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: questions.length }).map((_, i) => (
                <motion.div key={i}
                  className={`rounded-full border-2 border-white/60 transition-all ${
                    i < qIdx ? "bg-white w-4 h-4" :
                    i === qIdx && phase !== "intro" ? "bg-white/70 w-5 h-5" : "bg-white/25 w-3 h-3"
                  }`}
                  animate={i === qIdx && phase === "playing" ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}/>
              ))}
              <span className="text-white/80 text-xs font-black ml-1">{Math.min(qIdx+1, questions.length)}/{questions.length}</span>
            </div>
            <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
              <motion.div className="h-full bg-white rounded-full shadow"
                animate={{ width: `${(qIdx / questions.length) * 100}%` }}
                transition={{ duration: 0.5 }}/>
            </div>
          </div>
        )}
      </div>

      {/* ── BOBO + SPEECH BUBBLE ── */}
      <div className="px-4 pt-4 pb-2 flex items-end gap-3 max-w-lg mx-auto w-full">
        {/* Bobo reacts to phase */}
        <motion.div
          animate={phase === "correct" ? { y: [0, -12, 0], rotate: [0, -8, 8, 0] } : { y: [0, -4, 0] }}
          transition={phase === "correct"
            ? { duration: 0.6, repeat: 2 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }}>
          <Bobo
            expression={
              phase === "correct"  ? "celebrating" :
              phase === "complete" ? "proud"       :
              phase === "intro"    ? "greeting"    :
              wrongAttempt         ? "thinking"    : "curious"
            }
            pose={
              phase === "correct"  ? "celebrating"  :
              phase === "complete" ? "encouraging"  :
              phase === "intro"    ? "waving"       :
              wrongAttempt         ? "encouraging"  : "thinking"
            }
            size="md"
          />
        </motion.div>

        {/* Speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div key={boboText}
            initial={{ opacity: 0, x: 12, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.25, type: "spring", bounce: 0.4 }}
            className={`relative rounded-3xl rounded-bl-none px-4 py-3 shadow-lg border-2 flex-1 max-w-[220px] ${
              phase === "correct"  ? "bg-green-50 border-green-300"  :
              wrongAttempt         ? "bg-blue-50 border-blue-300"    :
              phase === "intro"    ? "bg-amber-50 border-amber-300"  :
                                     "bg-white border-gray-200"
            }`}>
            <p className="text-gray-700 font-bold text-sm leading-snug">{boboText}</p>
            <div className="absolute -bottom-3 left-4 w-5 h-5 border-b-2 border-l-2 rotate-45 translate-y-[-2px]"
              style={{ background: "inherit", borderColor: "inherit" }}/>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── GAME CONTENT ── */}
      <div className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro"
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5 pt-6 cursor-pointer select-none"
              onClick={skipIntro} aria-label="Tap to start">
              <motion.div className="text-9xl" animate={{ y: [0,-18,0], rotate:[-5,5,-5] }} transition={{ duration: 1.3, repeat: Infinity }}>
                {PILLAR_ICON[game.pillar] ?? "🌟"}
              </motion.div>
              <p className="text-3xl font-black text-gray-700 text-center">{game.title}</p>
              <p className="text-base font-bold text-gray-400 text-center max-w-xs">{game.instructions.en}</p>
              <motion.div
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-2 bg-teal-500 text-white font-black text-lg px-8 py-3 rounded-full shadow-lg">
                Tap to start! 👆
              </motion.div>
            </motion.div>
          )}

          {(phase === "playing" || phase === "correct") && (
            <motion.div key={`q-${qIdx}`}
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", bounce: 0.3 }}>
              {renderTemplate()}
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div key="complete"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center gap-5 py-6">
              <motion.div className="text-9xl"
                animate={{ rotate: [0,15,-15,0], scale: [1,1.2,1] }}
                transition={{ duration: 0.8, repeat: 3 }}>🏆</motion.div>
              <div className="flex gap-3">
                {Array.from({ length: Math.max(1, correctCount >= questions.length * 0.9 ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1) }).map((_, i) => (
                  <motion.span key={i} className="text-6xl"
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
