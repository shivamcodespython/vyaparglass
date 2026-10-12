'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Search,
  Download,
  ShieldCheck,
  Send,
  Phone,
  IndianRupee,
  Share2,
  Check,
} from 'lucide-react';

export function LedgerView() {
  const {
    transactions,
    settleTransaction,
    setIsAddTransactionModalOpen,
    myBusiness,
    currentUser,
    showToast,
  } = useBizLink();

  const [filterType, setFilterType] = useState<'All' | 'Credit' | 'Debit'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Settled'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Computations
  const totalReceivables = transactions
    .filter(t => t.type === 'Debit' && t.status === 'Pending') // Udhaar given (You'll get)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayables = transactions
    .filter(t => t.type === 'Credit' && t.status === 'Pending') // Jama received / advance owed
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSettled = transactions
    .filter(t => t.status === 'Settled')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalReceivables - totalPayables;

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (filterType !== 'All' && t.type !== filterType) return false;
    if (filterStatus !== 'All' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.businessName?.toLowerCase().includes(q) ||
        t.customerName?.toLowerCase().includes(q) ||
        t.invoiceNumber?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sendWhatsAppReminder = (tx: typeof transactions[0]) => {
    const text = `Namaste ${tx.customerName || tx.businessName}, this is a gentle reminder regarding the outstanding balance of Rs. ${tx.amount.toLocaleString('en-IN')} for (${tx.description || 'Store purchase'}) due on ${tx.dueDate}. Sent via BizLink Khata.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    showToast('Reminder Generated', 'Opening WhatsApp to send payment reminder.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              Khata Bahi & Credit-Debit History
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Digital Udhaar & Jama ledger book between {currentUser.businessName || 'your business'} and customers
          </p>
        </div>

        <button
          onClick={() => setIsAddTransactionModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Record Udhaar / Jama
        </button>
      </div>

      {/* Financial Summary Cards (Indian Khata Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* You Will Receive (Udhaar Baaki) */}
        <div className="bg-emerald-50/70 p-5 rounded-3xl border border-emerald-200 shadow-subtle">
          <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
            You Will Get (Udhaar Baaki)
          </span>
          <div className="text-2xl font-black text-emerald-700 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-6 h-6 text-emerald-600" />
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600/90 font-medium mt-1">Pending payments from customers</p>
        </div>

        {/* You Will Give */}
        <div className="bg-rose-50/70 p-5 rounded-3xl border border-rose-200 shadow-subtle">
          <span className="text-xs font-black text-rose-800 uppercase tracking-wider block">
            You Will Give (Payables)
          </span>
          <div className="text-2xl font-black text-rose-700 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-6 h-6 text-rose-600" />
            ₹{totalPayables.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-rose-600/90 font-medium mt-1">Advance / Supplier balance</p>
        </div>

        {/* Net Khata Balance */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Net Khata Balance
          </span>
          <div className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            ₹{netBalance.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Overall position</p>
        </div>

        {/* Settled Volume */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-subtle">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Settled Completed
          </span>
          <div className="text-2xl font-black text-indigo-600 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-6 h-6 text-indigo-500" />
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Fully paid transactions</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search party or bill..."
              className="pl-9 pr-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none w-60 font-medium"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Debit', 'Credit'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type === 'All' ? 'All Entries' : type === 'Debit' ? 'Udhaar (Given)' : 'Jama (Got)'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Pending', 'Settled'] as const).map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-500 font-bold">
          Showing {filtered.length} entries
        </span>
      </div>

      {/* Khata Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider text-[11px]">
                <th className="p-4">Date</th>
                <th className="p-4">Party (Customer / Shop)</th>
                <th className="p-4">Entry Type</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Bill Ref</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map(tx => {
                const partyName = tx.customerName || tx.businessName;
                const isUdhaar = tx.type === 'Debit';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 text-slate-600 font-mono font-medium">{tx.date}</td>
                    <td className="p-4">
                      <strong className="text-slate-900 font-bold text-sm block">{partyName}</strong>
                      <span className="text-[11px] text-slate-500">{tx.description}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black ${
                          isUdhaar
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {isUdhaar ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {isUdhaar ? 'Udhaar (Gave)' : 'Jama (Received)'}
                      </span>
                    </td>
                    <td className={`p-4 font-mono font-black text-sm ${isUdhaar ? 'text-rose-700' : 'text-emerald-700'}`}>
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-600 font-mono">{tx.dueDate}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-black ${
                          tx.status === 'Settled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{tx.invoiceNumber}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {tx.status === 'Pending' && isUdhaar && (
                          <button
                            onClick={() => sendWhatsAppReminder(tx)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-emerald-200"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="w-3 h-3" />
                            Reminder
                          </button>
                        )}
                        {tx.status === 'Pending' && (
                          <button
                            onClick={() => settleTransaction(tx.id)}
                            className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-emerald-600 hover:text-white text-indigo-700 text-xs font-bold transition-all border border-indigo-100"
                          >
                            Mark Settled
                          </button>
                        )}
                        {tx.status === 'Settled' && (
                          <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold">
                            <Check className="w-4 h-4" /> Paid
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
