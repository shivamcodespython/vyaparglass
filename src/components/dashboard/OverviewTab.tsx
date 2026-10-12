'use client';

import React, { useEffect, useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Invoice, PurchaseOrder, Product, Customer } from '@/lib/db/schema';
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  Receipt,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  ExternalLink,
  Calendar,
} from 'lucide-react';

export function OverviewTab() {
  const {
    formatCurrency,
    refreshTrigger,
    setIsNewBillModalOpen,
    setIsAddProductModalOpen,
    setIsRecordPurchaseModalOpen,
    setIsAddCustomerModalOpen,
    setIsRecordPaymentModalOpen,
    openReceipt,
    setActiveTab,
  } = useVyapar();

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | '7days' | '30days' | 'all'>('today');
  const [stats, setStats] = useState({
    salesTotal: 0,
    purchasesTotal: 0,
    estimatedGrossProfit: 0,
    totalCustomerDues: 0,
    totalSupplierPayables: 0,
    inventoryItemCount: 0,
    totalStockUnits: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });

  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [dailySalesTrend, setDailySalesTrend] = useState<{ day: string; sales: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; qty: number; revenue: number }[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const allInvoices = await db.invoices.toArray();
        const allPurchases = await db.purchases.toArray();
        const allProducts = await db.products.filter(p => !p.isArchived).toArray();
        const allCustomers = await db.customers.toArray();
        const allSuppliers = await db.suppliers.toArray();

        // Calculate Date Range Bounds
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterdayStart = todayStart - 86400000;
        const sevenDaysAgo = todayStart - 86400000 * 6;
        const thirtyDaysAgo = todayStart - 86400000 * 29;

        const filteredInvoices = allInvoices.filter(inv => {
          if (inv.status === 'Cancelled') return false;
          const invTime = new Date(inv.date).getTime();
          if (dateFilter === 'today') return invTime >= todayStart;
          if (dateFilter === 'yesterday') return invTime >= yesterdayStart && invTime < todayStart;
          if (dateFilter === '7days') return invTime >= sevenDaysAgo;
          if (dateFilter === '30days') return invTime >= thirtyDaysAgo;
          return true;
        });

        const filteredPurchases = allPurchases.filter(po => {
          if (po.status === 'Cancelled') return false;
          const poTime = new Date(po.date).getTime();
          if (dateFilter === 'today') return poTime >= todayStart;
          if (dateFilter === 'yesterday') return poTime >= yesterdayStart && poTime < todayStart;
          if (dateFilter === '7days') return poTime >= sevenDaysAgo;
          if (dateFilter === '30days') return poTime >= thirtyDaysAgo;
          return true;
        });

        // Totals
        const salesTotal = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
        const purchasesTotal = filteredPurchases.reduce((sum, po) => sum + po.grandTotal, 0);
        const estimatedGrossProfit = filteredInvoices.reduce((sum, inv) => sum + (inv.estimatedGrossProfit || 0), 0);

        // Overall balances (current ledger balances)
        const totalCustomerDues = allCustomers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
        const totalSupplierPayables = allSuppliers.reduce((sum, s) => sum + (s.currentBalance > 0 ? s.currentBalance : 0), 0);

        // Stock stats
        const totalStockUnits = allProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
        const lowStock = allProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
        const outOfStock = allProducts.filter(p => p.stockQuantity <= 0);

        setStats({
          salesTotal,
          purchasesTotal,
          estimatedGrossProfit,
          totalCustomerDues,
          totalSupplierPayables,
          inventoryItemCount: allProducts.length,
          totalStockUnits,
          lowStockCount: lowStock.length,
          outOfStockCount: outOfStock.length,
        });

        setLowStockProducts([...outOfStock, ...lowStock].slice(0, 5));

        // Recent Invoices
        const sortedInvoices = [...allInvoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentInvoices(sortedInvoices.slice(0, 5));

        // 7-day Sales Trend computation
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const trendData = [];
        for (let i = 6; i >= 0; i--) {
          const targetDay = new Date(now.getTime() - i * 86400000);
          const start = new Date(targetDay.getFullYear(), targetDay.getMonth(), targetDay.getDate()).getTime();
          const end = start + 86400000;
          const daySales = allInvoices
            .filter(inv => inv.status !== 'Cancelled')
            .filter(inv => {
              const t = new Date(inv.date).getTime();
              return t >= start && t < end;
            })
            .reduce((s, inv) => s + inv.grandTotal, 0);

          trendData.push({
            day: days[targetDay.getDay()],
            sales: daySales,
          });
        }
        setDailySalesTrend(trendData);

        // Top products by sales
        const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
        for (const inv of allInvoices.filter(i => i.status !== 'Cancelled')) {
          for (const item of inv.items) {
            if (!productSalesMap[item.productId]) {
              productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
            }
            productSalesMap[item.productId].qty += item.quantity;
            productSalesMap[item.productId].revenue += item.total;
          }
        }
        const sortedTop = Object.values(productSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 4);
        setTopProducts(sortedTop);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }

    loadDashboardData();
  }, [dateFilter, refreshTrigger]);

  const maxTrendSale = Math.max(...dailySalesTrend.map(d => d.sales), 500);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Date Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Store Dashboard
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
              Live Local Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time financial activity computed directly from local IndexedDB records.
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-semibold">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setDateFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setActiveTab('pos')}
          className="p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-600/20 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group"
        >
          <Receipt className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">New Bill (POS)</span>
        </button>

        <button
          onClick={() => setIsAddProductModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-subtle flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group"
        >
          <Package className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Add Product</span>
        </button>

        <button
          onClick={() => setIsRecordPurchaseModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-subtle flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group"
        >
          <ShoppingBag className="w-5 h-5 text-sky-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Record Purchase</span>
        </button>

        <button
          onClick={() => setIsAddCustomerModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-subtle flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group"
        >
          <Users className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Add Customer</span>
        </button>

        <button
          onClick={() => setIsRecordPaymentModalOpen(true)}
          className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-subtle flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 group col-span-2 sm:col-span-1"
        >
          <IndianRupee className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Record Jama (Payment)</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Sales ({dateFilter})
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(stats.salesTotal)}
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real database calculation</span>
            </p>
          </div>
        </div>

        {/* Card 2: Estimated Gross Profit */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Estimated Gross Profit
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatCurrency(stats.estimatedGrossProfit)}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1" title="Sales minus item cost-of-goods-sold">
              COGS based • Excludes taxes
            </p>
          </div>
        </div>

        {/* Card 3: Total Customer Dues (Udhaar) */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Customer Dues (Bahi Khata)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatCurrency(stats.totalCustomerDues)}
            </h3>
            <button
              onClick={() => setActiveTab('customers')}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View Customer Ledgers</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Inventory Units & Alerts */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Total Stock Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.totalStockUnits.toLocaleString()} units
            </h3>
            <div className="flex items-center gap-2 mt-1">
              {stats.lowStockCount > 0 ? (
                <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {stats.lowStockCount} low stock items
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-500">
                  Stock levels healthy
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mid Section: 7-Day Trend Chart & Low-Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Sales Trend Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                7-Day Sales Trend
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Daily turnover computed from local transaction history
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              Last 7 Days
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {dailySalesTrend.map((d, index) => {
              const heightPercent = maxTrendSale > 0 ? Math.max(8, Math.round((d.sales / maxTrendSale) * 100)) : 8;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{Math.round(d.sales)}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] rounded-xl bg-gradient-to-t from-indigo-600 to-sky-400 group-hover:from-indigo-500 group-hover:to-sky-300 transition-all shadow-subtle cursor-pointer"
                    title={`${d.day}: ${formatCurrency(d.sales)}`}
                  />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alerts Box */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Stock Alerts
                </h4>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Catalog
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Package className="w-8 h-8 mx-auto text-emerald-400 mb-2 opacity-60" />
                No stock alerts. All items above threshold.
              </div>
            ) : (
              <div className="space-y-2.5">
                {lowStockProducts.map(p => (
                  <div
                    key={p.id}
                    className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Threshold: {p.lowStockThreshold} {p.unit}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        p.stockQuantity <= 0
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      }`}
                    >
                      {p.stockQuantity <= 0 ? 'Out of Stock' : `${p.stockQuantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsRecordPurchaseModalOpen(true)}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-sky-500" />
            <span>Record Goods Received from Supplier</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Recent Invoices & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Bills & Invoices
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Latest customer retail transactions
              </p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All History
            </button>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <Receipt className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              No invoices generated yet. Click "New Bill (POS)" to create your first bill!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                    <th className="pb-2.5 font-semibold">Bill #</th>
                    <th className="pb-2.5 font-semibold">Customer</th>
                    <th className="pb-2.5 font-semibold">Mode</th>
                    <th className="pb-2.5 font-semibold text-right">Amount</th>
                    <th className="pb-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {recentInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">
                        {inv.customerName}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => openReceipt(inv)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Best Selling Products */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Best Sellers
            </h4>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No sales logged yet to determine top sellers.
            </div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.qty} units sold
                    </p>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono shrink-0">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
