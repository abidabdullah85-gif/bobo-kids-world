import type { Game } from "@/types/game";
import letterHunt from "./letter-hunt";
import letterMatch from "./letter-match";
import findTheLetter from "./find-the-letter";
import letterSounds from "./letter-sounds";
import numberPop from "./number-pop";
import countTheAnimals from "./count-the-animals";
import feedBobo from "./feed-bobo";
import moreOrFewer from "./more-or-fewer";
import colorHunt from "./color-hunt";
import colorSort from "./color-sort";
import shapeBuilder from "./shape-builder";
import bigOrSmall from "./big-or-small";
import whatComesNext from "./what-comes-next";
import everydayRoutines from "./everyday-routines";
import everydaySafety from "./everyday-safety";

export const ALL_GAMES: Game[] = [
  letterHunt, letterMatch, findTheLetter, letterSounds,
  numberPop, countTheAnimals, feedBobo, moreOrFewer,
  colorHunt, colorSort, shapeBuilder,
  bigOrSmall, whatComesNext,
  everydayRoutines, everydaySafety,
];

export const GAME_REGISTRY: Record<string, Game> = Object.fromEntries(
  ALL_GAMES.map(g => [g.slug, g])
);

export function getGame(slug: string): Game | undefined {
  return GAME_REGISTRY[slug];
}
