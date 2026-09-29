import type { Game, Level, SortQuestion, SortColor } from "@/types/game";
import { registerPersonalization } from "@/lib/mastery/personalization";

const BASKET_META: Record<SortColor,{label:string;emoji:string}> = {
  red:{label:"Red",emoji:"🔴"},blue:{label:"Blue",emoji:"🔵"},
  yellow:{label:"Yellow",emoji:"🟡"},green:{label:"Green",emoji:"🟢"},
};
const COLOR_ITEMS: Record<SortColor,{emoji:string;label:string}[]> = {
  red:[{emoji:"🍎",label:"apple"},{emoji:"🌹",label:"rose"}],
  blue:[{emoji:"🫐",label:"blueberry"},{emoji:"🐋",label:"whale"}],
  yellow:[{emoji:"🌟",label:"star"},{emoji:"🍋",label:"lemon"}],
  green:[{emoji:"🍀",label:"clover"},{emoji:"🐸",label:"frog"}],
};

function sortLevel(colors: SortColor[], difficulty: 1|2|3): Level {
  const items = colors.flatMap((c,ci) =>
    COLOR_ITEMS[c].slice(0,2).map((item,i) => ({
      id:`si-${c}-${i}`, emoji:item.emoji, groupKey:c, label:item.label,
    }))
  );
  const baskets = colors.map(c => ({ key:c, ...BASKET_META[c] }));
  const q: SortQuestion = {
    id:`cs-${colors.join("+")}-${difficulty}`,
    prompt:{en:"Sort the items into the right baskets!"},
    skillUnit:colors.join("+"), items, baskets,
  };
  return { difficulty, questions:[q] };
}

export function buildColorSortLevel(weakColor: SortColor, difficulty: 1): Level {
  const others = (["red","blue","yellow","green"] as SortColor[])
    .filter(c => c !== weakColor);
  const partner = others[Math.floor(Math.random() * others.length)];
  return sortLevel([weakColor, partner], difficulty);
}

const colorSort: Game = {
  slug:"color-sort", title:"Color Sort", ageRange:[3,5], pillar:"colors_shapes", skill:"color-sorting",
  template:"sort", progressionType:"progressive", difficulty:2, estimatedDurationMin:4,
  learningObjective:"Sort objects into color categories simultaneously",
  instructions:{en:"Drag each item to the matching color basket!"},
  levels:[sortLevel(["red","blue"],1), sortLevel(["red","blue","yellow"],2), sortLevel(["red","blue","yellow","green"],3)],
  reward:{stars:3,badgeKey:"color-sort-star"},
};
registerPersonalization("color-sort",{
  skill:"color-sorting", eligibleUnits:["red","blue","yellow","green"],
  buildLevel:(unit) => buildColorSortLevel(unit as SortColor, 1),
});
export default colorSort;
