import React from 'react';
import { cn } from '../lib/utils';

interface NumericTileProps {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  subValue?: string;
  isFlashing?: boolean;
}

export function NumericTile({ label, value, unit, color, subValue, isFlashing }: NumericTileProps) {
  return (
    <div className={cn(
      "p-3 rounded border border-zinc-800 bg-[#0a0a12] flex flex-col justify-between flex-1",
      isFlashing && "animate-[pulse_1s_ease-in-out_infinite] border-red-500 bg-red-950/20"
    )}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-bold tracking-widest" style={{ color }}>{label}</span>
        {unit && <span className="text-xs text-zinc-500">{unit}</span>}
      </div>
      
      <div className="flex flex-col items-end mt-auto">
        <span className="text-6xl font-mono leading-none tracking-tighter" style={{ color }}>{value}</span>
        {subValue && <span className="text-lg font-mono mt-1 text-zinc-400">{subValue}</span>}
      </div>
    </div>
  );
}
