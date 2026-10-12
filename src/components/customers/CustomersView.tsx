'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Customer, CustomerLedgerEntry } from '@/lib/db/schema';
import {
  Users,
  Plus,
  Search,
  IndianRupee,
  Phone,
  MessageSquare,
  FileText,
  Clock,
  Printer,
  X,
  Share2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function CustomersView() {
  const {
    formatCurrency,
    refreshTrigger,
    setIsAddCustomerModalOpen,
    setIsRecordPaymentModalOpen,
    storeProfile,
    showToast,
  } = useVyapar();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<Customer | null>(null);
  const [customerLedger, setCustomerLedger] = useState<CustomerLedgerEntry[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const list = await db.customers.toArray();
        setCustomers(list);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    }
    loadCustomers();
  }, [refreshTrigger]);

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    }
    return true;
  });

  const totalUdhaarReceivable = customers.reduce(
    (sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0),
    0
  );

  const dueCustomersCount = customers.filter((c) => c.currentBalance > 0).length;

  const handleOpenLedger = async (cust: Customer) => {
    setSelectedLedgerCustomer(cust);
    try {
      const entries = await db.customerLedger
        .where('customerId')
        .equals(cust.id)
        .reverse()
        .sortBy('date');
      setCustomerLedger(entries);
    } catch (err) {
      console.error(err);
    }
  };

  const generateWhatsAppReminder = (cust: Customer) => {
    const text = `Namaste ${cust.name} ji,\nThis is a gentle payment reminder from *${
      storeProfile?.storeName || 'Vyapar Store'
    }*.\nYour current outstanding balance is *₹${cust.currentBalance}*.\nKindly clear the dues at your earliest convenience via UPI or cash.\n\nUPI ID: ${
      storeProfile?.upiId || 'shop@upi'
    }\nDhanyawad!`;

    const cleanPhone = cust.phone.replace(/\D/g, '');
    const url = cleanPhone
      ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Dues Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Khata Customers</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {customers.length} Customers
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Registered customer profiles</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Udhaar Receivables</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalUdhaarReceivable)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending collection from customers</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Customers with Outstanding Dues</span>
          <h3 className="text-xl font-black text-rose-500 mt-1">
            {dueCustomersCount} Accounts
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Active credit accounts</p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name or phone number..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRecordPaymentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            <span>Record Jama (Payment)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer Name</th>
                <th className="py-3 px-3 font-semibold">Phone Number</th>
                <th className="py-3 px-3 font-semibold">Address / Notes</th>
                <th className="py-3 px-3 font-semibold text-right">Outstanding Balance (Udhaar)</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No customers registered yet. Click "+ Add Customer" to create customer profiles.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const hasDue = cust.currentBalance > 0;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 dark:text-white leading-tight">
                          {cust.name}
                        </p>
                        <p className="text-[10px] text-slate-400">ID: {cust.id.substring(0, 12)}</p>
                      </td>

                      <td className="py-3 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {cust.phone}
                      </td>

                      <td className="py-3 px-3 text-slate-500 max-w-xs truncate">
                        {cust.address || cust.notes || '-'}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span
                          className={`font-black font-mono text-sm ${
                            hasDue ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-500'
                          }`}
                        >
                          {formatCurrency(cust.currentBalance)}
                        </span>
                        {hasDue && (
                          <span className="block text-[9px] text-amber-500 font-bold uppercase">
                            You'll get (Udhaar)
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenLedger(cust)}
                            title="View Complete Bahi Khata Ledger"
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Khata</span>
                          </button>

                          {hasDue && (
                            <button
                              type="button"
                              onClick={() => generateWhatsAppReminder(cust)}
                              title="Send WhatsApp Payment Reminder"
                              className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Bahi Khata Modal */}
      {selectedLedgerCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    Digital Bahi Khata: {selectedLedgerCustomer.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Phone: {selectedLedgerCustomer.phone} • Current Due:{' '}
                    <span className="font-bold text-amber-600">
                      {formatCurrency(selectedLedgerCustomer.currentBalance)}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedLedgerCustomer(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chronological Signed Ledger Entries */}
              <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {customerLedger.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No transactions recorded for this customer yet.
                  </p>
                ) : (
                  customerLedger.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              entry.debit > 0
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {entry.type}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {entry.description}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(entry.date).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="text-right">
                        {entry.debit > 0 ? (
                          <span className="font-mono font-bold text-amber-600 text-sm">
                            +₹{entry.debit} (Udhaar)
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-emerald-600 text-sm">
                            -₹{entry.credit} (Jama)
                          </span>
                        )}
                        <p className="text-[10px] text-slate-400">
                          Balance after: ₹{entry.balanceAfter}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLedgerCustomer(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
