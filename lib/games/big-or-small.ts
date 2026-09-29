import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

interface Pair { big:string; small:string; ask:"big"|"small"; }
const BIG_PAIRS: Pair[] = [
  {big:"🐘",small:"🐭",ask:"big"},
  {big:"🐳",small:"🐠",ask:"big"},
  {big:"🦒",small:"🐛",ask:"small"},
  {big:"🚂",small:"🐞",ask:"small"},
  {big:"🐖",small:"🦆",ask:"small"},
];
const LEVEL_2_PAIRS: Pair[] = [
  {big:"🐕",small:"🐈",ask:"small"},
  {big:"🐑",small:"🐇",ask:"small"},
  {big:"🐴",small:"🦆",ask:"big"},
  {big:"🐄",small:"🐔",ask:"small"},
  {big:"🚲",small:"🍎",ask:"big"},
];
const LEVEL_3_TRIOS = [
  {items:["🐜","🐕","🦒"],ask:"biggest",correct:"🦒"},
  {items:["🐞","🐈","🐴"],ask:"biggest",correct:"🐴"},
  {items:["🐭","🐇","🐄"],ask:"smallest",correct:"🐭"},
  {items:["🐤","🐑","🐘"],ask:"biggest",correct:"🐘"},
  {items:["🐜","🐈","🐋"],ask:"smallest",correct:"🐜"},
];

function pairLevel(pair: Pair, difficulty: 1|2|3): Level {
  const correct = pair.ask==="big" ? pair.big : pair.small;
  const wrong = pair.ask==="big" ? pair.small : pair.big;
  return{difficulty,questions:[{id:`bos-${pair.ask}-${difficulty}`,
    prompt:{en:`Which one is ${pair.ask==="big" ? "BIG 🐘" : "small 🐭"}?`},audioPrompt:{en:`Which one is ${pair.ask==="big" ? "bigger" : "smaller"}?`},skillUnit:pair.ask,
    options:[
      {id:"correct",label:{en:pair.ask==="big"?"Big":"Small"},emoji:correct,isCorrect:true,
        emojiScale: (pair.ask==="big" ? "lg" : "sm") as "lg"|"sm"},
      {id:"wrong",label:{en:pair.ask==="big"?"Small":"Big"},emoji:wrong,isCorrect:false,
        emojiScale: (pair.ask==="big" ? "sm" : "lg") as "sm"|"lg"},
    ].sort(()=>Math.random()-0.5)}]};
}

function trioLevel(trio: typeof LEVEL_3_TRIOS[0], difficulty: 1|2|3): Level {
  return{difficulty,questions:[{id:`bos-trio-${difficulty}`,
    prompt:{en:`Which one is the ${trio.ask.toUpperCase()}?`},skillUnit:trio.ask==="biggest"?"big":"small",
    options:trio.items.sort(()=>Math.random()-0.5).map(e=>({
      id:e,label:{en:e},emoji:e,isCorrect:e===trio.correct,
    }))}]};
}

export function buildBigOrSmallLevel(_unit: string, difficulty: 1): Level {
  return pairLevel(BIG_PAIRS[Math.floor(Math.random()*BIG_PAIRS.length)], difficulty);
}

const bigOrSmall: Game = {
  slug:"big-or-small",title:"Big or Small?",ageRange:[3,5],pillar:"logic",skill:"size-comparison",
  template:"choice",progressionType:"progressive",difficulty:1,estimatedDurationMin:3,
  learningObjective:"Compare relative sizes using big, small, bigger, smaller",
  instructions:{en:"Look at them all and choose!"},
  levels:[
    pairLevel(BIG_PAIRS[0],1),
    pairLevel(LEVEL_2_PAIRS[Math.floor(Math.random()*LEVEL_2_PAIRS.length)],2),
    trioLevel(LEVEL_3_TRIOS[Math.floor(Math.random()*LEVEL_3_TRIOS.length)],3),
  ],
  reward:{stars:3,badgeKey:"big-small-star"},
};
registerPersonalization("big-or-small",{
  skill:"size-comparison",eligibleUnits:["big"],
  buildLevel:buildBigOrSmallLevel,
});
export default bigOrSmall;
