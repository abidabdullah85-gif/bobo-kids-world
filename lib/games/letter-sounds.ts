import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";

interface LetterSoundEntry { letter:string; sound:string; targetWord:string; targetEmoji:string; distractors:[{word:string;emoji:string},{word:string;emoji:string}]; }

export const LETTER_SOUNDS: LetterSoundEntry[] = [
  {letter:"B",sound:"buh",targetWord:"Ball",targetEmoji:"⚽",distractors:[{word:"Sun",emoji:"☀️"},{word:"Cat",emoji:"🐱"}]},
  {letter:"M",sound:"mmm",targetWord:"Moon",targetEmoji:"🌙",distractors:[{word:"Dog",emoji:"🐶"},{word:"Fish",emoji:"🐟"}]},
  {letter:"S",sound:"sss",targetWord:"Sun",targetEmoji:"☀️",distractors:[{word:"Ball",emoji:"⚽"},{word:"Hat",emoji:"🎩"}]},
  {letter:"T",sound:"tuh",targetWord:"Turtle",targetEmoji:"🐢",distractors:[{word:"Rabbit",emoji:"🐰"},{word:"Moon",emoji:"🌙"}]},
  {letter:"D",sound:"duh",targetWord:"Dog",targetEmoji:"🐶",distractors:[{word:"Cat",emoji:"🐱"},{word:"Sun",emoji:"☀️"}]},
  {letter:"F",sound:"fff",targetWord:"Fish",targetEmoji:"🐟",distractors:[{word:"Dog",emoji:"🐶"},{word:"Hat",emoji:"🎩"}]},
  {letter:"H",sound:"huh",targetWord:"Hat",targetEmoji:"🎩",distractors:[{word:"Fish",emoji:"🐟"},{word:"Ball",emoji:"⚽"}]},
  {letter:"L",sound:"lll",targetWord:"Lion",targetEmoji:"🦁",distractors:[{word:"Turtle",emoji:"🐢"},{word:"Moon",emoji:"🌙"}]},
  {letter:"N",sound:"nnn",targetWord:"Nose",targetEmoji:"👃",distractors:[{word:"Lion",emoji:"🦁"},{word:"Dog",emoji:"🐶"}]},
  {letter:"P",sound:"puh",targetWord:"Pig",targetEmoji:"🐷",distractors:[{word:"Nose",emoji:"👃"},{word:"Fish",emoji:"🐟"}]},
  {letter:"R",sound:"rrr",targetWord:"Rabbit",targetEmoji:"🐰",distractors:[{word:"Pig",emoji:"🐷"},{word:"Cat",emoji:"🐱"}]},
  {letter:"C",sound:"kuh",targetWord:"Cat",targetEmoji:"🐱",distractors:[{word:"Rabbit",emoji:"🐰"},{word:"Sun",emoji:"☀️"}]},
];

export const LETTER_SOUND_UNITS = LETTER_SOUNDS.map(e => e.letter);

export function buildLetterSoundsLevel(letter: string, difficulty: 1): Level {
  const entry = LETTER_SOUNDS.find(e => e.letter === letter) ?? LETTER_SOUNDS[0];
  return {
    difficulty,
    questions: [{
      id: `ls-${letter}-${difficulty}`,
      prompt: { en: `${entry.letter} says "${entry.sound}"! 👂` },
      audioPrompt: { en: `This is ${letter}. It says ${entry.sound} — like in ${entry.targetWord}!` },
      skillUnit: letter,
      options: [
        { id: `ls-correct-${letter}`, label: { en: entry.targetWord }, emoji: entry.targetEmoji, isCorrect: true },
        { id: `ls-d1-${letter}`, label: { en: entry.distractors[0].word }, emoji: entry.distractors[0].emoji, isCorrect: false },
        { id: `ls-d2-${letter}`, label: { en: entry.distractors[1].word }, emoji: entry.distractors[1].emoji, isCorrect: false },
      ].sort(() => Math.random() - 0.5),
    }],
  };
}

const letterSounds: Game = {
  slug:"letter-sounds",title:"Letter Sounds",
  ageRange:[3,5],pillar:"literacy",skill:"beginning-sound-recognition",
  template:"choice",progressionType:"unit-based",
  difficulty:2,estimatedDurationMin:3,
  learningObjective:"Match letters to their beginning sounds (phonics)",
  instructions:{en:"Which picture starts with Bobo's sound?"},
  levels:[
    buildLetterSoundsLevel("B",1),
    buildLetterSoundsLevel("M",1),
    buildLetterSoundsLevel("S",1),
  ],
  reward:{stars:3,badgeKey:"letter-sounds-star"},
};
registerPersonalization("letter-sounds",{
  skill:"beginning-sound-recognition",
  eligibleUnits:LETTER_SOUND_UNITS,
  laterLevelUnits:["M","S"],
  buildLevel:(unit)=>buildLetterSoundsLevel(unit,1),
  pickTarget:pickWithDiscoveryFallback,
});
export default letterSounds;
