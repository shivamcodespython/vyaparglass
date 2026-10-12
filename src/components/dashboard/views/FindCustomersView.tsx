'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  Users,
  Search,
  MapPin,
  Building2,
  Plus,
  ShieldCheck,
  Star,
  CheckCircle2,
  ExternalLink,
  Phone,
  Send,
} from 'lucide-react';

export function FindCustomersView() {
  const {
    businesses,
    myBusiness,
    relationships,
    addCustomerToNetwork,
    setInspectingBusiness,
  } = useBizLink();

  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedRadius, setSelectedRadius] = useState(25);

  // Find candidate buyers (Retailers, Service Providers, Contractors)
  const candidateBuyers = businesses.filter(b => {
    if (b.id === myBusiness.id) return false;
    const isBuyerRole = b.roles.includes('Retailer') || b.roles.includes('Service Provider');
    if (!isBuyerRole) return false;

    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      const match =
        b.name.toLowerCase().includes(q) ||
        b.location.city.toLowerCase().includes(q) ||
        b.categories.some(c => c.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-950 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
              Downstream B2B Expansion
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Discover & Connect with Retail Buyers
          </h2>
          <p className="text-sm text-emerald-100 mt-1 leading-relaxed">
            Expand your distribution footprint. Identify local retail store owners, commercial contractors, and institutional purchasers looking for steady bulk supply.
          </p>
        </div>
      </div>

      {/* Search Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            placeholder="Search retail buyers by name, category, or area..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium">Radius:</span>
          {[10, 25, 50].map(r => (
            <button
              key={r}
              onClick={() => setSelectedRadius(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRadius === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Candidate Buyers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidateBuyers.map(buyer => {
          const isAlreadyCustomer = relationships.some(
            r => r.sourceId === myBusiness.id && r.targetId === buyer.id
          );

          return (
            <div
              key={buyer.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-base font-bold text-slate-900">{buyer.name}</h4>
                      {buyer.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {buyer.location.area}, {buyer.location.city}
                      </span>
                      {buyer.location.distanceKm !== undefined && (
                        <span className="font-semibold text-emerald-700">
                          ({buyer.location.distanceKm} km away)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{buyer.rating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {buyer.roles.map(r => (
                    <span key={r} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {r}
                    </span>
                  ))}
                  {buyer.categories.slice(0, 2).map(c => (
                    <span key={c} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                      {c}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {buyer.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setInspectingBusiness(buyer)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  View Profile
                </button>

                {!isAlreadyCustomer ? (
                  <button
                    onClick={() => addCustomerToNetwork(buyer)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Register as Buyer
                  </button>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Registered Client
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
