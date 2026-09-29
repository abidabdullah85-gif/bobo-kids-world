import type { Game, Level } from "@/types/game";
import { registerPersonalization, pickWithDiscoveryFallback } from "@/lib/mastery/personalization";

type ColorKey = "red"|"blue"|"yellow"|"green"|"orange"|"purple";
const ITEMS: Record<ColorKey,{emoji:string;label:string}[]> = {
  red:[{emoji:"🍎",label:"apple"},{emoji:"🌹",label:"rose"},{emoji:"🎈",label:"balloon"}],
  blue:[{emoji:"🫐",label:"blueberry"},{emoji:"💙",label:"heart"},{emoji:"🔵",label:"circle"}],
  yellow:[{emoji:"🌟",label:"star"},{emoji:"🍋",label:"lemon"},{emoji:"🌻",label:"sunflower"}],
  green:[{emoji:"🍀",label:"clover"},{emoji:"🥦",label:"broccoli"},{emoji:"🐸",label:"frog"}],
  orange:[{emoji:"🍊",label:"orange"},{emoji:"🥕",label:"carrot"},{emoji:"🎃",label:"pumpkin"}],
  purple:[{emoji:"🍇",label:"grapes"},{emoji:"🔮",label:"crystal"},{emoji:"💜",label:"heart"}],
};
const ALL_COLORS: ColorKey[] = ["red","blue","yellow","green","orange","purple"];

function pickDistractors(target:ColorKey,count:number):ColorKey[]{
  return ALL_COLORS.filter(c=>c!==target).sort(()=>Math.random()-0.5).slice(0,count);
}

// Colour swatch emojis for the target display reference
const COLOR_SWATCH: Record<ColorKey, string> = {
  red:"🔴", blue:"🔵", yellow:"🟡", green:"🟢", orange:"🟠", purple:"🟣",
};

function colorLevel(targetColor:ColorKey,count:number,difficulty:1|2|3):Level{
  const item=ITEMS[targetColor][0];
  const distractors=pickDistractors(targetColor,count-1).map(c=>ITEMS[c][0]);
  return{difficulty,questions:[{id:`ch-${targetColor}-${difficulty}`,
    prompt:{en:`Find something ${targetColor}!`},audioPrompt:{en:`Find something ${targetColor}! Which one is ${targetColor}?`},skillUnit:targetColor,
    targetDisplay:{label:`${COLOR_SWATCH[targetColor]} ${targetColor.charAt(0).toUpperCase()+targetColor.slice(1)}`,displayMode:"colour-swatch"},
    options:[{id:`ch-correct`,label:{en:item.label},emoji:item.emoji,isCorrect:true},
      ...distractors.map((d,i)=>({id:`ch-d${i}`,label:{en:d.label},emoji:d.emoji,isCorrect:false}))
    ].sort(()=>Math.random()-0.5)}]};
}

const colorHunt:Game={
  slug:"color-hunt",title:"Color Hunt",ageRange:[3,4],pillar:"colors_shapes",skill:"color-recognition",
  template:"choice",progressionType:"progressive",difficulty:1,estimatedDurationMin:3,
  learningObjective:"Identify objects by color",
  instructions:{en:"Tap the thing that matches Bobo's color!"},
  levels:[colorLevel("red",3,1),colorLevel("blue",4,2),colorLevel("yellow",5,3)],
  reward:{stars:3,badgeKey:"color-hunt-star"},
};
registerPersonalization("color-hunt",{
  skill:"color-recognition",eligibleUnits:["red","yellow","orange","purple","green","blue"],
  buildLevel:(unit)=>colorLevel(unit as ColorKey,3,1),
  pickTarget:pickWithDiscoveryFallback,
});
export default colorHunt;
