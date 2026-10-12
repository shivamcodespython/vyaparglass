'use client';

import React, { useState, useEffect } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { X, Receipt, ArrowDownRight, ArrowUpRight, IndianRupee, User, Store, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export function AddTransactionModal() {
  const {
    isAddTransactionModalOpen,
    setIsAddTransactionModalOpen,
    businesses,
    addTransaction,
    prefilledTxBusiness,
    setPrefilledTxBusiness,
  } = useBizLink();

  const [txType, setTxType] = useState<'Credit' | 'Debit'>('Debit'); // Default: Udhaar (You gave)
  const [partnerMode, setPartnerMode] = useState<'select' | 'custom'>('select');
  const [selectedBizId, setSelectedBizId] = useState(businesses[1]?.id || '');
  const [customPartnerName, setCustomPartnerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`KHATA-${Date.now().toString().substring(7)}`);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [category, setCategory] = useState('Store Purchase / Khata');
  const [paymentMode, setPaymentMode] = useState<'Credit / Udhaar' | 'Cash' | 'UPI' | 'Bank Transfer'>('Credit / Udhaar');

  useEffect(() => {
    if (prefilledTxBusiness) {
      setSelectedBizId(prefilledTxBusiness.id);
      setPartnerMode('select');
      setDescription(`Store credit / purchase with ${prefilledTxBusiness.name}`);
    }
  }, [prefilledTxBusiness]);

  if (!isAddTransactionModalOpen) return null;

  const selectedBiz = businesses.find(b => b.id === selectedBizId) || businesses[0];
  const partnerDisplayName = partnerMode === 'custom' && customPartnerName ? customPartnerName : (selectedBiz?.name || 'Local Customer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      businessId: partnerMode === 'select' ? (selectedBiz?.id || 'biz_custom') : `cust_${Date.now()}`,
      businessName: partnerDisplayName,
      businessRole: partnerMode === 'select' ? (selectedBiz?.primaryRole || 'Retailer') : 'Customer',
      customerName: partnerDisplayName,
      type: txType,
      amount: Number(amount),
      status: 'Pending',
      invoiceNumber: invoiceNumber || `TX-${Date.now().toString().substring(6)}`,
      description: description || `${txType === 'Debit' ? 'Udhaar / Gave goods on credit' : 'Jama / Received payment'} - ${partnerDisplayName}`,
      dueDate: dueDate,
      category: category,
      paymentMode: paymentMode,
    });

    setPrefilledTxBusiness(null);
    setIsAddTransactionModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Record Khata / Credit-Debit</h3>
              <p className="text-xs text-indigo-200">Track Udhaar & Jama history for any customer or shop</p>
            </div>
          </div>
          <button
            onClick={() => {
              setPrefilledTxBusiness(null);
              setIsAddTransactionModalOpen(false);
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle: Debit (You Gave / Udhaar) vs Credit (You Got / Jama) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Entry Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTxType('Debit')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  txType === 'Debit'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 ring-2 ring-rose-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-rose-950">You Gave (Udhaar)</p>
                  <p className="text-[11px] text-rose-600 font-medium">Customer owes you</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTxType('Credit')}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  txType === 'Credit'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-950">You Got (Jama)</p>
                  <p className="text-[11px] text-emerald-600 font-medium">Payment received</p>
                </div>
              </button>
            </div>
          </div>

          {/* Party Selection (Discovered Business or Custom Name) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Customer / Shop Name
              </label>
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPartnerMode('select')}
                  className={`px-2 py-0.5 rounded-md ${partnerMode === 'select' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
                >
                  From Directory
                </button>
                <button
                  type="button"
                  onClick={() => setPartnerMode('custom')}
                  className={`px-2 py-0.5 rounded-md ${partnerMode === 'custom' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}
                >
                  Custom Name
                </button>
              </div>
            </div>

            {partnerMode === 'select' ? (
              <select
                value={selectedBizId}
                onChange={e => setSelectedBizId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              >
                {businesses.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.primaryRole} · {b.location.city})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={customPartnerName}
                onChange={e => setCustomPartnerName(e.target.value)}
                placeholder="e.g. Ramesh Verma / City Cafe"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            )}
          </div>

          {/* Amount & Payment Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Amount (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-7 pr-3 py-2.5 text-xs font-black text-slate-900 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-semibold"
              >
                <option value="Credit / Udhaar">Credit / Udhaar</option>
                <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / IMPS</option>
              </select>
            </div>
          </div>

          {/* Due Date & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Return / Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category / Tag</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
              >
                <option value="Store Purchase / Khata">Store Purchase / Khata</option>
                <option value="Bakery & Food Orders">Bakery & Food Orders</option>
                <option value="Salon & Beauty Services">Salon & Beauty Services</option>
                <option value="Auto Parts & Mechanic">Auto Parts & Mechanic</option>
                <option value="Electronics & Repairs">Electronics & Repairs</option>
                <option value="Grocery / Daily Ration">Grocery / Daily Ration</option>
                <option value="Wholesale Lot Procurement">Wholesale Lot Procurement</option>
              </select>
            </div>
          </div>

          {/* Items / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Items / Bill Details</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. 2 Cakes, 1 Sourdough Bread or Front Brake Pad replacement..."
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setPrefilledTxBusiness(null);
                setIsAddTransactionModalOpen(false);
              }}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save to Khata Bahi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
