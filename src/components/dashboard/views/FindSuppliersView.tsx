'use client';

import React, { useState, useEffect } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Business, BusinessRole } from '@/types';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Building2,
  Package,
  Plus,
  CheckCircle2,
  Eye,
  Zap,
  RotateCw,
  Globe,
  Tag,
  ArrowUpDown,
  Layers,
  Sparkles,
  Info,
  Scale,
  X,
  Phone,
  Navigation,
  Receipt,
  Crosshair,
} from 'lucide-react';

const CATEGORY_FILTERS = [
  { label: 'All Businesses', query: '', icon: '🌐' },
  { label: 'Bakery & Sweets', query: 'Bakery', icon: '🥐' },
  { label: 'Grocery & Mart', query: 'Grocery', icon: '🛒' },
  { label: 'Clothing & Apparel', query: 'Clothing', icon: '👗' },
  { label: 'Beauty & Salon', query: 'Salon', icon: '💄' },
  { label: 'Auto Parts & Mechanic', query: 'Mechanic', icon: '🔧' },
  { label: 'Electronics & Mobiles', query: 'Electronics', icon: '⚡' },
  { label: 'Cafe & Restaurant', query: 'Cafe', icon: '☕' },
  { label: 'Sanitary & Hardware', query: 'Sanitary', icon: '🚰' },
  { label: 'Stationery & Books', query: 'Stationery', icon: '📚' },
  { label: 'Shoes & Footwear', query: 'Shoes', icon: '👟' },
  { label: 'Pharmacy & Medical', query: 'Pharmacy', icon: '💊' },
  { label: 'Wholesalers & Depots', query: 'Wholesaler', icon: '📦' },
  { label: 'Manufacturers & Plants', query: 'Manufacturer', icon: '🏭' },
];

export function FindSuppliersView() {
  const {
    searchParams,
    setSearchParams,
    performBusinessSearch,
    searchResults,
    isSearching,
    useMockMode,
    setUseMockMode,
    setInspectingBusiness,
    addSupplierToNetwork,
    relationships,
    myBusiness,
    setDashboardView,
    detectUserLocation,
    isDetectingLocation,
    setIsAddTransactionModalOpen,
    setPrefilledTxBusiness,
  } = useBizLink();

  const [activeCategory, setActiveCategory] = useState('All Businesses');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');
  const [compareList, setCompareList] = useState<Business[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    if (!searchResults) {
      performBusinessSearch({
        query: 'Bakery & Food',
        location: 'Ambala',
        radiusKm: 20,
        businessType: 'All',
      });
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performBusinessSearch();
  };

  const handleCategoryClick = (cat: typeof CATEGORY_FILTERS[0]) => {
    setActiveCategory(cat.label);
    const newQuery = cat.query || 'Local Businesses';
    setSearchParams(prev => ({
      ...prev,
      query: newQuery,
    }));
    performBusinessSearch({
      query: newQuery,
    });
  };

  const toggleCompare = (b: Business) => {
    setCompareList(prev => {
      const exists = prev.some(item => item.id === b.id);
      if (exists) {
        return prev.filter(item => item.id !== b.id);
      } else {
        if (prev.length >= 3) {
          return [prev[1], prev[2], b];
        }
        return [...prev, b];
      }
    });
  };

  const handleOpenKhata = (b: Business) => {
    setPrefilledTxBusiness(b);
    setIsAddTransactionModalOpen(true);
  };

  const displayedResults = [...(searchResults?.results || [])].sort((a, b) => {
    if (sortBy === 'distance') {
      return (a.location.distanceKm || 0) - (b.location.distanceKm || 0);
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    if (sortBy === 'reviews') {
      return b.reviewCount - a.reviewCount;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Universal Search Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Google Search & SerpApi
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Worldwide Local Shop Discovery & Google Maps Navigation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Find Any Store, Product, or Supplier Worldwide
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed font-medium">
            Search bakeries, clothing stores, salons, mechanics, grocery marts, cafes, hardware, electronics, or wholesalers. View real photos, get 1-click Google Maps directions, and manage customer credit/debit Khata history.
          </p>
        </div>

        {/* Category Chips Carousel */}
        <div className="relative z-10 mt-5 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_FILTERS.map(cat => {
            const isSelected = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Search Controls Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Query Input */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Product, Service, or Store Name
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchParams.query}
                  onChange={e => setSearchParams({ ...searchParams, query: e.target.value })}
                  placeholder="e.g. Sourdough bread, Brake pads, Salon, LED lights, Cafe..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Location Input with GPS Detection Button */}
            <div className="md:col-span-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Location / City
                </label>
                <button
                  type="button"
                  onClick={() => detectUserLocation()}
                  disabled={isDetectingLocation}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Crosshair className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Locating...' : 'Use My GPS'}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchParams.location}
                  onChange={e => setSearchParams({ ...searchParams, location: e.target.value })}
                  placeholder="e.g. Ambala, Delhi, London, New York..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Radius Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Radius (km)
              </label>
              <select
                value={searchParams.radiusKm || 20}
                onChange={e => setSearchParams({ ...searchParams, radiusKm: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-800"
              >
                <option value={2}>2 km (Neighbourhood)</option>
                <option value={5}>5 km (Local)</option>
                <option value={10}>10 km (City Area)</option>
                <option value={25}>25 km (District)</option>
                <option value={50}>50 km (Regional)</option>
              </select>
            </div>

            {/* Search Button */}
            <div className="md:col-span-1 flex items-end">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-1 disabled:opacity-50 h-[42px]"
                title="Search Businesses"
              >
                {isSearching ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Radius & Live Meta */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold">Quick Radius:</span>
            {[2, 5, 10, 25, 50].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSearchParams(prev => ({ ...prev, radiusKm: r }));
                  performBusinessSearch({ radiusKm: r });
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  searchParams.radiusKm === r
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {compareList.length > 0 && (
              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center gap-1 shadow-sm transition-colors text-xs"
              >
                <Scale className="w-3.5 h-3.5" />
                Compare ({compareList.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Header Bar */}
      {searchResults && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              Found {displayedResults.length} businesses for "{searchResults.query}"
            </span>
            <span>in <strong className="text-slate-800">{searchResults.location}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
              ⚡ {searchResults.latencyMs}ms
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-bold ${
              searchResults.source === 'serpapi_live'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
            }`}>
              {searchResults.source === 'serpapi_live' ? '🟢 Live SerpApi (Google Maps)' : '⚡ High-Fidelity Discovery'}
            </span>
          </div>
        </div>
      )}

      {/* Sorting bar */}
      <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <span className="text-slate-500 font-bold flex items-center gap-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          Showing listings within {searchParams.radiusKm || 20} km
        </span>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="distance">Distance (Nearest First)</option>
            <option value="rating">Rating (Highest First)</option>
            <option value="reviews">Most Reviews</option>
          </select>
        </div>
      </div>

      {/* Results Grid with Photos & Google Maps Navigation */}
      {isSearching ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Querying SerpApi & Google Maps...</p>
          <p className="text-xs text-slate-500">Retrieving real store addresses, phone numbers, and live directions</p>
        </div>
      ) : displayedResults.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">No Listings Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try expanding your search radius (e.g. 50 km) or searching for generic terms like "Bakery", "Mechanic", "Salon", "Hardware".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedResults.map(business => {
            const isAlreadySupplier = relationships.some(
              r => r.sourceId === business.id && r.targetId === myBusiness.id
            );
            const isCompared = compareList.some(item => item.id === business.id);
            const mapsNavUrl = business.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(business.name + ' ' + business.location.city)}`;

            return (
              <div
                key={business.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Photo & Badge Header */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={business.imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80'}
                    alt={business.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                  {/* Badges on Image */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-white text-slate-900 shadow-md">
                      {business.primaryRole}
                    </span>
                    {business.verified && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-black flex items-center gap-1 border border-white/20">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{business.rating.toFixed(1)}</span>
                    <span className="text-[10px] text-slate-300 font-normal">({business.reviewCount})</span>
                  </div>

                  {/* Title and location inside image bottom */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="text-base font-black text-white leading-snug drop-shadow-sm">
                      {business.name}
                    </h4>
                    <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {business.location.address || `${business.location.area}, ${business.location.city}`}
                      {business.location.distanceKm !== undefined && (
                        <span className="text-emerald-300 font-bold ml-1">
                          · {business.location.distanceKm} km
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="text-emerald-700 font-bold">{business.openStatus || 'Open today'}</span>
                      <span className="font-mono text-[11px] text-slate-400">{business.businessCode}</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                      {business.description}
                    </p>
                  </div>

                  {/* Action Buttons: Directions, Khata, Profile, Contact */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Google Maps Directions Navigation Button */}
                      <a
                        href={mapsNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Directions
                      </a>

                      {/* Khata Credit/Debit Button */}
                      <button
                        onClick={() => handleOpenKhata(business)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1"
                        title="Record Udhaar / Jama"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Khata
                      </button>

                      <button
                        onClick={() => setInspectingBusiness(business)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        View
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleCompare(business)}
                        className={`p-1.5 rounded-xl text-xs transition-colors ${
                          isCompared
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        title="Compare with other businesses"
                      >
                        <Scale className="w-3.5 h-3.5" />
                      </button>

                      {!isAlreadySupplier ? (
                        <button
                          onClick={() => {
                            addSupplierToNetwork(business);
                            setDashboardView('network');
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Connect
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Partner
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Drawer */}
      {isCompareOpen && compareList.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Compare Business Listings</h3>
                <span className="text-xs text-slate-300">({compareList.length} selected)</span>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-500 w-36">Metric</th>
                    {compareList.map(b => (
                      <th key={b.id} className="p-3 font-bold text-slate-900 text-sm">
                        {b.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 text-slate-500 font-semibold">Category / Role</td>
                    {compareList.map(b => (
                      <td key={b.id} className="p-3 font-semibold text-indigo-700">
                        {b.primaryRole}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-semibold">Location & Distance</td>
                    {compareList.map(b => (
                      <td key={b.id} className="p-3 font-bold text-emerald-700">
                        {b.location.distanceKm} km ({b.location.city})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-semibold">Rating</td>
                    {compareList.map(b => (
                      <td key={b.id} className="p-3 font-semibold text-amber-600">
                        ⭐ {b.rating.toFixed(1)} ({b.reviewCount} reviews)
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-500 font-semibold">Directions</td>
                    {compareList.map(b => (
                      <td key={b.id} className="p-3">
                        <a
                          href={b.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.name + ' ' + b.location.city)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 font-bold hover:underline"
                        >
                          Open in Google Maps →
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
