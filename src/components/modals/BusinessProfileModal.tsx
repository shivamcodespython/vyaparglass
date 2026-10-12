'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  X,
  Building2,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  Globe,
  Package,
  Layers,
  ArrowRight,
  TrendingUp,
  Clock,
  Send,
  Navigation,
  ExternalLink,
  Tag,
  UserCheck,
  Receipt,
  Share2,
} from 'lucide-react';
import { BusinessRole } from '@/types';

export function BusinessProfileModal() {
  const {
    inspectingBusiness,
    setInspectingBusiness,
    myBusiness,
    addSupplierToNetwork,
    addCustomerToNetwork,
    relationships,
    showToast,
    setIsAddTransactionModalOpen,
    setPrefilledTxBusiness,
  } = useBizLink();

  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'network' | 'reviews'>('about');
  const [inquiryText, setInquiryText] = useState('');
  const [isInquirySent, setIsInquirySent] = useState(false);

  if (!inspectingBusiness) return null;

  const isMyBusiness = inspectingBusiness.id === myBusiness.id;
  const isAlreadySupplier = relationships.some(
    r => r.sourceId === inspectingBusiness.id && r.targetId === myBusiness.id
  );

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) return;
    setIsInquirySent(true);
    showToast('Inquiry Dispatched', `Inquiry sent to ${inspectingBusiness.name}. Response expected shortly.`, 'success');
    setTimeout(() => {
      setInquiryText('');
      setIsInquirySent(false);
    }, 2500);
  };

  const handleOpenKhata = () => {
    setPrefilledTxBusiness(inspectingBusiness);
    setIsAddTransactionModalOpen(true);
    setInspectingBusiness(null);
  };

  const mapsNavUrl = inspectingBusiness.directionsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(inspectingBusiness.name + ' ' + inspectingBusiness.location.city)}`;
  const googleMapsUrl = inspectingBusiness.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inspectingBusiness.name + ' ' + inspectingBusiness.location.city)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header Banner with Real Photo */}
        <div className="relative bg-slate-900 text-white overflow-hidden">
          {inspectingBusiness.imageUrl && (
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <img
                src={inspectingBusiness.imageUrl}
                alt={inspectingBusiness.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="relative p-6 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
            <button
              onClick={() => setInspectingBusiness(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-white/20 shadow-xl shrink-0">
                  {inspectingBusiness.imageUrl ? (
                    <img
                      src={inspectingBusiness.imageUrl}
                      alt={inspectingBusiness.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black bg-indigo-600">
                      {inspectingBusiness.name.charAt(0)}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      {inspectingBusiness.name}
                    </h2>
                    {inspectingBusiness.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Business
                      </span>
                    )}
                    {inspectingBusiness.source === 'serpapi' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                        Live Google Discovery
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap font-medium">
                    <span className="font-mono px-2 py-0.5 bg-black/30 rounded border border-white/10">
                      ID: {inspectingBusiness.businessCode}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {inspectingBusiness.location.address || `${inspectingBusiness.location.area}, ${inspectingBusiness.location.city}`}
                    </span>
                    {inspectingBusiness.openStatus && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        {inspectingBusiness.openStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rating badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 text-center sm:text-right shrink-0">
                <div className="flex items-center gap-1 text-amber-300 font-black text-xl justify-center sm:justify-end">
                  <Star className="w-5 h-5 fill-amber-300" />
                  <span>{inspectingBusiness.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                  {inspectingBusiness.reviewCount} Google & Trade reviews
                </p>
              </div>
            </div>

            {/* Action Bar (Google Maps, Directions, Call, Khata) */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Categories:</span>
                {inspectingBusiness.roles.map(role => (
                  <span
                    key={role}
                    className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Direct Google Maps Directions Navigation Button */}
                <a
                  href={mapsNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions (Google Maps)
                </a>

                {/* Direct Khata Record Button */}
                <button
                  onClick={handleOpenKhata}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Khata / Record Udhaar
                </button>

                {/* Direct Call / WhatsApp */}
                <button
                  onClick={() => {
                    const phone = inspectingBusiness.phone.replace(/[^0-9]/g, '');
                    window.open(`https://wa.me/${phone}?text=Hello%20${encodeURIComponent(inspectingBusiness.name)},%20I%20found%20your%20business%20on%20BizLink.`, '_blank');
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 flex items-center gap-6 text-xs sm:text-sm font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'about'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Overview & Directions
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4" />
            Products & Catalog ({inspectingBusiness.products.length})
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'network'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Supply Chain Position
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Star className="w-4 h-4" />
            Reviews ({inspectingBusiness.reviews.length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Trust Score & Metrics Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Trust Score</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">{inspectingBusiness.trustScore}</span>
                    <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-semibold">Verified Location</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fulfillment</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-600">{inspectingBusiness.fulfillmentRate}%</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Reliable stock rate</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Min Order Value</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-slate-900">
                      ₹{(inspectingBusiness.minOrderValue || 200).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Flexible terms</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Price Level</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-indigo-600">{inspectingBusiness.priceLevel || '₹₹'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Direct fair pricing</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">About the Business</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70 font-medium">
                  {inspectingBusiness.description}
                </p>
              </div>

              {/* Google Maps Location & Navigation Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Google Maps Navigation</h5>
                    <p className="text-xs text-blue-900 mt-0.5 font-medium">
                      {inspectingBusiness.location.address || `${inspectingBusiness.location.area}, ${inspectingBusiness.location.city}`}
                    </p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Coordinates: {inspectingBusiness.location.lat.toFixed(4)}, {inspectingBusiness.location.lng.toFixed(4)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={mapsNavUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Open Turn-by-Turn GPS
                  </a>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-colors"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Contact Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact & Business Verification
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Manager: <strong className="text-slate-800">{inspectingBusiness.ownerName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>GSTIN / Code: <strong className="font-mono text-slate-800">{inspectingBusiness.gstNumber || inspectingBusiness.businessCode}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>Phone: <strong className="text-slate-800">{inspectingBusiness.phone}</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>Email: <strong className="text-slate-800">{inspectingBusiness.email}</strong></span>
                  </div>
                </div>
              </div>

              {/* Inquiry Form */}
              {!isMyBusiness && (
                <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-indigo-600" />
                    Send Direct Trade / Booking Inquiry
                  </h4>
                  <p className="text-xs text-indigo-700 mb-3">
                    Inquire about rates, availability, or commercial procurement from {inspectingBusiness.name}.
                  </p>
                  <form onSubmit={handleSendInquiry} className="flex gap-2">
                    <input
                      type="text"
                      value={inquiryText}
                      onChange={e => setInquiryText(e.target.value)}
                      placeholder="e.g. Inquiring about bulk discount / booking appointment..."
                      className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={isInquirySent}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0"
                    >
                      {isInquirySent ? 'Dispatched!' : 'Send Inquiry'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Products & Services Catalog</h4>
                  <p className="text-xs text-slate-500">Available items, trade packs, and unit pricing</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                  {inspectingBusiness.products.length} Items Listed
                </span>
              </div>

              {inspectingBusiness.products.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Catalog Available Directly at Store</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Contact or visit {inspectingBusiness.name} for the full inventory and personalized rates.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {inspectingBusiness.products.map(prod => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {prod.imageUrl && (
                          <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs sm:text-sm font-bold text-slate-900">{prod.name}</h5>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                            {prod.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">{prod.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-500 text-[11px]">Price: </span>
                          <strong className="text-slate-900 font-black text-sm">
                            ₹{prod.unitPrice.toLocaleString('en-IN')}
                          </strong>
                          <span className="text-slate-500 text-[11px]"> / {prod.unit}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-[11px]">Min Order: </span>
                          <strong className="text-slate-800 font-bold">{prod.moq} {prod.unit}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NETWORK */}
          {activeTab === 'network' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Supply Chain & Market Role</h4>
                <p className="text-xs text-slate-500">
                  How {inspectingBusiness.name} interacts across wholesale, retail, and consumer channels
                </p>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 font-semibold">
                  <span>UPSTREAM SUPPLIERS</span>
                  <span className="text-indigo-400 font-bold">DIGITAL TRADE CHAIN</span>
                  <span>DOWNSTREAM CLIENTS</span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="w-full md:w-1/3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 block mb-1">
                      Upstream Flow
                    </span>
                    <h5 className="text-xs font-bold text-white">Wholesalers & Depots</h5>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      Sources from {inspectingBusiness.purchasesFrom.join(', ') || 'Certified Manufacturers'}
                    </p>
                  </div>

                  <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block shrink-0" />

                  <div className="w-full md:w-1/3 bg-indigo-950/80 p-4 rounded-2xl border-2 border-indigo-500 text-center shadow-lg">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 block mb-1">
                      Active Business
                    </span>
                    <h5 className="text-sm font-black text-white">{inspectingBusiness.name}</h5>
                    <div className="flex justify-center gap-1 mt-1.5 flex-wrap">
                      {inspectingBusiness.roles.map(r => (
                        <span key={r} className="text-[10px] bg-indigo-600/90 px-2 py-0.5 rounded-md text-white font-bold">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-indigo-400 hidden md:block shrink-0" />

                  <div className="w-full md:w-1/3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block mb-1">
                      End Consumers & Buyers
                    </span>
                    <h5 className="text-xs font-bold text-white">Direct Customers</h5>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">
                      Serves local retail shoppers & contractors across {inspectingBusiness.location.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Google & Platform Reviews</h4>
                  <p className="text-xs text-slate-500">Real feedback from verified buyers and Google Maps users</p>
                </div>
                <div className="flex items-center gap-1.5 text-amber-500 font-black text-sm bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{inspectingBusiness.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 font-normal">({inspectingBusiness.reviewCount})</span>
                </div>
              </div>

              <div className="space-y-3">
                {inspectingBusiness.reviews.map(rev => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs sm:text-sm text-slate-900">{rev.authorName}</strong>
                          {rev.isVerifiedBuyer && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified Buyer
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {rev.authorRole || 'Customer'} • {rev.date}
                        </p>
                      </div>

                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(rev.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed italic font-medium">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Platform Code: <span className="font-mono font-bold text-slate-800">{inspectingBusiness.businessCode}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setInspectingBusiness(null)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleOpenKhata}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-sm transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              Add Khata Entry
            </button>

            {!isMyBusiness && !isAlreadySupplier && (
              <button
                onClick={() => {
                  addSupplierToNetwork(inspectingBusiness);
                  setInspectingBusiness(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Connect Supplier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
