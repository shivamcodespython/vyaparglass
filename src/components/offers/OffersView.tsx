'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { OfferPromotion, Customer, CommunicationLog } from '@/lib/db/schema';
import {
  Tag,
  Plus,
  MessageSquare,
  Smartphone,
  Share2,
  Calendar,
  Users,
  CheckCircle2,
  X,
  AlertCircle,
  Copy,
} from 'lucide-react';

export function OffersView() {
  const { storeProfile, showToast, refreshTrigger, triggerRefresh } = useVyapar();

  const [offers, setOffers] = useState<OfferPromotion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);

  const [newOffer, setNewOffer] = useState({
    title: '',
    description: '',
    discountType: 'FLAT' as 'FLAT' | 'PERCENT',
    discountValue: 50,
    targetAudience: 'ALL' as 'ALL' | 'FREQUENT_BUYERS' | 'DUE_CLEARERS',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
  });

  const [sharingOffer, setSharingOffer] = useState<OfferPromotion | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const offList = await db.offers.toArray();
        setOffers(offList);
        const custList = await db.customers.toArray();
        setCustomers(custList);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [refreshTrigger]);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title.trim()) return;

    try {
      const id = `offer_${Date.now()}`;
      await db.offers.add({
        id,
        title: newOffer.title.trim(),
        description: newOffer.description.trim(),
        discountType: newOffer.discountType,
        discountValue: Number(newOffer.discountValue) || 0,
        targetAudience: newOffer.targetAudience,
        startDate: newOffer.startDate,
        expiryDate: newOffer.expiryDate,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });

      showToast('Offer Created', `Promotional deal "${newOffer.title}" activated.`, 'success');
      setIsAddOfferOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to create offer.', 'error');
    }
  };

  const handleShareWhatsApp = (offer: OfferPromotion) => {
    const text = `🎉 *Special Store Offer from ${storeProfile?.storeName || 'Vyapar Retail Mart'}*!\n\n*${
      offer.title
    }*\n${offer.description}\n\nValid till: ${new Date(offer.expiryDate).toLocaleDateString(
      'en-IN'
    )}\nVisit us at ${storeProfile?.address || 'our store'}.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Messaging Transparency Alert */}
      <div className="p-4 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 text-xs text-sky-900 dark:text-sky-200">
        <span className="font-bold block">Honest Messaging Fallback:</span>
        <p className="text-[11px] mt-0.5 leading-relaxed">
          Because this is an offline-first client application, automatic cloud SMS delivery requires a third-party SMS API gateway (e.g. Fast2SMS / MSG91). By default, VyaparGlass generates standard WhatsApp & device SMS links for manual delivery without any API costs.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Promotional Offers</h3>
          <p className="text-xs text-slate-400">Create discounts and broadcast to customers</p>
        </div>
        <button
          onClick={() => setIsAddOfferOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Offer</span>
        </button>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {offers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">
            No active promotional offers. Click "+ Create Offer" to craft a special deal!
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {offer.discountType === 'FLAT' ? `Flat ₹${offer.discountValue} Off` : `${offer.discountValue}% Discount`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Valid till {new Date(offer.expiryDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{offer.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Target: {offer.targetAudience}
                </span>

                <button
                  onClick={() => handleShareWhatsApp(offer)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Offer Modal */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold">Create Promotional Offer</h4>
              <button onClick={() => setIsAddOfferOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOffer} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={newOffer.title}
                  onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                  placeholder="e.g. Weekend Grocery Bonanza: Flat ₹50 Off"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Offer Description</label>
                <textarea
                  rows={2}
                  value={newOffer.description}
                  onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                  placeholder="Details of terms, minimum purchase, etc."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Discount Type</label>
                  <select
                    value={newOffer.discountType}
                    onChange={(e) => setNewOffer({ ...newOffer, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
                  >
                    <option value="FLAT">Flat ₹ Amount</option>
                    <option value="PERCENT">Percentage %</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    min={1}
                    value={newOffer.discountValue}
                    onChange={(e) => setNewOffer({ ...newOffer, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newOffer.startDate}
                    onChange={(e) => setNewOffer({ ...newOffer, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newOffer.expiryDate}
                    onChange={(e) => setNewOffer({ ...newOffer, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOfferOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Activate Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
