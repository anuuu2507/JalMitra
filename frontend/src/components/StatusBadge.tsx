import React from 'react';
import { WaterStatus, AlertSeverity, SupplyStatus } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Clock, CheckCheck, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StatusBadgeProps {
  status: WaterStatus | AlertSeverity | SupplyStatus | string;
  type?: 'water' | 'severity' | 'supply';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'water',
  size = 'md',
}) => {
  const { language, t } = useApp();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let Icon = Info;
  let label = status;

  if (type === 'water') {
    switch (status) {
      case 'Sufficient':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        label = t.sufficient;
        break;
      case 'Moderate':
        bg = 'bg-amber-50 text-amber-700 border-amber-200';
        Icon = AlertCircle;
        label = t.moderate;
        break;
      case 'Low':
        bg = 'bg-orange-50 text-orange-700 border-orange-200 font-semibold';
        Icon = AlertTriangle;
        label = t.low;
        break;
      case 'Critical':
        bg = 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse';
        Icon = AlertTriangle;
        label = t.critical;
        break;
    }
  } else if (type === 'severity') {
    switch (status) {
      case 'Info':
        bg = 'bg-sky-50 text-sky-700 border-sky-200';
        Icon = Info;
        label = language === 'te' ? 'సమాచారం (Info)' : 'Info';
        break;
      case 'Warning':
        bg = 'bg-amber-50 text-amber-700 border-amber-200 font-medium';
        Icon = AlertCircle;
        label = language === 'te' ? 'హెచ్చరిక (Warning)' : 'Warning';
        break;
      case 'Critical':
        bg = 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
        Icon = AlertTriangle;
        label = language === 'te' ? 'అత్యవసరం (Critical)' : 'Critical';
        break;
    }
  } else if (type === 'supply') {
    switch (status) {
      case 'Scheduled':
        bg = 'bg-sky-50 text-sky-700 border-sky-200';
        Icon = Clock;
        label = t.scheduled;
        break;
      case 'Delayed':
        bg = 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
        Icon = AlertTriangle;
        label = t.delayed;
        break;
      case 'Completed':
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium';
        Icon = CheckCheck;
        label = t.completed;
        break;
    }
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${bg} ${sizeClass} font-medium tracking-wide`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span className={language === 'te' ? 'font-telugu' : ''}>{label}</span>
    </span>
  );
};
