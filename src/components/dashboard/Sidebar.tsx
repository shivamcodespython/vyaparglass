'use client';

import React from 'react';
import { useBizLink, DashboardView } from '@/context/BizLinkContext';
import {
  LayoutDashboard,
  Search,
  Users,
  Package,
  Layers,
  Receipt,
  Star,
  Building2,
  Settings,
  Sparkles,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface NavItem {
  id: DashboardView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'find_suppliers', label: 'Find Stores & Suppliers', icon: Search, badge: 'Live Maps', highlight: true },
  { id: 'find_customers', label: 'Find Customers', icon: Users },
  { id: 'network', label: 'My Network', icon: Layers, badge: 'Graph' },
  { id: 'products', label: 'Products & Catalog', icon: Package },
  { id: 'transactions', label: 'Khata Bahi & Ledger', icon: Receipt, badge: 'Udhaar' },
  { id: 'reviews', label: 'Reviews & Trust', icon: Star },
  { id: 'profile', label: 'Business Profile', icon: Building2 },
  { id: 'settings', label: 'Settings & SerpApi', icon: Settings },
];

export function Sidebar() {
  const {
    dashboardView,
    setDashboardView,
    myBusiness,
    setAppMode,
    setIsRegisterModalOpen,
  } = useBizLink();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div
          onClick={() => setAppMode('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-white">BizLink</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Connected Supply Network</p>
          </div>
        </div>

        {/* Current Active Business Card */}
        <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-white truncate">{myBusiness.name}</h5>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                <span className="text-indigo-400 font-semibold">{myBusiness.primaryRole}</span>
                <span>• {myBusiness.location.city}</span>
              </div>
            </div>
            {myBusiness.verified && (
              <span title="Verified"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /></span>
            )}
          </div>
          <div className="mt-2 text-[10px] font-mono text-slate-400 bg-black/30 px-2 py-0.5 rounded flex items-center justify-between">
            <span>ID: {myBusiness.businessCode}</span>
            <span className="text-emerald-400">● Active</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Supply Chain Hub
        </div>

        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = dashboardView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setDashboardView(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'ring-1 ring-indigo-500/40 text-indigo-300' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.highlight
                      ? 'bg-indigo-500/30 text-indigo-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Register New Business
        </button>

        <button
          onClick={() => setAppMode('landing')}
          className="w-full py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit to Landing Page
        </button>
      </div>
    </aside>
  );
}
