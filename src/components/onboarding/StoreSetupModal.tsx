'use client';

import React, { useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { saveStoreProfile, seedDemoData } from '@/lib/db/db';
import { StoreProfile } from '@/lib/db/schema';
import {
  Store,
  ShieldCheck,
  Sparkles,
  Upload,
  ArrowRight,
  CheckCircle2,
  Lock,
  IndianRupee,
  Receipt,
  Info,
} from 'lucide-react';

export function StoreSetupModal() {
  const { isFirstRun, setIsFirstRun, updateStoreProfile, showToast, triggerRefresh } = useVyapar();
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    storeName: 'Vyapar Retail Mart',
    ownerName: 'Rajesh Sharma',
    phone: '9876543210',
    email: '',
    address: 'Shop No. 12, Main Bazaar',
    city: 'Ambala',
    state: 'Haryana',
    pincode: '133001',
    category: 'Grocery & FMCG Store',
    currency: '₹',
    currencyCode: 'INR',
    gstin: '',
    taxEnabled: true,
    defaultTaxRate: 5,
    appPin: '1234',
    pinRequired: true,
    autoLockMinutes: 15,
    allowNegativeStock: false,
    receiptHeader: 'Thank you for shopping with us! Fresh groceries & daily needs.',
    receiptFooter: 'Goods once sold can be returned within 3 days with bill. Visit again!',
    upiId: 'shopkeeper@okaxis',
  });

  if (!isFirstRun) return null;

  const handleDemoStart = async () => {
    try {
      await seedDemoData();
      setIsFirstRun(false);
      triggerRefresh();
      showToast('Store Ready', 'Demo retail store initialized with sample products and ledgers.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to seed sample store.', 'error');
    }
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName.trim() || !formData.ownerName.trim()) {
      showToast('Validation Error', 'Please enter store name and owner name.', 'warning');
      return;
    }

    try {
      const newProfile: StoreProfile = {
        id: 'primary_store',
        appName: 'VyaparGlass',
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveStoreProfile(newProfile);
      await updateStoreProfile(newProfile);
      setIsFirstRun(false);
      triggerRefresh();
      showToast('Store Registered', `Welcome to VyaparGlass, ${formData.ownerName}!`, 'success');
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to save store profile.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-3xl shadow-elevation p-6 sm:p-8 my-8 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-500 text-white flex items-center justify-center font-bold text-xl shadow-glass">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">Register Your Retail Store</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Step {step} of 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Setup your store profile, POS preferences, and local security PIN.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoStart}
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/30 flex items-center gap-1.5 transition-all"
            title="Pre-populate with sample Indian retail products, customers & bills"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Store
          </button>
        </div>

        {/* Local-First Transparency Banner */}
        <div className="my-4 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Local-First Architecture:</strong> All inventory, customer khata, and billing records are stored locally in your device's persistent IndexedDB storage. No confidential financial figures leave this device.
          </p>
        </div>

        <form onSubmit={handleSaveStore} className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.storeName}
                    onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                    placeholder="e.g. Sharma General Store"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="store@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Retail Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="Grocery & FMCG Store">Grocery & Kirana Store</option>
                    <option value="Electronics & Hardware">Electronics & Hardware</option>
                    <option value="Clothing & Apparel">Clothing & Garments</option>
                    <option value="Medical & Pharmacy">Medical & Pharmacy</option>
                    <option value="Stationery & Books">Stationery & Book Depot</option>
                    <option value="Bakery & Sweets">Bakery & Confectionery</option>
                    <option value="Footwear & Accessories">Footwear & Bags</option>
                    <option value="General Retail">General Retail Store</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shop Address & Locality
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Shop #, Street / Market"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <span>Next: Tax, Bill & Security</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="15-digit GSTIN (e.g. 06AAAAA0000A1Z5)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Tax Rate (GST %)
                  </label>
                  <select
                    value={formData.defaultTaxRate}
                    onChange={(e) => setFormData({ ...formData, defaultTaxRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value={0}>0% (Exempted / Non-GST)</option>
                    <option value={5}>5% (Essential Goods)</option>
                    <option value={12}>12% (Standard FMCG)</option>
                    <option value={18}>18% (General Retail / Hardware)</option>
                    <option value={28}>28% (Luxury / Auto Parts)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shop UPI ID for QR Bill Payments
                  </label>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                    placeholder="e.g. shopkeeper@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used to generate live UPI payment QR codes on print receipts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>4-Digit App Security PIN *</span>
                    <span className="text-[10px] text-indigo-500">Default: 1234</span>
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={formData.appPin}
                    onChange={(e) => setFormData({ ...formData, appPin: e.target.value.replace(/\D/g, '') })}
                    placeholder="1234"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm tracking-widest text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Protects the app from unauthorized access on this device.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Header Note
                </label>
                <input
                  type="text"
                  value={formData.receiptHeader}
                  onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                  placeholder="Thank you for shopping with us!"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Receipt Footer Policy
                </label>
                <input
                  type="text"
                  value={formData.receiptFooter}
                  onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                  placeholder="Goods once sold can be returned within 3 days."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Back
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Setup & Open Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
