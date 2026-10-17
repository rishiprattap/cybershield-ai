import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { FactCheckVerdict } from '../types';

interface FactVerdictBadgeProps {
  verdict: FactCheckVerdict;
  size?: 'sm' | 'md' | 'lg';
}

export const FactVerdictBadge: React.FC<FactVerdictBadgeProps> = ({ verdict, size = 'md' }) => {
  const configs: Record<
    FactCheckVerdict,
    { label: string; icon: React.ElementType; bg: string; description: string }
  > = {
    SUPPORTED: {
      label: 'Supported',
      icon: CheckCircle2,
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      description: 'Public evidence and authoritative sources corroborate this claim.',
    },
    CONTRADICTED: {
      label: 'Contradicted',
      icon: XCircle,
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      description: 'Corroborated evidence or official records directly contradict this claim.',
    },
    MIXED: {
      label: 'Mixed',
      icon: AlertTriangle,
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      description: 'The claim contains partially true elements alongside incorrect or unverified context.',
    },
    UNVERIFIED: {
      label: 'Unverified',
      icon: HelpCircle,
      bg: 'bg-sky-500/15 text-sky-300 border-sky-500/40',
      description: 'Insufficient independent web evidence was found to confirm or refute.',
    },
  };

  const config = configs[verdict] || configs.UNVERIFIED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium',
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
      className={`inline-flex items-center rounded-md border font-mono tracking-tight whitespace-nowrap shadow-xs ${config.bg} ${sizeClasses}`}
      title={config.description}
    >
      <Icon className={`${iconSizes} shrink-0`} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
};
