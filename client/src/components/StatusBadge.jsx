import React from 'react';
import clsx from 'clsx';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileEdit,
  Sparkles,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

const statusConfig = {
  'Draft': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300', icon: FileEdit },
  'Submitted': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Clock },
  'Analyzing': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: Sparkles, animate: true },
  'Issues Found': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300', icon: AlertTriangle },
  'Revised': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: RotateCcw },
  'Under Review': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: HelpCircle },
  'Changes Requested': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: AlertTriangle },
  'Approved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle2 },
  'Rejected': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle },
  'Compliant': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', icon: CheckCircle2 }
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = statusConfig[status] || statusConfig['Draft'];
  const Icon = config.icon;

  const sizeClasses = size === 'lg'
    ? 'px-3 py-1 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border shadow-xs transition-colors',
        config.bg,
        config.text,
        config.border,
        sizeClasses
      )}
    >
      <Icon className={clsx(size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5', config.animate && 'animate-spin')} />
      <span>{status}</span>
    </span>
  );
}
