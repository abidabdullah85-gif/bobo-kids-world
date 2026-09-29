import type { Game, Level } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

interface RoutineVariant { steps:[string,string]; correct:string; distractor:string; }
const ROUTINES: Record<string, RoutineVariant[]> = {
  morning:[
    {steps:["⏰ Wake up","🪥 Brush teeth"],correct:"👕 Get dressed",distractor:"📺 Watch TV"},
    {steps:["⏰ Wake up","👕 Get dressed"],correct:"🍳 Eat breakfast",distractor:"😴 Go back to sleep"},
    {steps:["🪥 Brush teeth","👕 Get dressed"],correct:"🍳 Eat breakfast",distractor:"🧸 Play with toys"},
    {steps:["🍳 Eat breakfast","🎒 Grab your backpack"],correct:"🚪 Head out the door",distractor:"😴 Go back to sleep"},
    {steps:["⏰ Wake up","🧼 Wash your face"],correct:"🪥 Brush teeth",distractor:"🧸 Play with toys"},
  ],
  mealtime:[
    {steps:["🪑 Sit at table","🍽️ Eat"],correct:"🙏 Say thank you",distractor:"🏃 Run around"},
    {steps:["🧼 Wash hands","🪑 Sit at table"],correct:"🍽️ Eat",distractor:"🧸 Play with toys"},
    {steps:["🍽️ Eat","🧻 Wipe mouth"],correct:"🧽 Clean up",distractor:"🏃 Jump around"},
    {steps:["🥣 Get your food","🪑 Sit down"],correct:"🍽️ Eat",distractor:"🎈 Play with balloon"},
    {steps:["🍽️ Eat","🥤 Drink water"],correct:"🧽 Clean up",distractor:"🎈 Play with balloon"},
  ],
  bedtime:[
    {steps:["🛁 Bath time","👕 Put on pajamas"],correct:"📖 Read a story",distractor:"⚽ Play outside"},
    {steps:["🪥 Brush teeth","📖 Read a story"],correct:"😴 Go to sleep",distractor:"📺 Watch TV"},
    {steps:["👕 Put on pajamas","🪥 Brush teeth"],correct:"😴 Go to sleep",distractor:"🧩 Play puzzle"},
    {steps:["🛁 Bath time","🪥 Brush teeth"],correct:"😴 Go to sleep",distractor:"🧩 Play puzzle"},
  ],
};

function buildRoutineLevel(unit: string, difficulty: 1): Level {
  const variants = ROUTINES[unit] ?? ROUTINES.morning;
  const v = variants[Math.floor(Math.random()*variants.length)];
  return{difficulty,questions:[{id:`er-${unit}-${difficulty}`,
    prompt:{en:`What comes next?`},audioPrompt:{en:"What comes next? Tap the right one!"},skillUnit:unit,
    sequenceDisplay:[v.steps[0],v.steps[1],null],
    options:[
      {id:"correct",label:{en:v.correct.split(" ").slice(1).join(" ")},emoji:v.correct.split(" ")[0],isCorrect:true},
      {id:"wrong",label:{en:v.distractor.split(" ").slice(1).join(" ")},emoji:v.distractor.split(" ")[0],isCorrect:false},
    ].sort(()=>Math.random()-0.5)} as any]};
}

const everydayRoutines: Game = {
  slug:"everyday-routines",title:"Everyday Routines",ageRange:[4,5],pillar:"life_skills",skill:"routine-sequencing",
  template:"choice",progressionType:"unit-based",difficulty:2,estimatedDurationMin:4,
  learningObjective:"Understand and sequence daily routines",
  instructions:{en:"What comes next in the routine?"},
  levels:[buildRoutineLevel("morning",1),buildRoutineLevel("mealtime",1),buildRoutineLevel("bedtime",1)],
  reward:{stars:3,badgeKey:"routines-star"},
};
registerPersonalization("everyday-routines",{
  skill:"routine-sequencing",eligibleUnits:["morning","mealtime","bedtime"],
  laterLevelUnits:["mealtime","bedtime"],
  buildLevel:(unit)=>buildRoutineLevel(unit,1),
});
export default everydayRoutines;
