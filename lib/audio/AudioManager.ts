"use client";

const MUTE_KEY = "bobo-kids-world:muted";
const VOICE_KEY = "bobo-kids-world:voice-enabled";
let _ctx: AudioContext | null = null;
const muteListeners = new Set<() => void>();
const voiceListeners = new Set<() => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) { const C = window.AudioContext || (window as any).webkitAudioContext; if (C) _ctx = new C(); }
    if (_ctx?.state === "suspended") _ctx.resume();
    return _ctx;
  } catch { return null; }
}

function readBool(key: string, def: boolean): boolean {
  if (typeof window === "undefined") return def;
  try { const v = localStorage.getItem(key); return v === null ? def : v === "true"; } catch { return def; }
}

export function isMuted(): boolean { return readBool(MUTE_KEY, false); }
export function isVoiceEnabled(): boolean { return readBool(VOICE_KEY, true); }
export function subscribeMuted(fn: () => void) { muteListeners.add(fn); return () => muteListeners.delete(fn); }
export function subscribeVoice(fn: () => void) { voiceListeners.add(fn); return () => voiceListeners.delete(fn); }
export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(MUTE_KEY, String(v)); } catch {}
  if (v) cancelBoboVoice();
  muteListeners.forEach(fn => fn());
}
export function toggleMuted() { setMuted(!isMuted()); }
export function setVoiceEnabled(v: boolean) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(VOICE_KEY, String(v)); } catch {}
  if (!v) cancelBoboVoice();
  voiceListeners.forEach(fn => fn());
}
export function toggleVoiceEnabled() { setVoiceEnabled(!isVoiceEnabled()); }

function playTone(freq: number, dur: number, type: OscillatorType = "sine", gain = 0.25) {
  if (isMuted()) return;
  try {
    const ctx = getCtx(); if (!ctx) return;
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type; osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(); osc.stop(ctx.currentTime + dur);
  } catch {}
}

export function playClick() { playTone(600, 0.08, "sine", 0.15); }
export function playCorrect() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.18, "sine", 0.22), i * 70));
}
export function playRetry() {
  playTone(280, 0.12, "sine", 0.18);
  setTimeout(() => playTone(250, 0.18, "sine", 0.15), 100);
}
export function playCelebration() {
  const melody = [523, 659, 784, 880, 1047, 880, 784, 1047];
  melody.forEach((f, i) => setTimeout(() => playTone(f, 0.2, "sine", 0.2), i * 80));
}

export function cancelBoboVoice() {
  if (typeof window === "undefined") return;
  try { window.speechSynthesis?.cancel(); } catch {}
}

// ── Kid-friendly cheerful voice ──────────────────────────────────────────────
let _voicesLoaded = false;
let _kidVoice: SpeechSynthesisVoice | null = null;

function pickKidVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const ss = window.speechSynthesis;
  if (!ss) return null;
  const voices = ss.getVoices();
  if (voices.length === 0) return null;

  // Priority: fun / kid-sounding English voices
  const preferred = [
    "Google UK English Female",
    "Samantha",
    "Karen",
    "Moira",
    "Tessa",
    "Veena",
    "Fiona",
    "Victoria",
    "Google US English",
  ];

  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: any English female
  return voices.find(v => v.lang.startsWith("en") && v.name.toLowerCase().includes("female"))
    ?? voices.find(v => v.lang.startsWith("en"))
    ?? voices[0];
}

export function playBoboVoice(text: string) {
  if (typeof window === "undefined") return;
  if (isMuted() || !isVoiceEnabled()) return;
  try {
    const ss = window.speechSynthesis;
    if (!ss) return;
    ss.cancel();

    const speak = () => {
      if (!_kidVoice) _kidVoice = pickKidVoice();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.82;      // slightly slow for kids
      u.pitch = 1.35;     // higher pitch = more cheerful / kid-like
      u.volume = 1.0;
      if (_kidVoice) u.voice = _kidVoice;
      ss.speak(u);
    };

    // Voices may not be loaded yet on first call
    if (!_voicesLoaded && ss.getVoices().length === 0) {
      ss.onvoiceschanged = () => { _voicesLoaded = true; _kidVoice = pickKidVoice(); speak(); ss.onvoiceschanged = null; };
    } else {
      speak();
    }
  } catch {}
}
