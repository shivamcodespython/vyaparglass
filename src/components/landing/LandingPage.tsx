'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { RegisterBusinessModal } from '../modals/RegisterBusinessModal';
import {
  Building2,
  Users,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Network,
  TrendingUp,
  ShoppingBag,
  Star,
  CheckCircle2,
  Compass,
  Link as LinkIcon,
  Sparkles,
  MapPin,
  Store,
  Receipt,
  User,
} from 'lucide-react';

const FEATURED_CATEGORIES = [
  { name: 'Bakery & Sweets', icon: '🥐', query: 'Bakery' },
  { name: 'Beauty & Salon', icon: '💄', query: 'Salon' },
  { name: 'Auto Spare Parts', icon: '🔧', query: 'Mechanic' },
  { name: 'Clothing & Fashion', icon: '👗', query: 'Clothing' },
  { name: 'Grocery & Supermart', icon: '🛒', query: 'Grocery' },
  { name: 'Cafe & Restaurant', icon: '☕', query: 'Cafe' },
  { name: 'Electronics & Mobiles', icon: '⚡', query: 'Electronics' },
  { name: 'Sanitary & Hardware', icon: '🚰', query: 'Hardware' },
];

export function LandingPage() {
  const {
    setAppMode,
    setDashboardView,
    performBusinessSearch,
    setIsRegisterModalOpen,
    switchAccountType,
    searchParams,
    setSearchParams,
  } = useBizLink();

  const [landingQuery, setLandingQuery] = useState('');
  const [landingLocation, setLandingLocation] = useState('Ambala');

  const handleLandingSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      query: landingQuery || 'Local Businesses',
      location: landingLocation || 'Ambala',
    }));
    setAppMode('business_owner');
    setDashboardView('find_suppliers');
    performBusinessSearch({
      query: landingQuery || 'Local Businesses',
      location: landingLocation || 'Ambala',
    });
  };

  const handleCategoryQuickSearch = (catQuery: string) => {
    setSearchParams(prev => ({
      ...prev,
      query: catQuery,
      location: landingLocation,
    }));
    setAppMode('business_owner');
    setDashboardView('find_suppliers');
    performBusinessSearch({
      query: catQuery,
      location: landingLocation,
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-100 bg-white/90 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-xl shadow-md">
              B
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">BizLink</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                Universal Network
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => switchAccountType('individual')}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              Customer Portal
            </button>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Create Account / Register Store
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-20 px-6 relative overflow-hidden bg-radial-gradient">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold shadow-xs">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>Universal Business Discovery & Google Maps Search Engine</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Find Any Store, Product or Supplier. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900">
              Manage Khata & Navigate Live.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            From bakeries, salons, auto mechanics, grocery marts, and fashion boutiques to wholesalers and manufacturers worldwide. View real store photos, get Google Maps directions, and record customer Udhaar / Jama credit history.
          </p>

          {/* Direct Live Search Form on Landing Page */}
          <form onSubmit={handleLandingSearch} className="max-w-3xl mx-auto bg-white p-3 rounded-3xl shadow-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={landingQuery}
                onChange={e => setLandingQuery(e.target.value)}
                placeholder="Search any product or shop: Bakery, Salon, Brake pads, Sourdough, Jeans..."
                className="w-full py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 px-3 w-full sm:w-48">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={landingLocation}
                onChange={e => setLandingLocation(e.target.value)}
                placeholder="City (e.g. Ambala)"
                className="w-full py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/25 transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Search Live
            </button>
          </form>

          {/* Category Chips Carousel */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {FEATURED_CATEGORIES.map(cat => (
              <button
                key={cat.name}
                type="button"
                onClick={() => handleCategoryQuickSearch(cat.query)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Dual Action Buttons */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setAppMode('business_owner');
                setDashboardView('overview');
              }}
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-xl shadow-indigo-600/25 hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Enter Business Portal & Khata
            </button>

            <button
              onClick={() => switchAccountType('individual')}
              className="px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Explore as Individual Customer
            </button>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars */}
      <section className="py-16 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">1. Universal Discovery</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Search any business category in any city or GPS radius powered by live Google Maps and SerpApi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">2. Google Navigation</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              1-click turn-by-turn Google Maps driving or walking navigation directly to the store.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">3. Digital Khata Bahi</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Track customer Udhaar (Given) and Jama (Received) with automatic balances and WhatsApp reminders.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-black text-slate-900">4. Supply Chain Graph</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Connect your shop directly to upstream super-stockists and tier-1 manufacturers for bulk discounts.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-950 text-slate-400 py-8 px-6 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-white text-sm">BizLink</span>
            <span>• Universal Connected Business Network & Digital Khata</span>
          </div>
          <p className="text-slate-500 font-medium">
            Live Google Maps discovery engine powered by SerpApi
          </p>
        </div>
      </footer>

      {/* Global Modals on Landing Page */}
      <RegisterBusinessModal />
    </div>
  );
}
