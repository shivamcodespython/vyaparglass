'use client';

import React, { useEffect, useState } from 'react';
import { useVyapar, VyaparTab } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import {
  LayoutDashboard,
  Receipt,
  Package,
  ShoppingBag,
  Users,
  Truck,
  History,
  BarChart3,
  Tag,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface NavItem {
  id: VyaparTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export function Sidebar() {
  const { activeTab, setActiveTab, refreshTrigger, storeProfile } = useVyapar();
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [dueCustomerCount, setDueCustomerCount] = useState<number>(0);

  // Compute live badge counts from Dexie
  useEffect(() => {
    async function loadBadges() {
      try {
        const products = await db.products.filter(p => !p.isArchived).toArray();
        const low = products.filter(p => p.stockQuantity <= p.lowStockThreshold).length;
        setLowStockCount(low);

        const customers = await db.customers.toArray();
        const due = customers.filter(c => c.currentBalance > 0).length;
        setDueCustomerCount(due);
      } catch (err) {
        console.error('Failed to load sidebar badge counts:', err);
      }
    }

    loadBadges();
  }, [refreshTrigger]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Billing / POS', icon: Receipt, highlight: true },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : undefined,
    },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag },
    {
      id: 'customers',
      label: 'Bahi Khata (Customers)',
      icon: Users,
      badge: dueCustomerCount > 0 ? `${dueCustomerCount} dues` : undefined,
    },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'offers', label: 'Offers & Sharing', icon: Tag },
    { id: 'test_suite', label: 'Acceptance Tests', icon: CheckCircle2, badge: 'Tests' },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/95 dark:bg-slate-950/95 text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/80 backdrop-blur-2xl select-none">
      {/* Brand & Store Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-sky-400 text-white flex items-center justify-center font-bold text-base shadow-glass">
            VG
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">
                {storeProfile?.appName || 'VyaparGlass'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                RETAIL
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Offline-First Business OS</p>
          </div>
        </div>

        {/* Active Store Widget */}
        <div className="mt-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-white truncate max-w-[170px]">
              {storeProfile?.storeName || 'My Retail Shop'}
            </p>
            <span title="Offline Data Encapsulated">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>ID: VG-SHOP</span>
            <span className="text-emerald-400">● Local DB</span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Store Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              } ${item.highlight && !isActive ? 'ring-1 ring-indigo-500/30 text-indigo-300' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : typeof item.badge === 'string' && item.badge.includes('alert')
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-400 text-center">
        <p className="font-medium text-slate-300">VyaparGlass v1.0 Production</p>
        <p className="text-slate-500 mt-0.5">Dexie.js Persistent Storage</p>
      </div>
    </aside>
  );
}
