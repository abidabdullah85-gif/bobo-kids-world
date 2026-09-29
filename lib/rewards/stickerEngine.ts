"use client";
const STORAGE_KEY = "bobo-kids-world:sticker-celebration-v1";
const STARS_PER_STICKER = 5;
export const STICKER_CATALOG = ["🌟","🦋","🐢","🌈","🍄","🐳","🦁","🌻","🐝","🦕","🍭","🐬","🦉","🌙","🐨","🍓","🦜","⭐","🐙","🌵","🦩","🍉","🐧","🌸"];
let _last = -1;
function readCount():number{if(typeof window==="undefined")return 0;try{return parseInt(localStorage.getItem(STORAGE_KEY)??"0",10)||0;}catch{return 0;}}
export function getOwnedStickerCount(totalStars:number){return Math.min(Math.floor(totalStars/STARS_PER_STICKER),STICKER_CATALOG.length);}
export function getUnrevealedSticker(totalStars:number):string|null{
  const owned=getOwnedStickerCount(totalStars); const celebrated=readCount();
  if(owned>celebrated)return STICKER_CATALOG[celebrated]??null; return null;
}
export function markStickersCelebrated(count:number){
  if(typeof window==="undefined")return;
  try{localStorage.setItem(STORAGE_KEY,String(count));}catch{}
}
