import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

const COLORS = ["🔴","🔵","🟡","🟢","🟠","🟣"];

function buildPatternLevel(unit: "ab"|"aab"|"abc", difficulty: 1): Level {
  const [a,b,c] = COLORS.sort(()=>Math.random()-0.5);
  let sequence: string[], answer: string, distractor: string;
  if(unit==="ab"){ sequence=[a,b,a,b]; answer=a; distractor=b; }
  else if(unit==="aab"){ sequence=[a,a,b,a]; answer=a; distractor=b; }
  else { sequence=[a,b,c,a]; answer=b; distractor=c; }
  const seq=[...sequence,null];
  return{difficulty,questions:[{id:`wcn-${unit}-${difficulty}`,
    prompt:{en:"What comes next?"},skillUnit:unit,sequenceDisplay:seq,
    options:[
      {id:"correct",label:{en:answer},emoji:answer,isCorrect:true},
      {id:"wrong",label:{en:distractor},emoji:distractor,isCorrect:false},
    ].sort(()=>Math.random()-0.5)} as any]};
}

const whatComesNext: Game = {
  slug:"what-comes-next",title:"What Comes Next?",ageRange:[3,5],pillar:"logic",skill:"pattern-sequencing",
  template:"choice",progressionType:"progressive",difficulty:2,estimatedDurationMin:4,
  learningObjective:"Identify and extend repeating colour/shape patterns",
  instructions:{en:"Tap what comes next in the pattern!"},
  levels:[buildPatternLevel("ab",1),buildPatternLevel("aab",1),buildPatternLevel("abc",1)],
  reward:{stars:3,badgeKey:"pattern-star"},
};
registerPersonalization("what-comes-next",{
  skill:"pattern-sequencing",eligibleUnits:["ab","aab","abc"],
  laterLevelUnits:["aab","abc"],
  buildLevel:(unit)=>buildPatternLevel(unit as any,1),
});
export default whatComesNext;
