'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, processSaleReturn, cancelInvoice } from '@/lib/db/db';
import { Invoice, PurchaseOrder, PaymentRecord } from '@/lib/db/schema';
import {
  History,
  Receipt,
  RotateCcw,
  Ban,
  Search,
  Filter,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

export function TransactionsView() {
  const {
    formatCurrency,
    refreshTrigger,
    triggerRefresh,
    openReceipt,
    showToast,
  } = useVyapar();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Return Modal State
  const [returningInvoice, setReturningInvoice] = useState<Invoice | null>(null);
  const [returnedItemQtys, setReturnedItemQtys] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState('Customer returned damaged or surplus item');

  // Cancel Modal State
  const [cancellingInvoice, setCancellingInvoice] = useState<Invoice | null>(null);
  const [cancelReason, setCancelReason] = useState('Customer requested order cancellation');

  useEffect(() => {
    async function loadInvoices() {
      try {
        const list = await db.invoices.reverse().sortBy('date');
        setInvoices(list);
      } catch (err) {
        console.error(err);
      }
    }
    loadInvoices();
  }, [refreshTrigger]);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== 'All' && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q))
      );
    }
    return true;
  });

  const handleOpenReturnModal = (inv: Invoice) => {
    setReturningInvoice(inv);
    const initialQtys: Record<string, number> = {};
    inv.items.forEach((it) => {
      initialQtys[it.productId] = it.quantity; // default to returning all or part
    });
    setReturnedItemQtys(initialQtys);
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningInvoice) return;

    try {
      const returnPayload = returningInvoice.items
        .filter((it) => (returnedItemQtys[it.productId] || 0) > 0)
        .map((it) => {
          const qty = returnedItemQtys[it.productId] || 0;
          const refundAmount = qty * it.unitPrice;
          return {
            productId: it.productId,
            quantity: qty,
            refundAmount,
            returnReason,
          };
        });

      if (returnPayload.length === 0) {
        showToast('Validation Error', 'Please select at least 1 item quantity to return.', 'warning');
        return;
      }

      await processSaleReturn(returningInvoice.id, returnPayload);
      showToast('Return Processed', 'Items restocked in inventory and refund adjusted.', 'success');
      setReturningInvoice(null);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to process return.', 'error');
    }
  };

  const handleProcessCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingInvoice) return;

    try {
      await cancelInvoice(cancellingInvoice.id, cancelReason);
      showToast('Invoice Cancelled', 'All items restocked and credit reversed.', 'success');
      setCancellingInvoice(null);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to cancel invoice.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice # or customer name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          {['All', 'Completed', 'Partially Refunded', 'Refunded', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Bill # & Date</th>
                <th className="py-3 px-3 font-semibold">Customer</th>
                <th className="py-3 px-3 font-semibold">Payment Mode</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right">Grand Total</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(inv.date).toLocaleString('en-IN')}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {inv.customerName}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {inv.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : inv.status === 'Cancelled'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-black font-mono text-sm text-slate-900 dark:text-white">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReceipt(inv)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100"
                        >
                          Receipt
                        </button>

                        {inv.status === 'Completed' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenReturnModal(inv)}
                              title="Process Return & Restock Items"
                              className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 hover:bg-amber-100"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setCancellingInvoice(inv)}
                              title="Cancel Invoice & Restore Stock"
                              className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Modal */}
      {returningInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold">
                Process Return for Bill #{returningInvoice.invoiceNumber}
              </h4>
              <button onClick={() => setReturningInvoice(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProcessReturn} className="space-y-3 mt-4 text-xs">
              <p className="text-slate-500">
                Specify quantities to return. Returned items will be added back to inventory stock.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {returningInvoice.items.map((it) => (
                  <div
                    key={it.productId}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold">{it.productName}</p>
                      <p className="text-[10px] text-slate-400">
                        Purchased: {it.quantity} {it.unit} @ ₹{it.unitPrice}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px]">Return:</span>
                      <input
                        type="number"
                        min={0}
                        max={it.quantity}
                        value={returnedItemQtys[it.productId] || 0}
                        onChange={(e) =>
                          setReturnedItemQtys({
                            ...returnedItemQtys,
                            [it.productId]: Math.min(it.quantity, Math.max(0, parseInt(e.target.value) || 0)),
                          })
                        }
                        className="w-12 px-1.5 py-0.5 rounded border text-center font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold mb-1">Return Reason *</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold"
                >
                  Confirm Return & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-rose-500">
                Cancel Bill #{cancellingInvoice.invoiceNumber}?
              </h4>
              <button onClick={() => setCancellingInvoice(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleProcessCancel} className="space-y-3 mt-4 text-xs">
              <p className="text-slate-500">
                Cancelling this bill will return all {cancellingInvoice.items.length} items to inventory stock and reverse customer credit if unpaid.
              </p>
              <div>
                <label className="block font-semibold mb-1">Cancellation Reason *</label>
                <input
                  type="text"
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
