import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Loading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message }: { icon: ReactNode; title: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 text-slate-300 dark:text-slate-600">
        {typeof Icon === 'function' ? <Icon className="h-12 w-12" /> : Icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
}

export function Badge({ status, children }: { status?: string; children: ReactNode }) {
  const colorMap: Record<string, string> = {
    Available: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    'On Trip': 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    'In Shop': 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    Retired: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    Draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    Dispatched: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    Completed: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    Cancelled: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
    Active: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
    'Off Duty': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    Suspended: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
  };
  const cls = colorMap[status ?? ''] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  return <span className={`badge ${cls}`}>{children}</span>;
}
