import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";
const ANIMALS=[{emoji:"🐥",name:"chick"},{emoji:"🐠",name:"fish"},{emoji:"🐛",name:"caterpillar"}];
function countLevel(count:number,range:[number,number],distractorCount:number,difficulty:1|2|3,animalIdx=0):Level{
  const {emoji,name}=ANIMALS[animalIdx%ANIMALS.length];
  const all=Array.from({length:range[1]-range[0]+1},(_,i)=>i+range[0]).filter(n=>n!==count);
  const ds=all.sort(()=>Math.random()-0.5).slice(0,distractorCount);
  return{difficulty,questions:[{id:`ca-${count}-${difficulty}`,prompt:{en:`How many ${name}s?`},audioPrompt:{en:`Count the ${name}s! How many are there?`},skillUnit:String(count),
    itemDisplay:{emoji,count,srLabel:`${count} ${name}s`},numeric:true,
    options:[count,...ds].sort(()=>Math.random()-0.5).map(n=>({id:String(n),label:{en:String(n)},emoji:String(n),isCorrect:n===count}))}]};
}
const countTheAnimals:Game={
  slug:"count-the-animals",title:"Count the Animals",ageRange:[3,5],pillar:"math",skill:"counting-with-objects",
  template:"choice",progressionType:"progressive",difficulty:1,estimatedDurationMin:3,
  learningObjective:"Count objects and match to a numeral",
  instructions:{en:"Count the animals and tap the right number!"},
  levels:[countLevel(3,[1,5],2,1,0),countLevel(5,[1,7],3,2,1),countLevel(7,[3,10],3,3,2)],
  reward:{stars:3,badgeKey:"count-animals-star"},
};
registerPersonalization("count-the-animals",{
  skill:"counting-with-objects",eligibleUnits:["1","2","3","4","5","6","7"],
  buildLevel:(unit)=>countLevel(parseInt(unit),[1,7],2,1),
  pickTarget:pickWithDiscoveryFallback,
});
export default countTheAnimals;
