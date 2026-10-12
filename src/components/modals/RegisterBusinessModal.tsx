'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { X, Building2, User, Check, Sparkles, MapPin, Store, Utensils, Scissors, Wrench, Shirt, ShoppingBag, Laptop, ShieldCheck } from 'lucide-react';
import { BusinessRole, AccountType } from '@/types';

const UNIVERSAL_CATEGORIES = [
  { name: 'Bakery & Food', icon: '🥐', role: 'Bakery & Food' as BusinessRole },
  { name: 'Cafe & Restaurant', icon: '☕', role: 'Cafe & Restaurant' as BusinessRole },
  { name: 'Grocery & Kirana', icon: '🛒', role: 'Grocery & Supermarket' as BusinessRole },
  { name: 'Clothing & Fashion', icon: '👗', role: 'Clothing & Apparel' as BusinessRole },
  { name: 'Beauty Parlour & Salon', icon: '💄', role: 'Beauty Parlour & Salon' as BusinessRole },
  { name: 'Mechanic & Auto Spare Parts', icon: '🔧', role: 'Auto Spare Parts & Mechanic' as BusinessRole },
  { name: 'Electronics & Mobiles', icon: '⚡', role: 'Electronics & Appliances' as BusinessRole },
  { name: 'Sanitary & Hardware', icon: '🚰', role: 'Sanitary & Hardware' as BusinessRole },
  { name: 'Stationery & Books', icon: '📚', role: 'Stationery & Books' as BusinessRole },
  { name: 'Shoes & Footwear', icon: '👟', role: 'Footwear & Shoes' as BusinessRole },
  { name: 'Pharmacy & Medical', icon: '💊', role: 'Medical & Pharmacy' as BusinessRole },
  { name: 'Wholesale & Distribution Depot', icon: '📦', role: 'Wholesaler' as BusinessRole },
  { name: 'Factory & Manufacturer', icon: '🏭', role: 'Manufacturer' as BusinessRole },
];

export function RegisterBusinessModal() {
  const {
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    registerNewAccount,
    setDashboardView,
  } = useBizLink();

  const [accountType, setAccountType] = useState<AccountType>('businessman');
  const [selectedRole, setSelectedRole] = useState<BusinessRole>('Bakery & Food');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Ambala',
    address: '',
    businessName: '',
    gstNumber: '',
    description: '',
  });

  const [createdSuccess, setCreatedSuccess] = useState<boolean>(false);

  if (!isRegisterModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerNewAccount({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      accountType: accountType,
      city: formData.city,
      businessName: accountType === 'businessman' ? (formData.businessName || `${formData.name}'s Enterprise`) : undefined,
      businessRole: accountType === 'businessman' ? selectedRole : undefined,
      category: accountType === 'businessman' ? selectedRole : 'Consumer',
      gstNumber: formData.gstNumber,
      address: formData.address,
    });
    setCreatedSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/90 text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Create Account / Register Business</h3>
              <p className="text-xs text-indigo-200 font-medium">
                Universal directory, live Google search & Khata bahi ledger
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsRegisterModalOpen(false);
              setCreatedSuccess(false);
            }}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {createdSuccess ? (
            <div className="text-center py-8 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">Account Ready!</h4>
                <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                  {accountType === 'businessman'
                    ? `Your business profile "${formData.businessName || formData.name}" has been registered. You can now discover suppliers, accept customer inquiries, and track Khata credit/debit.`
                    : `Your individual customer account is active. You can search any shop worldwide, get Google Maps directions, and manage your store credit.`}
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setIsRegisterModalOpen(false);
                    setCreatedSuccess(false);
                    setDashboardView('overview');
                  }}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-xl hover:shadow-indigo-500/25 transition-all"
                >
                  Enter Platform
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Choose Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('businessman')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      accountType === 'businessman'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${accountType === 'businessman' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Businessman / Store Owner</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Bakery, Salon, Mechanic, Grocery, Cafe, Trader, Factory
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('individual')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                      accountType === 'individual'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${accountType === 'individual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black">Individual / Customer</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Find local shops, get directions & track your purchases/khata
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Businessman Category Selector */}
              {accountType === 'businessman' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    2. Select Your Business Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1.5 border border-slate-200 rounded-2xl bg-slate-50/50">
                    {UNIVERSAL_CATEGORIES.map(cat => {
                      const isSelected = selectedRole === cat.role;
                      return (
                        <button
                          type="button"
                          key={cat.name}
                          onClick={() => setSelectedRole(cat.role)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left border flex items-center gap-2 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <span className="truncate">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Personal & Business Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Vikram Malhotra"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  {accountType === 'businessman' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Business / Shop Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Royal Bakery & Cafe"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Ambala, Delhi, Mumbai, New York"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98000 00000"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="user@enterprise.com"
                      className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {accountType === 'businessman' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Ambala"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        GSTIN / Tax ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        placeholder="06AACXX0000A1Z5"
                        className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Create Account & Enter
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
