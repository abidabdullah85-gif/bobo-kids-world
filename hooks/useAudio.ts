"use client";
import { useSyncExternalStore } from "react";
import { subscribeMuted, subscribeVoice, isMuted, isVoiceEnabled, toggleMuted, toggleVoiceEnabled, playClick, playCorrect, playRetry, playCelebration, playBoboVoice, cancelBoboVoice } from "@/lib/audio/AudioManager";

export function useAudio() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);
  const voiceEnabled = useSyncExternalStore(subscribeVoice, isVoiceEnabled, () => true);
  return { muted, voiceEnabled, toggleMuted, toggleVoiceEnabled, playClick, playCorrect, playRetry, playCelebration, playBoboVoice, cancelBoboVoice };
}
