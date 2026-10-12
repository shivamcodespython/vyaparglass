'use client';

import React, { useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import {
  Store,
  Wifi,
  WifiOff,
  Lock,
  Sun,
  Moon,
  Plus,
  Receipt,
  Search,
  Package,
  UserPlus,
  ShieldAlert,
} from 'lucide-react';

export function Navbar() {
  const {
    storeProfile,
    isOnline,
    lockApp,
    theme,
    setTheme,
    setIsNewBillModalOpen,
    setIsAddProductModalOpen,
    setIsAddCustomerModalOpen,
    setActiveTab,
  } = useVyapar();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors select-none">
      {/* Left: Store identity & Offline Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
            {storeProfile?.storeName?.[0] || 'V'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                {storeProfile?.storeName || 'VyaparGlass'}
              </h2>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px] sm:max-w-xs">
              {storeProfile?.category || 'Retail Store'} • {storeProfile?.city || 'Local'}
            </p>
          </div>
        </div>

        {/* Offline / Online Status Pill */}
        <div
          title={
            isOnline
              ? 'Connected to internet. Local-first storage remains primary.'
              : 'Operating offline. All data is saved safely in IndexedDB on this device.'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60'
          }`}
        >
          {isOnline ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Online • Local DB</span>
              <span className="md:hidden">Local</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-500" />
              <span>Offline Mode</span>
            </>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Quick New Bill Button */}
        <button
          onClick={() => setActiveTab('pos')}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all transform active:scale-95"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>New Bill (POS)</span>
        </button>

        {/* Quick Add Product */}
        <button
          onClick={() => setIsAddProductModalOpen(true)}
          title="Add New Inventory Product"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          <Package className="w-3.5 h-3.5 text-indigo-500" />
          <span>+ Product</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          title="Toggle Light / Dark Mode"
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* App Lock Button */}
        <button
          onClick={lockApp}
          title="Lock Application Now (Owner PIN Required to Unlock)"
          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
