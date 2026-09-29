import type { ShapeKey } from "@/types/game";

const PATHS: Record<ShapeKey, React.ReactNode> = {
  circle:    <circle cx="50" cy="50" r="38" />,
  square:    <rect x="12" y="12" width="76" height="76" rx="4"/>,
  triangle:  <polygon points="50,10 90,90 10,90"/>,
  rectangle: <rect x="8" y="24" width="84" height="52" rx="4"/>,
  oval:      <ellipse cx="50" cy="50" rx="42" ry="28"/>,
};

interface Props { shapeKey: ShapeKey; color?: string; size?: number; className?: string; }

export default function ShapeDisplay({ shapeKey, color="#3DBFBF", size=80, className="" }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden>
      <g fill={color} stroke={color} strokeWidth="0">
        {PATHS[shapeKey]}
      </g>
    </svg>
  );
}
