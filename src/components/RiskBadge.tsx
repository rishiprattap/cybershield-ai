import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const configs = {
    HIGH: {
      label: 'High Risk',
      icon: ShieldAlert,
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      description: 'Severe malicious indicators detected',
    },
    SUSPICIOUS: {
      label: 'Suspicious',
      icon: AlertTriangle,
      bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      description: 'Multiple warning signals present',
    },
    LOW: {
      label: 'Lower Observed Risk',
      icon: ShieldCheck,
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      description: 'No active malicious hallmarks identified',
    },
    INCONCLUSIVE: {
      label: 'Inconclusive',
      icon: HelpCircle,
      bg: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
      description: 'Insufficient forensic signals to reach a verdict',
    },
  };

  const config = configs[level] || configs.INCONCLUSIVE;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 gap-2',
    lg: 'text-sm font-semibold px-3.5 py-1.5 gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight whitespace-nowrap ${config.bg} ${sizeClasses}`}
      title={config.description}
    >
      <Icon className={`${iconSizes} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
