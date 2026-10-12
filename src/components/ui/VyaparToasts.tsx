'use client';

import React from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export function VyaparToasts() {
  const { toasts, dismissToast } = useVyapar();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';
        const isInfo = toast.type === 'info';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-glass flex items-start gap-3 transition-all animate-slide-up bg-white/95 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-100"
          >
            <div className="mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
              {isInfo && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                {toast.description}
              </p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
