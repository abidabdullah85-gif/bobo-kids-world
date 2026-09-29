import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

const PAIRS = [
  {a:2,b:6,emoji:"🍎"},{a:3,b:7,emoji:"🌟"},{a:4,b:9,emoji:"🐸"},
  {a:1,b:5,emoji:"🍪"},{a:3,b:8,emoji:"🎈"},
];

function buildQuantityLevel(unit:"more"|"fewer"|"equal",difficulty:1):Level {
  const pair = PAIRS[Math.floor(Math.random()*PAIRS.length)];
  if(unit==="equal"){
    const n=pair.a;
    return{difficulty,questions:[{id:`mf-equal-${n}`,prompt:{en:"Which group has the SAME amount? 🟰"},audioPrompt:{en:"Which group has the same amount?"},skillUnit:"equal",
      itemDisplay:{emoji:pair.emoji,count:n,srLabel:`${n} ${pair.emoji}`},
      options:[
        {id:"correct",label:{en:`${n}`},isCorrect:true,itemDisplay:{emoji:pair.emoji,count:n,srLabel:`${n} items`}},
        {id:"wrong",label:{en:`${n+3}`},isCorrect:false,itemDisplay:{emoji:pair.emoji,count:n+3,srLabel:`${n+3} items`}},
      ].sort(()=>Math.random()-0.5)} as any]};
  }
  const askMore=unit==="more";
  const correctN=askMore?pair.b:pair.a;
  const wrongN=askMore?pair.a:pair.b;
  return{difficulty,questions:[{id:`mf-${unit}-${pair.a}-${pair.b}`,
    prompt:{en: askMore ? "Which group has MORE? ⬆️" : "Which group has FEWER? ⬇️"},audioPrompt:{en: askMore ? "Which group has more?" : "Which group has fewer?"},skillUnit:unit,
    options:[
      {id:"correct",label:{en:`${correctN}`},isCorrect:true,itemDisplay:{emoji:pair.emoji,count:correctN,srLabel:`${correctN} ${pair.emoji}`}},
      {id:"wrong",label:{en:`${wrongN}`},isCorrect:false,itemDisplay:{emoji:pair.emoji,count:wrongN,srLabel:`${wrongN} ${pair.emoji}`}},
    ].sort(()=>Math.random()-0.5)} as any]};
}

const moreOrFewer:Game={
  slug:"more-or-fewer",title:"More or Fewer",ageRange:[3,5],pillar:"math",skill:"quantity-comparison",
  template:"choice",progressionType:"unit-based",difficulty:2,estimatedDurationMin:4,
  learningObjective:"Compare groups using more, fewer, and equal",
  instructions:{en:"Tap the group with more or fewer!"},
  levels:[
    buildQuantityLevel("more",1),
    buildQuantityLevel("fewer",1),
    buildQuantityLevel("equal",1),
  ],
  reward:{stars:3,badgeKey:"more-fewer-star"},
};
registerPersonalization("more-or-fewer",{
  skill:"quantity-comparison",eligibleUnits:["more","fewer","equal"],
  laterLevelUnits:["fewer","equal"],
  buildLevel:(unit)=>buildQuantityLevel(unit as any,1),
});
export default moreOrFewer;
