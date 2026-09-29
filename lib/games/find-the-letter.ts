import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function findLevel(target: string, correctCount: number, distractors: string[], difficulty: 1|2|3): Level {
  const opts = [...Array(correctCount).fill(target).map((l,i)=>({id:`${l}-${i}`,label:{en:l},emoji:l,isCorrect:true})),
    ...distractors.map((l,i)=>({id:`d-${l}-${i}`,label:{en:l},emoji:l,isCorrect:false}))].sort(()=>Math.random()-0.5);
  return { difficulty, questions:[{id:`fl-${target}-${difficulty}`,prompt:{en:`Find all the ${target}s! (there are ${correctCount}) 👆`},audioPrompt:{en:`Find all the ${target}s! There are ${correctCount} ${target}s. Tap every one!`},skillUnit:target,options:opts,multiSelect:true,totalCorrect:correctCount}] };
}
const findTheLetter: Game = {
  slug:"find-the-letter",title:"Find the Letter",
  ageRange:[4,5],pillar:"literacy",skill:"visual-letter-scanning",
  template:"choice",progressionType:"progressive",
  difficulty:2,estimatedDurationMin:4,
  learningObjective:"Scan and identify all matching letters in a set",
  instructions:{en:"Tap every letter that matches!"},
  levels:[
    findLevel("A",2,["B","H"],1),
    findLevel("T",3,["I","L","F","J"],2),
    findLevel("O",3,["Q","C","G","D","P"],3),
  ],
  reward:{stars:3,badgeKey:"find-letter-star"},
};
registerPersonalization("find-the-letter",{
  skill:"visual-letter-scanning",eligibleUnits:LETTERS,
  buildLevel:(unit)=>findLevel(unit,2,LETTERS.filter(l=>l!==unit).sort(()=>Math.random()-0.5).slice(0,3),1),
  pickTarget:pickWithDiscoveryFallback,
});
export default findTheLetter;
