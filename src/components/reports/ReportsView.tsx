'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Invoice, Product, Customer } from '@/lib/db/schema';
import {
  BarChart3,
  TrendingUp,
  Receipt,
  Download,
  Printer,
  Calendar,
  Layers,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';

export function ReportsView() {
  const { formatCurrency, refreshTrigger, storeProfile } = useVyapar();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const invList = await db.invoices.toArray();
        setInvoices(invList);
        const prodList = await db.products.filter(p => !p.isArchived).toArray();
        setProducts(prodList);
        const custList = await db.customers.toArray();
        setCustomers(custList);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const completedInvoices = invoices.filter((i) => i.status !== 'Cancelled');

  const totalGrossSales = completedInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalTaxCollected = completedInvoices.reduce((sum, i) => sum + i.taxTotal, 0);
  const totalCogs = completedInvoices.reduce((sum, i) => sum + (i.totalCogs || 0), 0);
  const totalGrossProfit = completedInvoices.reduce((sum, i) => sum + (i.estimatedGrossProfit || 0), 0);
  const totalCustomerDues = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);

  const inventoryPurchaseValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchaseCost, 0);
  const inventoryRetailValue = products.reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0);

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['InvoiceNumber', 'Date', 'Customer', 'ItemsCount', 'Subtotal', 'TaxTotal', 'GrandTotal', 'COGS', 'GrossProfit', 'PaymentMethod', 'Status'];
    const rows = completedInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.date,
      `"${inv.customerName.replace(/"/g, '""')}"`,
      inv.items.length,
      inv.subtotal,
      inv.taxTotal,
      inv.grandTotal,
      inv.totalCogs,
      inv.estimatedGrossProfit,
      inv.paymentMethod,
      inv.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Accounting Compliance Transparency Notice */}
      <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-start justify-between gap-4">
        <div>
          <span className="font-bold block">Financial Reporting Disclosure:</span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            Profit estimates are calculated as <em>Gross Profit = Net Sales - Cost of Goods Sold (COGS)</em> using the snapshot unit cost recorded at the time of each sale. Does not constitute certified chartered accounting or audited tax compliance.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold text-xs border shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Financial Health Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-slate-500">Gross Sales Turnover</span>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(totalGrossSales)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">{completedInvoices.length} Completed Bills</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-slate-500">Total Cost of Goods Sold (COGS)</span>
          <h3 className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-2">
            {formatCurrency(totalCogs)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Landed procurement cost of items sold</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            Estimated Gross Profit
          </span>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalGrossProfit)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Net sales minus item inventory costs</p>
        </div>
      </div>

      {/* Tax & Inventory Valuation Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-slate-500">Total GST Collected</span>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(totalTaxCollected)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Total tax liability on sales</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-slate-500">Stock Valuation (Cost)</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(inventoryPurchaseValue)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Capital invested in present stock</p>
        </div>

        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-xs font-bold text-slate-500">Total Customer Udhaar</span>
          <h3 className="text-xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {formatCurrency(totalCustomerDues)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Active customer receivables</p>
        </div>
      </div>
    </div>
  );
}
