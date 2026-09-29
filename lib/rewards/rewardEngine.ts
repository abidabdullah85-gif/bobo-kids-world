"use client";
const STORAGE_KEY = "bobo-kids-world:progress-v0";
interface GameRecord { attempts:number; correctFirstTry:number; completions:number; bestStars:number; opens?:number; }
interface RewardStore { totalStars:number; games:Record<string,GameRecord>; }
let _cache:RewardStore|null=null; let _rawCache="";
const listeners=new Set<()=>void>();
function readLocal():RewardStore {
  if(typeof window==="undefined") return {totalStars:0,games:{}};
  try { const raw=localStorage.getItem(STORAGE_KEY)??""; if(raw===_rawCache&&_cache) return _cache; _rawCache=raw; _cache=raw?JSON.parse(raw):{totalStars:0,games:{}}; if(!_cache!.games)_cache!.games={}; return _cache!; } catch { return {totalStars:0,games:{}}; }
}
function writeLocal(store:RewardStore) {
  if(typeof window==="undefined") return;
  try { _cache=store; _rawCache=JSON.stringify(store); localStorage.setItem(STORAGE_KEY,_rawCache); listeners.forEach(fn=>fn()); } catch {}
}
export function subscribeReward(fn:()=>void){listeners.add(fn);return ()=>listeners.delete(fn);}
export function getLocalTotalStars(){return readLocal().totalStars;}
export function getLocalGameSummary(slug:string){return readLocal().games[slug]??null;}
export function getAllLocalGameSummaries(){return readLocal().games;}
export function recordGameOpened(slug:string){
  const store=readLocal(); if(!store.games[slug])store.games[slug]={attempts:0,correctFirstTry:0,completions:0,bestStars:0,opens:0};
  store.games[slug].opens=(store.games[slug].opens??0)+1; writeLocal(store);
}
export function recordGameCompletion(slug:string,stars:number,correctFirstTry:number,totalQuestions:number){
  const store=readLocal(); const rec=store.games[slug]??{attempts:0,correctFirstTry:0,completions:0,bestStars:0,opens:0};
  rec.attempts+=totalQuestions; rec.correctFirstTry+=correctFirstTry; rec.completions+=1; rec.bestStars=Math.max(rec.bestStars,stars); store.games[slug]=rec;
  const awarded=Math.max(1,stars); store.totalStars+=awarded; writeLocal(store); return awarded;
}
