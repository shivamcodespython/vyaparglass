'use client';

import React, { useState, useEffect } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  ShoppingBag,
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Phone,
  ArrowRight,
  ExternalLink,
  Clock,
  Tag,
  Building2,
  CheckCircle2,
  MessageCircle,
  Navigation,
  Receipt,
  Crosshair,
  User,
  RotateCw,
} from 'lucide-react';
import { BusinessProfileModal } from '../modals/BusinessProfileModal';
import { AddTransactionModal } from '../modals/AddTransactionModal';

const CUSTOMER_CATEGORIES = [
  { label: 'All Local Shops', query: 'Shops', icon: '🛍️' },
  { label: 'Bakery & Sweets', query: 'Bakery', icon: '🥐' },
  { label: 'Grocery & Kirana', query: 'Grocery', icon: '🛒' },
  { label: 'Beauty & Salon', query: 'Salon', icon: '💄' },
  { label: 'Auto Spare Parts & Mechanic', query: 'Mechanic', icon: '🔧' },
  { label: 'Clothing & Fashion', query: 'Clothing', icon: '👗' },
  { label: 'Cafe & Restaurant', query: 'Cafe', icon: '☕' },
  { label: 'Electronics & Mobiles', query: 'Electronics', icon: '⚡' },
  { label: 'Sanitary & Hardware', query: 'Hardware', icon: '🚰' },
  { label: 'Stationery & Books', query: 'Stationery', icon: '📚' },
  { label: 'Shoes & Footwear', query: 'Shoes', icon: '👟' },
  { label: 'Pharmacy & Medical', query: 'Pharmacy', icon: '💊' },
];

export function CustomerPortal() {
  const {
    businesses,
    savedBusinesses,
    toggleSaveBusiness,
    setInspectingBusiness,
    setAppMode,
    showToast,
    currentUser,
    switchAccountType,
    searchParams,
    setSearchParams,
    performBusinessSearch,
    searchResults,
    isSearching,
    detectUserLocation,
    isDetectingLocation,
    transactions,
    setIsAddTransactionModalOpen,
    setPrefilledTxBusiness,
  } = useBizLink();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Local Shops');
  const [userLocation, setUserLocation] = useState('Ambala');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  useEffect(() => {
    if (!searchResults) {
      performBusinessSearch({
        query: 'Bakery & Stores',
        location: 'Ambala',
        radiusKm: 10,
      });
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performBusinessSearch({
      query: searchQuery || 'Local Stores',
      location: userLocation,
    });
  };

  const handleCategoryClick = (cat: typeof CUSTOMER_CATEGORIES[0]) => {
    setActiveCategory(cat.label);
    setSearchQuery(cat.query);
    performBusinessSearch({
      query: cat.query,
      location: userLocation,
    });
  };

  // Compute this individual customer's khata / credit with shops
  const myKhataTransactions = transactions.filter(
    t => t.customerName === currentUser.name || t.type === 'Debit'
  );
  const myTotalUdhaarBalance = myKhataTransactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const displayedBusinesses = searchResults?.results || businesses;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Customer Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div
            onClick={() => setAppMode('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-black text-xl shadow-md">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-900">BizLink</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Consumer / Customer Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Find shops, get directions & manage store Khata</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentUser.name}</span>
            </div>

            <button
              onClick={() => switchAccountType('businessman')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              Switch to Merchant Mode
            </button>
          </div>
        </div>
      </header>

      {/* Customer Khata Banner (if customer has active udhaar with local shops) */}
      {myTotalUdhaarBalance > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 px-6 py-3 border-b border-amber-400 font-bold text-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span>
                You have an active Khata / Store Credit balance of <strong>₹{myTotalUdhaarBalance.toLocaleString('en-IN')}</strong> across local merchants.
              </span>
            </div>
            <span className="text-[11px] bg-slate-950 text-white px-3 py-1 rounded-full font-black">
              Verified Digital Khata
            </span>
          </div>
        </div>
      )}

      {/* Main Customer Search Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Discover Any Local Store, Service, or Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Bakeries, salons, mechanics, grocery marts, cafes, clothing, spare parts, and pharmacies worldwide
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="bg-white p-2.5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 w-full">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search anything: sourdough bread, haircut, brake pads, jeans..."
                className="w-full py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2 px-3 w-full sm:w-56">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={userLocation}
                onChange={e => setUserLocation(e.target.value)}
                placeholder="City or Area..."
                className="w-full py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  const loc = await detectUserLocation();
                  if (loc) setUserLocation(loc.label);
                }}
                className="text-[10px] font-bold text-indigo-600 shrink-0 hover:underline"
              >
                GPS
              </button>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-indigo-500/25 transition-all shrink-0 flex items-center justify-center gap-1.5"
            >
              {isSearching ? <RotateCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Live
            </button>
          </form>

          {/* Preset Quick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[11px] text-slate-400 font-bold">Try searching:</span>
            {['Fresh Sourdough Cake', 'Bridal Makeup Salon', 'Ceramic Brake Pads', 'Denim Jeans Store', 'LED Downlights'].map(q => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setSearchQuery(q);
                  performBusinessSearch({ query: q, location: userLocation });
                }}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CUSTOMER_CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                activeCategory === cat.label
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <span>Found <strong>{displayedBusinesses.length} verified listings</strong> in {userLocation}</span>
          <span className="text-emerald-700 font-bold">● Live Google & Maps Results</span>
        </div>

        {/* Store Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedBusinesses.map(biz => {
            const isSaved = savedBusinesses.includes(biz.id);
            const mapsNavUrl = biz.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.name + ' ' + biz.location.city)}`;

            return (
              <div
                key={biz.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-subtle hover:shadow-xl hover:border-indigo-300 transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Photo & Rating Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={biz.imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80'}
                    alt={biz.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-white text-slate-900 shadow-md">
                      {biz.primaryRole}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => toggleSaveBusiness(biz.id)}
                      className="p-2 rounded-xl bg-slate-950/70 backdrop-blur-md text-white hover:bg-slate-900 transition-colors"
                      title="Save store"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                    </button>
                    <div className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-black flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{biz.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="text-base font-black text-white leading-snug drop-shadow-sm">
                      {biz.name}
                    </h4>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {biz.location.address || `${biz.location.area}, ${biz.location.city}`}
                    </p>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="text-emerald-700 font-bold">{biz.openStatus || 'Open today'}</span>
                      <span className="text-slate-500 font-bold">{biz.reviewCount} Reviews</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {biz.description}
                    </p>
                  </div>

                  {/* Card Actions: Directions, Khata, WhatsApp */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={mapsNavUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Directions
                    </a>

                    <button
                      onClick={() => {
                        setPrefilledTxBusiness(biz);
                        setIsAddTransactionModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      My Khata
                    </button>

                    <button
                      onClick={() => setInspectingBusiness(biz)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Global Profile Modal & Khata Modal */}
      <BusinessProfileModal />
      <AddTransactionModal />
    </div>
  );
}
