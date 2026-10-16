import React from 'react';
import { RiskLevel } from '../types';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  riskLevel: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, riskLevel, size = 'md' }) => {
  // Clamp score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, score));

  // Risk color accents
  const colors = {
    HIGH: 'text-rose-400 stroke-rose-500',
    SUSPICIOUS: 'text-amber-400 stroke-amber-500',
    LOW: 'text-emerald-400 stroke-emerald-500',
    INCONCLUSIVE: 'text-slate-400 stroke-slate-500',
  }[riskLevel];

  const dimensions = {
    sm: { size: 64, stroke: 5, fontSize: 'text-base', labelSize: 'text-[9px]' },
    md: { size: 96, stroke: 7, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
    lg: { size: 128, stroke: 8, fontSize: 'text-3xl', labelSize: 'text-xs' },
  }[size];

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={dimensions.size}
        height={dimensions.size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background track */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          className="text-slate-800"
          fill="none"
        />
        {/* Active progress arc */}
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-700 ease-out ${colors}`}
          fill="none"
        />
      </svg>
      {/* Metric readout with tabular numbers */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-mono font-bold tabular-nums text-slate-100 ${dimensions.fontSize}`}>
          {normalizedScore}
        </span>
        <span className={`uppercase font-mono tracking-widest text-slate-400 ${dimensions.labelSize}`}>
          Threat Idx
        </span>
      </div>
    </div>
  );
};
