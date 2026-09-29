import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";
function numLevel(target:number,range:[number,number],distractorCount:number,difficulty:1|2|3):Level{
  const all=Array.from({length:range[1]-range[0]+1},(_,i)=>i+range[0]).filter(n=>n!==target);
  const distractors=all.sort(()=>Math.random()-0.5).slice(0,distractorCount);
  return{difficulty,questions:[{id:`np-${target}-${difficulty}`,prompt:{en:`Find the number ${target}!`},audioPrompt:{en:`Find the number ${target}!`},skillUnit:String(target),numeric:true,
    options:[target,...distractors].sort(()=>Math.random()-0.5).map(n=>({id:String(n),label:{en:String(n)},emoji:String(n),isCorrect:n===target}))}]};
}
const numberPop:Game={
  slug:"number-pop",title:"Number Pop",ageRange:[3,5],pillar:"math",skill:"numeral-recognition-1-10",
  template:"choice",progressionType:"progressive",difficulty:1,estimatedDurationMin:3,
  learningObjective:"Recognise numeral symbols 1–10",
  instructions:{en:"Tap the number Bobo asks for!"},
  levels:[numLevel(3,[1,5],2,1),numLevel(7,[1,10],3,2),numLevel(9,[1,10],4,3)],
  reward:{stars:3,badgeKey:"number-pop-star"},
};
registerPersonalization("number-pop",{
  skill:"numeral-recognition-1-10",eligibleUnits:["1","2","3","4","5","6","7","8","9","10"],
  buildLevel:(unit)=>numLevel(parseInt(unit),[1,10],2,1),
  pickTarget:pickWithDiscoveryFallback,
});
export default numberPop;
