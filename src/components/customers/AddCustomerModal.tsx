'use client';

import React, { useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Customer } from '@/lib/db/schema';
import { UserPlus, X, CheckCircle2 } from 'lucide-react';

export function AddCustomerModal() {
  const {
    isAddCustomerModalOpen,
    setIsAddCustomerModalOpen,
    showToast,
    triggerRefresh,
  } = useVyapar();

  const emptyCustomerForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Local',
    notes: '',
    openingBalance: 0,
    creditLimit: 5000,
  };

  const [form, setForm] = useState(emptyCustomerForm);

  React.useEffect(() => {
    if (isAddCustomerModalOpen) {
      setForm(emptyCustomerForm);
    }
  }, [isAddCustomerModalOpen]);

  if (!isAddCustomerModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      showToast('Validation Error', 'Customer name and phone number are required.', 'warning');
      return;
    }

    try {
      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const newCustomer: Customer = {
        id: customerId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        notes: form.notes.trim() || undefined,
        currentBalance: Number(form.openingBalance) || 0,
        creditLimit: Number(form.creditLimit) || 5000,
        marketingConsent: true,
        createdAt: now,
        updatedAt: now,
      };

      await db.transaction('rw', [db.customers, db.customerLedger, db.auditLogs], async () => {
        await db.customers.add(newCustomer);

        if (newCustomer.currentBalance > 0) {
          await db.customerLedger.add({
            id: `cl_open_${customerId}`,
            customerId,
            customerName: newCustomer.name,
            date: now,
            type: 'OPENING_BALANCE',
            debit: newCustomer.currentBalance,
            credit: 0,
            balanceAfter: newCustomer.currentBalance,
            description: 'Opening balance (Previous Udhaar)',
            createdAt: now,
          });
        }
      });

      showToast('Customer Registered', `${newCustomer.name} added to Bahi Khata.`, 'success');
      setIsAddCustomerModalOpen(false);
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'Local',
        notes: '',
        openingBalance: 0,
        creditLimit: 5000,
      });
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add customer.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation my-auto text-slate-900 dark:text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Register Customer</h3>
              <p className="text-[11px] text-slate-400">Add profile to Digital Bahi Khata</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddCustomerModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Customer Full Name *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Sunil Verma"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="10-digit mobile"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Address / Locality (Optional)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="House / Shop address"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Opening Udhaar (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.openingBalance}
                onChange={(e) => setForm({ ...form, openingBalance: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-amber-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Credit Limit (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.creditLimit}
                onChange={(e) => setForm({ ...form, creditLimit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Regular milk & tea buyer"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddCustomerModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Customer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
