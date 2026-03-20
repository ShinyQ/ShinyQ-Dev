"use client";

import { cn } from "src/lib/utils";

interface CalorieRingProps {
  consumed: number;
  target: number;
  className?: string;
}

export function CalorieRing({ consumed, target, className }: CalorieRingProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  const overPercentage = target > 0 ? (consumed / target) * 100 : 0;
  const remaining = Math.max(target - consumed, 0);

  const radius = 66;
  const strokeWidth = 8;
  const size = (radius + strokeWidth) * 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStrokeColor = () => {
    if (overPercentage <= 100) return "#f97316"; // orange-500
    if (overPercentage <= 115) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getTrackColor = () => {
    if (overPercentage <= 100) return "#fff7ed"; // orange-50
    if (overPercentage <= 115) return "#fefce8"; // yellow-50
    return "#fef2f2"; // red-50
  };

  const getStatusLabel = () => {
    if (overPercentage <= 100) return "On track";
    if (overPercentage <= 115) return "Slightly over";
    return "Over target";
  };

  const getStatusDotColor = () => {
    if (overPercentage <= 100) return "bg-orange-500";
    if (overPercentage <= 115) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border border-zinc-100 bg-white px-6 py-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className
      )}
    >
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getTrackColor()}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[28px] font-bold leading-none tracking-tight text-zinc-900">
            {consumed.toLocaleString()}
          </span>
          <span className="mt-0.5 text-xs text-zinc-400">
            / {target.toLocaleString()} cal
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className={cn("h-1.5 w-1.5 rounded-full", getStatusDotColor())} />
        <span className="text-xs font-medium text-zinc-600">
          {getStatusLabel()}
        </span>
        {remaining > 0 && (
          <span className="text-xs text-zinc-400">
            &middot; {remaining.toLocaleString()} remaining
          </span>
        )}
      </div>
    </div>
  );
}
