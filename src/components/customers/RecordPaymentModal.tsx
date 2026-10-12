'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, recordCustomerPayment } from '@/lib/db/db';
import { Customer } from '@/lib/db/schema';
import { IndianRupee, X, CheckCircle2, Wallet, User } from 'lucide-react';

export function RecordPaymentModal() {
  const {
    isRecordPaymentModalOpen,
    setIsRecordPaymentModalOpen,
    showToast,
    triggerRefresh,
    formatCurrency,
  } = useVyapar();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque'>('Cash');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const list = await db.customers.toArray();
        setCustomers(list);
        // Default to first customer with positive balance if available
        const dueCust = list.find((c) => c.currentBalance > 0);
        if (dueCust) {
          setSelectedCustomerId(dueCust.id);
          setAmount(dueCust.currentBalance);
        } else if (list.length > 0) {
          setSelectedCustomerId(list[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isRecordPaymentModalOpen) {
      loadCustomers();
    }
  }, [isRecordPaymentModalOpen]);

  if (!isRecordPaymentModalOpen) return null;

  const currentCust = customers.find((c) => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      showToast('Validation Error', 'Please select a customer.', 'warning');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Validation Error', 'Please enter a valid payment amount.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await recordCustomerPayment({
        customerId: selectedCustomerId,
        amount,
        paymentMode,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      showToast(
        'Payment Recorded (Jama)',
        `Recorded ₹${amount} received from ${currentCust?.name || 'Customer'}.`,
        'success'
      );
      setIsRecordPaymentModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to record payment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation my-auto text-slate-900 dark:text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Customer Jama (Payment)</h3>
              <p className="text-[11px] text-slate-400">Clear Udhaar dues in Digital Bahi Khata</p>
            </div>
          </div>
          <button
            onClick={() => setIsRecordPaymentModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Select Customer *
            </label>
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const c = customers.find((cust) => cust.id === e.target.value);
                if (c && c.currentBalance > 0) setAmount(c.currentBalance);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
            >
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.currentBalance > 0 ? `(Owes ₹${c.currentBalance})` : '(No Dues)'}
                </option>
              ))}
            </select>
          </div>

          {currentCust && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">
                  Current Outstanding Due
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {currentCust.phone}
                </p>
              </div>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">
                {formatCurrency(currentCust.currentBalance)}
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Payment Amount Received (₹) *
            </label>
            <input
              type="number"
              min={1}
              required
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              placeholder="Enter amount"
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border text-base font-black text-emerald-600 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Bank Transfer">Bank Transfer / IMPS</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Ref / UTR / Txn No
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Optional reference"
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Month-end full settlement"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Jama Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
