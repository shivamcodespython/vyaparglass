'use client';

import React from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toastMessage } = useBizLink();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success' || !toastMessage.type;
  const isWarning = toastMessage.type === 'warning';
  const isInfo = toastMessage.type === 'info';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-slide-up pointer-events-auto">
      <div className="bg-slate-900 text-white p-4 rounded-xl shadow-elevation border border-slate-700/80 flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isWarning && <AlertCircle className="w-5 h-5 text-amber-400" />}
          {isInfo && <Info className="w-5 h-5 text-indigo-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">{toastMessage.title}</p>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
        </div>
      </div>
    </div>
  );
}
