import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";
import type { ShapeKey } from "@/types/game";

const ALL_SHAPES: ShapeKey[] = ["circle","square","triangle","rectangle","oval"];
const SHAPE_NAMES: Record<ShapeKey,string> = {circle:"circle",square:"square",triangle:"triangle",rectangle:"rectangle",oval:"oval"};

function shapeLevel(target: ShapeKey, distractors: ShapeKey[], difficulty: 1|2|3): Level {
  return{difficulty,questions:[{id:`sb-${target}-${difficulty}`,
    prompt:{en:`Find the ${SHAPE_NAMES[target]}!`},audioPrompt:{en:`Can you find the ${SHAPE_NAMES[target]}? Tap it!`},skillUnit:target,
    targetDisplay:{label:SHAPE_NAMES[target],shapeKey:target},
    options:[target,...distractors].sort(()=>Math.random()-0.5).map(s=>({
      id:s,label:{en:SHAPE_NAMES[s]},shapeKey:s,isCorrect:s===target,
    }))}]};
}

function sampleShapes(exclude: ShapeKey, count: number): ShapeKey[] {
  return ALL_SHAPES.filter(s=>s!==exclude).sort(()=>Math.random()-0.5).slice(0,count);
}

const shapeBuilder: Game = {
  slug:"shape-builder",title:"Shape Match",ageRange:[3,5],pillar:"colors_shapes",skill:"shape-recognition",
  template:"choice",progressionType:"progressive",difficulty:1,estimatedDurationMin:3,
  learningObjective:"Name and match basic 2D shapes",
  instructions:{en:"Tap the shape Bobo is showing!"},
  levels:[shapeLevel("circle",sampleShapes("circle",2),1),shapeLevel("triangle",sampleShapes("triangle",3),2),shapeLevel("rectangle",sampleShapes("rectangle",3),3)],
  reward:{stars:3,badgeKey:"shape-match-star"},
};
registerPersonalization("shape-builder",{
  skill:"shape-recognition",eligibleUnits:["circle","square","triangle","oval"],
  buildLevel:(unit)=>shapeLevel(unit as ShapeKey,sampleShapes(unit as ShapeKey,2),1),
  pickTarget:pickWithDiscoveryFallback,
});
export default shapeBuilder;
