"use client";
import type { MasteryStatus } from "@/types/game";

const CONFIG: Record<MasteryStatus, { label:string; color:string; emoji:string }> = {
  "not-started":  { label:"Not yet",      color:"bg-gray-100 text-gray-500",    emoji:"○" },
  "discovering":  { label:"Just started", color:"bg-blue-100 text-blue-600",    emoji:"🔍" },
  "learning":     { label:"Learning",     color:"bg-yellow-100 text-yellow-700", emoji:"📖" },
  "practicing":   { label:"Getting there",color:"bg-orange-100 text-orange-700", emoji:"✏️" },
  "confident":    { label:"Doing well",   color:"bg-green-100 text-green-700",   emoji:"👍" },
  "mastered":     { label:"Mastered! 🌟", color:"bg-purple-100 text-purple-700", emoji:"🌟" },
};

interface Props { status: MasteryStatus; showLabel?: boolean; size?: "xs"|"sm"|"md"; }

export default function MasteryBadge({ status, showLabel=true, size="sm" }: Props) {
  const cfg = CONFIG[status];
  const sizes = { xs:"text-xs px-1.5 py-0.5", sm:"text-sm px-2 py-1", md:"text-base px-3 py-1.5" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${cfg.color} ${sizes[size]}`}>
      <span>{cfg.emoji}</span>
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
}
