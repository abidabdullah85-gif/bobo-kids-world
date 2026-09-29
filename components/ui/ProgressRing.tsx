"use client";
import { motion } from "framer-motion";

interface Props { value: number; max?: number; size?: number; stroke?: number; color?: string; label?: string; }

export default function ProgressRing({ value, max=100, size=64, stroke=6, color="#3DBFBF", label }: Props) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="relative inline-flex items-center justify-center" style={{width:size,height:size}}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke}/>
        <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          initial={{strokeDashoffset:circ}}
          animate={{strokeDashoffset:offset}}
          transition={{duration:0.8,ease:"easeOut"}}/>
      </svg>
      {label && <span className="absolute text-xs font-bold text-gray-700">{label}</span>}
    </div>
  );
}
