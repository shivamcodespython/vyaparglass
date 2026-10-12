'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, recordSupplierPayment } from '@/lib/db/db';
import { Supplier, SupplierLedgerEntry } from '@/lib/db/schema';
import {
  Truck,
  Plus,
  Search,
  Phone,
  IndianRupee,
  FileText,
  X,
  CheckCircle2,
} from 'lucide-react';

export function SuppliersView() {
  const { formatCurrency, refreshTrigger, triggerRefresh, showToast } = useVyapar();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Add Supplier Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSup, setNewSup] = useState({
    name: '',
    phone: '',
    email: '',
    gstin: '',
    address: '',
    openingBalance: 0,
  });

  // Pay Supplier Modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [payRef, setPayRef] = useState('');

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const list = await db.suppliers.toArray();
        setSuppliers(list);
      } catch (err) {
        console.error(err);
      }
    }
    loadSuppliers();
  }, [refreshTrigger]);

  const filteredSuppliers = suppliers.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.phone.includes(q);
    }
    return true;
  });

  const totalPayables = suppliers.reduce(
    (sum, s) => sum + (s.currentBalance > 0 ? s.currentBalance : 0),
    0
  );

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSup.name.trim()) return;

    try {
      const id = `sup_${Date.now()}`;
      const now = new Date().toISOString();
      const sup: Supplier = {
        id,
        name: newSup.name.trim(),
        phone: newSup.phone.trim(),
        email: newSup.email.trim() || undefined,
        gstin: newSup.gstin.trim() || undefined,
        address: newSup.address.trim() || undefined,
        currentBalance: Number(newSup.openingBalance) || 0,
        createdAt: now,
        updatedAt: now,
      };

      await db.transaction('rw', [db.suppliers, db.supplierLedger, db.auditLogs], async () => {
        await db.suppliers.add(sup);
        if (sup.currentBalance > 0) {
          await db.supplierLedger.add({
            id: `sl_open_${id}`,
            supplierId: id,
            supplierName: sup.name,
            date: now,
            type: 'OPENING_BALANCE',
            amount: sup.currentBalance,
            balanceAfter: sup.currentBalance,
            description: 'Opening balance payable',
            createdAt: now,
          });
        }
      });

      showToast('Supplier Added', `${sup.name} registered.`, 'success');
      setIsAddOpen(false);
      setNewSup({ name: '', phone: '', email: '', gstin: '', address: '', openingBalance: 0 });
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add supplier.', 'error');
    }
  };

  const handlePaySupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingSupplier || payAmount <= 0) return;

    try {
      await recordSupplierPayment({
        supplierId: payingSupplier.id,
        amount: payAmount,
        paymentMode: payMode,
        referenceNo: payRef,
      });

      showToast('Payment Recorded', `Paid ₹${payAmount} to ${payingSupplier.name}.`, 'success');
      setPayingSupplier(null);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to record supplier payment.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Suppliers</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {suppliers.length} Registered Suppliers
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Wholesale and distributor vendors</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Supplier Payables</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalPayables)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Outstanding amounts we owe to suppliers</p>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by name or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Supplier</span>
        </button>
      </div>

      {/* Supplier List */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Supplier Name</th>
                <th className="py-3 px-3 font-semibold">Phone & Contact</th>
                <th className="py-3 px-3 font-semibold">GSTIN</th>
                <th className="py-3 px-3 font-semibold text-right">Outstanding Payable</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No suppliers registered yet. Click "+ Add Supplier" to add suppliers.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {s.phone}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      {s.gstin || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-black font-mono text-sm ${
                          s.currentBalance > 0 ? 'text-amber-600' : 'text-slate-600'
                        }`}
                      >
                        {formatCurrency(s.currentBalance)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.currentBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayingSupplier(s);
                            setPayAmount(s.currentBalance);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 transition-colors"
                        >
                          Pay Supplier
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold">Add Wholesale Supplier</h4>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Supplier Business Name *</label>
                <input
                  type="text"
                  required
                  value={newSup.name}
                  onChange={(e) => setNewSup({ ...newSup, name: e.target.value })}
                  placeholder="e.g. Ambala Wholesale Traders"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newSup.phone}
                    onChange={(e) => setNewSup({ ...newSup, phone: e.target.value })}
                    placeholder="Mobile"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={newSup.gstin}
                    onChange={(e) => setNewSup({ ...newSup, gstin: e.target.value.toUpperCase() })}
                    placeholder="GSTIN"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Opening Payable (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={newSup.openingBalance}
                  onChange={(e) => setNewSup({ ...newSup, openingBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {payingSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold">Pay Supplier: {payingSupplier.name}</h4>
              <button onClick={() => setPayingSupplier(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handlePaySupplier} className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border text-amber-700 dark:text-amber-300 flex justify-between">
                <span>Total Amount Owed:</span>
                <span className="font-bold">{formatCurrency(payingSupplier.currentBalance)}</span>
              </div>
              <div>
                <label className="block font-semibold mb-1">Amount to Pay (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
                >
                  <option value="UPI">UPI (GPay / PhonePe)</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer (IMPS / NEFT)</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingSupplier(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
