"use client";
import { getLocalDateKey } from "@/lib/time/localDate";

const STORAGE_KEY = "bobo-kids-world:daily-log-v1";
export interface DayStat { completions:number; timeSpentSec:number; starsEarned:number; gameSlugs:string[]; }
interface DailyLogStore { days:Record<string,DayStat>; }
let _cache:DailyLogStore|null=null; let _rawCache="";
const listeners=new Set<()=>void>();

export function getTodayKey(){ return getLocalDateKey(); }

function readLocal():DailyLogStore{
  if(typeof window==="undefined")return{days:{}};
  try{const raw=localStorage.getItem(STORAGE_KEY)??"";if(raw===_rawCache&&_cache)return _cache;_rawCache=raw;_cache=raw?JSON.parse(raw):{days:{}};return _cache!;}catch{return{days:{}};}
}
function writeLocal(s:DailyLogStore){
  if(typeof window==="undefined")return;
  try{_cache=s;_rawCache=JSON.stringify(s);localStorage.setItem(STORAGE_KEY,_rawCache);listeners.forEach(fn=>fn());}catch{}
}
export function subscribeDailyLog(fn:()=>void){listeners.add(fn);return()=>listeners.delete(fn);}
export function getDailyLogSnapshotKey(){if(typeof window==="undefined")return"";return localStorage.getItem(STORAGE_KEY)??"";}
export function getTodayStats():DayStat{return readLocal().days[getTodayKey()]??{completions:0,timeSpentSec:0,starsEarned:0,gameSlugs:[]};}
export function getWeeklyStats(){
  const store=readLocal(); const today=new Date();
  let completions=0,timeSpentSec=0,starsEarned=0;
  for(let i=0;i<7;i++){const d=new Date(today);d.setDate(d.getDate()-i);const key=getLocalDateKey(d);const day=store.days[key];if(day){completions+=day.completions;timeSpentSec+=day.timeSpentSec;starsEarned+=day.starsEarned;}}
  return{completions,timeSpentSec,starsEarned};
}
export function recordDailyActivity(slug:string,timeSpentSec:number,starsEarned:number){
  const store=readLocal(); const key=getTodayKey();
  const day=store.days[key]??{completions:0,timeSpentSec:0,starsEarned:0,gameSlugs:[]};
  day.completions+=1; day.timeSpentSec+=timeSpentSec; day.starsEarned+=starsEarned;
  if(!day.gameSlugs.includes(slug))day.gameSlugs=[...day.gameSlugs,slug];
  store.days[key]=day; writeLocal(store);
}
export function formatMinutes(sec:number):string{
  if(sec<60)return"under a minute"; const m=Math.round(sec/60); return`${m} minute${m===1?"":"s"}`;
}
