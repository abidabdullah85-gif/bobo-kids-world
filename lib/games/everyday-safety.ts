import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

interface SafetyVariant { safe:string; unsafe:string; }
const SCENARIOS: Record<string, SafetyVariant[]> = {
  hot:[
    {safe:"🍦 Ice cream",unsafe:"🔥 Stove burner"},
    {safe:"🧊 Ice cube",unsafe:"☕ Hot coffee"},
    {safe:"🍨 Cold dessert",unsafe:"🍲 Hot soup"},
    {safe:"🥤 Cold drink",unsafe:"🍳 Hot frying pan"},
    {safe:"🧊 Ice pack",unsafe:"🕯️ Candle flame"},
  ],
  sharp:[
    {safe:"🧸 Teddy bear",unsafe:"✂️ Scissors"},
    {safe:"🧣 Soft scarf",unsafe:"🔪 Kitchen knife"},
    {safe:"🪀 Toy yo-yo",unsafe:"📌 Thumbtack"},
    {safe:"🧣 Soft scarf",unsafe:"🪒 Razor"},
    {safe:"🎈 Balloon",unsafe:"🪡 Sewing needle"},
  ],
  street:[
    {safe:"🤝 Holding a grown-up's hand",unsafe:"🏃 Running alone into traffic"},
    {safe:"🚦 Waiting for the green light",unsafe:"📱 Looking at phone while crossing"},
    {safe:"👀 Looking both ways first",unsafe:"🛹 Skateboarding into the street"},
    {safe:"🚶 Walking with a grown-up",unsafe:"🏃 Crossing alone"},
    {safe:"🤝 Holding a hand at the crossing",unsafe:"🛴 Scooting alone on the road"},
  ],
};

function buildSafetyLevel(unit: string, difficulty: 1): Level {
  const variants = SCENARIOS[unit] ?? SCENARIOS.hot;
  const v = variants[Math.floor(Math.random()*variants.length)];
  return{difficulty,questions:[{id:`es-${unit}-${difficulty}`,
    prompt:{en:"Which one is safe?"},audioPrompt:{en:"Which one is safe? Tap the safe one!"},skillUnit:unit,
    options:[
      {id:"safe",label:{en:v.safe.split(" ").slice(1).join(" ")},emoji:v.safe.split(" ")[0],isCorrect:true},
      {id:"unsafe",label:{en:v.unsafe.split(" ").slice(1).join(" ")},emoji:v.unsafe.split(" ")[0],isCorrect:false},
    ].sort(()=>Math.random()-0.5)}]};
}

const everydaySafety: Game = {
  slug:"everyday-safety",title:"Everyday Safety",ageRange:[4,5],pillar:"life_skills",skill:"safety-awareness",
  template:"choice",progressionType:"unit-based",difficulty:2,estimatedDurationMin:4,
  learningObjective:"Identify safe vs unsafe choices in everyday situations",
  instructions:{en:"Tap the safe choice!"},
  levels:[buildSafetyLevel("hot",1),buildSafetyLevel("sharp",1),buildSafetyLevel("street",1)],
  reward:{stars:3,badgeKey:"safety-star"},
};
registerPersonalization("everyday-safety",{
  skill:"safety-awareness",eligibleUnits:["hot","sharp","street"],
  laterLevelUnits:["sharp","street"],
  buildLevel:(unit)=>buildSafetyLevel(unit,1),
});
export default everydaySafety;
