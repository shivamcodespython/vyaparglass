'use client';

import React from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  Search,
  Bell,
  Sparkles,
  Zap,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  User,
  ShoppingBag,
} from 'lucide-react';

export function DashboardHeader() {
  const {
    myBusiness,
    setAppMode,
    setDashboardView,
    searchResults,
    useMockMode,
  } = useBizLink();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Search trigger or page title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800 hidden sm:block">
            {myBusiness.name}
          </h2>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            ({myBusiness.businessCode})
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* SerpApi mode status pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>SerpApi Discovery:</span>
          <span className="text-indigo-600 font-bold">
            {useMockMode ? 'Mock Sandbox' : 'Live / Adaptive'}
          </span>
        </div>

        {/* Quick Link to Customer Mode */}
        <button
          onClick={() => setAppMode('customer')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-slate-200"
          title="Switch to customer-facing discovery view"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden md:inline">Switch to</span> Customer Portal
        </button>

        {/* User profile avatar */}
        <div
          onClick={() => setDashboardView('profile')}
          className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {myBusiness.ownerName.charAt(0)}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{myBusiness.ownerName}</p>
            <p className="text-[10px] text-slate-500">{myBusiness.primaryRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
