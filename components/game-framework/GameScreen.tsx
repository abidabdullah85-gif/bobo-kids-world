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
  literacy:      "from-emerald-50 via-green-50 to-teal-50",
  math:          "from-sky-50 via-blue-50 to-indigo-50",
  colors_shapes: "from-pink-50 via-rose-50 to-fuchsia-50",
  logic:         "from-violet-50 via-purple-50 to-indigo-50",
  life_skills:   "from-orange-50 via-amber-50 to-yellow-50",
  world:         "from-teal-50 via-cyan-50 to-sky-50",
};
const PILLAR_ACCENT: Record<string, string> = {
  literacy:      "from-emerald-400 to-green-500",
  math:          "from-sky-400 to-blue-500",
  colors_shapes: "from-pink-400 to-rose-500",
  logic:         "from-violet-400 to-purple-500",
  life_skills:   "from-orange-400 to-amber-500",
  world:         "from-teal-400 to-cyan-500",
};

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
  const [showConfetti, setShowConfetti] = useState(false);
  // Tracks whether the last answer was wrong so Bobo can show an encouraging face
  const [wrongAttempt, setWrongAttempt] = useState(false);
  const startTime = useRef(Date.now());
  const currentQ = questions[qIdx];
  const bgGradient = PILLAR_BG[game.pillar] ?? "from-amber-50 to-orange-50";
  const accentGradient = PILLAR_ACCENT[game.pillar] ?? "from-amber-400 to-orange-400";

  const [muted, setMuted] = useState(() => typeof window !== "undefined" ? isMuted() : false);

  const handleToggleMute = useCallback(() => {
    toggleMuted();
    setMuted(m => !m);
  }, []);
  const skipIntro = useCallback(() => {
    if (phase === "intro") setPhase("playing");
  }, [phase]);

  // Update Bobo's bubble text to show the current question prompt during playing
  useEffect(() => {
    if (phase === "playing" && currentQ) {
      const cq = currentQ as ChoiceQuestion;
      const displayText = cq.prompt?.en ?? "";
      // audioPrompt carries richer spoken text (e.g. "This is B. It says buh — like in Ball!")
      // Fall back to display prompt if no audioPrompt defined
      const spokenText = cq.audioPrompt?.en ?? displayText;
      if (displayText) {
        setBoboText(displayText);
        if (!wrongAttempt) {
          cancelBoboVoice();
          // Small delay ensures intro voice is fully cancelled before question voice starts
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
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
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
      }, 1300);
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
    if (game.template === "choice") {
      return <ChoiceTemplate question={currentQ as ChoiceQuestion} onAnswer={handleAnswer} skill={game.skill}/>;
    }
    if (game.template === "drag_count") {
      // Use actual question data — not reconstructed from skillUnit
      const dq = currentQ as DragCountQuestion;
      return <DragCountTemplate question={dq} onAnswer={handleAnswer}/>;
    }
    if (game.template === "sort") {
      return <SortTemplate question={currentQ as SortQuestion} onAnswer={handleAnswer}/>;
    }
    return null;
  }

  const CONFETTI = ["⭐","🌟","✨","💫","🎉","🎊","🌈","❤️","🎈"];
  const progress = (qIdx / questions.length) * 100;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient} flex flex-col relative overflow-hidden`}>
      <AnimatePresence>
        {showConfetti && CONFETTI.map((e, i) => (
          <motion.div key={i} className="fixed text-3xl pointer-events-none z-50"
            initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
            animate={{ x: `${10 + i * 9}vw`, y: `${10 + (i % 3) * 20}vh`, scale: 1, opacity: 0, rotate: i * 40 }}
            transition={{ duration: 1.2, ease: "easeOut" }}>
            {e}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className={`bg-gradient-to-r ${accentGradient} px-4 pt-4 pb-3 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <button onClick={onBack} aria-label="Back" className="bg-white/25 text-white font-black rounded-full w-11 h-11 flex items-center justify-center text-xl hover:bg-white/40 transition">←</button>
          <h1 className="font-black text-white text-lg" style={{ textShadow: "1px 2px 0 rgba(0,0,0,0.15)" }}>{game.title}</h1>
          <button onClick={handleToggleMute} aria-label={muted ? "Unmute" : "Mute"}
            className="bg-white/25 text-white rounded-full w-11 h-11 flex items-center justify-center text-xl hover:bg-white/40 transition">
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: questions.length }).map((_, i) => (
            <motion.div key={i} className={`w-3 h-3 rounded-full border-2 border-white/60 ${i < qIdx ? "bg-white" : i === qIdx && phase !== "intro" ? "bg-white/60" : "bg-white/20"}`}
              animate={i === qIdx && phase === "playing" ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}/>
          ))}
        </div>
        <div className="h-3 bg-white/30 rounded-full overflow-hidden">
          <motion.div className="h-full bg-white rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }}/>
        </div>
      </div>

      {/* Bobo */}
      <div className="px-4 pt-4 pb-2">
        <BoboBubble text={boboText}
          expression={
            phase === "correct"   ? "celebrating" :
            phase === "complete"  ? "proud"       :
            phase === "intro"     ? "greeting"    :
            wrongAttempt          ? "thinking"    : "curious"
          }
          pose={
            phase === "correct"   ? "celebrating"  :
            phase === "complete"  ? "encouraging"  :
            phase === "intro"     ? "waving"       :
            wrongAttempt          ? "encouraging"  : "thinking"
          }
          size="sm"/>
      </div>

      {/* Game */}
      <div className="flex-1 px-4 pb-6">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-4 pt-8 cursor-pointer select-none"
              onClick={skipIntro}
              aria-label="Tap to start">
              <motion.div className="text-8xl" animate={{ y: [0, -15, 0], rotate: [-5, 5, -5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                {game.pillar === "literacy" ? "📚" : game.pillar === "math" ? "🔢" : game.pillar === "colors_shapes" ? "🌈" : game.pillar === "logic" ? "🧩" : "🌟"}
              </motion.div>
              <p className="text-2xl font-black text-gray-600 text-center">{game.title}</p>
              <p className="text-base font-bold text-gray-400 text-center">{game.instructions.en}</p>
              <p className="text-sm text-gray-300 font-medium mt-2">Tap to start!</p>
            </motion.div>
          )}
          {(phase === "playing" || phase === "correct") && (
            <motion.div key={`q-${qIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: "spring", bounce: 0.3 }}>
              {renderTemplate()}
            </motion.div>
          )}
          {phase === "complete" && (
            <motion.div key="complete" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 py-8">
              <motion.div className="text-8xl" animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: 3 }}>🏆</motion.div>
              <div className="flex gap-2">
                {Array.from({ length: Math.max(1, correctCount >= questions.length * 0.9 ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1) }).map((_, i) => (
                  <motion.span key={i} className="text-5xl" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: i * 0.2, type: "spring", bounce: 0.7 }}>⭐</motion.span>
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
