'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { PurchaseOrder } from '@/lib/db/schema';
import {
  ShoppingBag,
  Plus,
  Search,
  Truck,
  IndianRupee,
  Calendar,
  CheckCircle2,
  X,
  FileText,
} from 'lucide-react';

export function PurchasesView() {
  const {
    formatCurrency,
    refreshTrigger,
    setIsRecordPurchaseModalOpen,
  } = useVyapar();

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingPurchase, setInspectingPurchase] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    async function loadPurchases() {
      try {
        const list = await db.purchases.reverse().sortBy('date');
        setPurchases(list);
      } catch (err) {
        console.error('Failed to load purchases:', err);
      }
    }
    loadPurchases();
  }, [refreshTrigger]);

  const filteredPurchases = purchases.filter((po) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        po.purchaseNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q) ||
        (po.supplierInvoiceNo && po.supplierInvoiceNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalInwardValue = purchases.reduce((sum, p) => sum + p.grandTotal, 0);
  const totalPaid = purchases.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalPayablesDue = purchases.reduce((sum, p) => sum + p.remainingDue, 0);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Goods Purchased</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalInwardValue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{purchases.length} Purchase Invoices</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Paid to Suppliers</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalPaid)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Cleared balances</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Supplier Dues (Payables)</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatCurrency(totalPayablesDue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Unpaid purchase balance</p>
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
            placeholder="Search by PO #, supplier name, or supplier bill no..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsRecordPurchaseModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Inward Goods / Purchase</span>
        </button>
      </div>

      {/* Purchases Table */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">PO # & Date</th>
                <th className="py-3 px-3 font-semibold">Supplier Name</th>
                <th className="py-3 px-3 font-semibold">Supplier Bill #</th>
                <th className="py-3 px-3 font-semibold text-center">Items Received</th>
                <th className="py-3 px-3 font-semibold text-right">Bill Total</th>
                <th className="py-3 px-3 font-semibold text-right">Paid</th>
                <th className="py-3 px-3 font-semibold text-right">Due</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase orders recorded yet. Click "Record Inward Goods" to stock inventory from suppliers.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr
                    key={po.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {po.purchaseNumber}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(po.date).toLocaleDateString('en-IN')}
                      </p>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      {po.supplierName}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500">
                      {po.supplierInvoiceNo || '-'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {po.items.length} products
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(po.grandTotal)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(po.amountPaid)}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(po.remainingDue)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingPurchase(po)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Purchase Order Modal */}
      {inspectingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Purchase Order #{inspectingPurchase.purchaseNumber}
                </h4>
                <p className="text-[11px] text-slate-400">
                  Supplier: {inspectingPurchase.supplierName} • {new Date(inspectingPurchase.date).toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setInspectingPurchase(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 border-b border-slate-200 dark:border-slate-800 max-h-56 overflow-y-auto space-y-2">
              {inspectingPurchase.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{it.productName}</p>
                    <p className="text-[10px] text-slate-400">
                      {it.quantity} {it.unit} @ ₹{it.unitCost}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    ₹{it.total}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-3 text-xs space-y-1.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span>{formatCurrency(inspectingPurchase.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST Taxes:</span>
                <span>{formatCurrency(inspectingPurchase.taxTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-1 border-t">
                <span>Grand Total:</span>
                <span>{formatCurrency(inspectingPurchase.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Amount Paid ({inspectingPurchase.paymentMethod}):</span>
                <span>{formatCurrency(inspectingPurchase.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-amber-600 font-bold">
                <span>Payable Remaining:</span>
                <span>{formatCurrency(inspectingPurchase.remainingDue)}</span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setInspectingPurchase(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
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
