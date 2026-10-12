'use client';

import React from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import {
  Building2,
  Users,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Business } from '@/types';

export function OverviewView() {
  const {
    myBusiness,
    businesses,
    transactions,
    relationships,
    setDashboardView,
    setInspectingBusiness,
    addSupplierToNetwork,
    setIsAddTransactionModalOpen,
  } = useBizLink();

  // Compute financial totals
  const totalReceivables = transactions
    .filter(t => t.type === 'Credit' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayables = transactions
    .filter(t => t.type === 'Debit' && t.status === 'Pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Recommended suppliers (Filtered from businesses: Wholesaler / Super Wholesaler matching business category)
  const recommendedSuppliers = businesses.filter(
    b =>
      b.id !== myBusiness.id &&
      (b.primaryRole === 'Wholesaler' || b.primaryRole === 'Super Wholesaler' || b.primaryRole === 'Manufacturer') &&
      !relationships.some(r => r.sourceId === b.id && r.targetId === myBusiness.id)
  ).slice(0, 3);

  // Recent transactions (top 4)
  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Hackathon Demo Highlight Alert */}
      <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-elevation flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-white/20 text-white font-mono text-[11px] font-bold uppercase tracking-wider">
              Primary Hackathon Scenario
            </span>
            <span className="text-xs text-indigo-100">Retailer Supplier Procurement</span>
          </div>
          <h3 className="text-lg font-bold">
            Simulate Discovery: "Find Wholesale LED Bulb Suppliers in Ambala (20 km)"
          </h3>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Execute the central story: Query SerpApi, discover local wholesalers like <em>Ambala LED Wholesalers</em>, inspect wholesale terms, connect, and watch the supply-chain graph update in real-time.
          </p>
        </div>

        <button
          onClick={() => setDashboardView('find_suppliers')}
          className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4 text-indigo-600" />
          Run Demo Search
        </button>
      </div>

      {/* 4 Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Connected Suppliers
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{myBusiness.totalSuppliersCount}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> 100% active supply routes
            </p>
          </div>
          <button
            onClick={() => setDashboardView('find_suppliers')}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            + Discover New Supplier
          </button>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Buyers / Clients
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{myBusiness.totalCustomersCount}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              2 retail partners + 140 consumers
            </p>
          </div>
          <button
            onClick={() => setDashboardView('find_customers')}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            + Find New Buyers
          </button>
        </div>

        {/* Pending Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Receivables
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Owed by retail contractors
            </p>
          </div>
          <button
            onClick={() => setDashboardView('transactions')}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            View Credit Ledger
          </button>
        </div>

        {/* Outstanding Payables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Outstanding Payables
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ₹{totalPayables.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Due to wholesale stockists
            </p>
          </div>
          <button
            onClick={() => setDashboardView('transactions')}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-2 border-t border-slate-100"
          >
            Manage Payables
          </button>
        </div>
      </div>

      {/* 2-Column Grid: Supply Chain Preview & Recommended Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Supply Chain Snapshot Card (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Supply-Chain Network Snapshot</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-tier topological view of upstream stockists and downstream retail buyers
              </p>
            </div>
            <button
              onClick={() => setDashboardView('network')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Open Full Graph
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mini Interactive Flow visualization */}
          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>TIER 0: RAW MFG</span>
              <span>TIER 2: WHOLESALE</span>
              <span className="text-amber-300 font-bold">TIER 3: YOU</span>
              <span>TIER 4: RETAIL</span>
            </div>

            <div className="flex items-center justify-between gap-1 text-center text-xs">
              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex-1">
                <span className="text-[10px] text-rose-400 font-bold block">Manufacturer</span>
                <span className="font-semibold text-[11px] truncate block">Surya Opto</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex-1">
                <span className="text-[10px] text-blue-400 font-bold block">Wholesalers</span>
                <span className="font-semibold text-[11px] truncate block">Ludhiana & Chd</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />

              <div className="bg-amber-500/20 border border-amber-400 p-2.5 rounded-lg flex-1 text-amber-200">
                <span className="text-[10px] text-amber-300 font-bold block">⭐ My Store</span>
                <span className="font-semibold text-[11px] truncate block text-white">Sharma Elec.</span>
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex-1">
                <span className="text-[10px] text-emerald-400 font-bold block">Buyers</span>
                <span className="font-semibold text-[11px] truncate block">Verma & Gupta</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span>Connected Routes: <strong>{relationships.length} active pipelines</strong></span>
              <span className="text-emerald-400 font-semibold">Reliability Index: 98%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span>Looking for cheaper LED bulb procurement?</span>
            <button
              onClick={() => setDashboardView('find_suppliers')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              Search Ambala Wholesale Hubs
            </button>
          </div>
        </div>

        {/* Right: Recommended Suppliers Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900">Recommended Suppliers</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Within 20 km</span>
          </div>

          <div className="space-y-2.5">
            {recommendedSuppliers.map(supplier => (
              <div
                key={supplier.id}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {supplier.name}
                    </h5>
                    {supplier.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="text-indigo-600 font-semibold">{supplier.primaryRole}</span>
                    <span>• {supplier.location.distanceKm} km away</span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {supplier.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setInspectingBusiness(supplier)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="View Profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => addSupplierToNetwork(supplier)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setDashboardView('find_suppliers')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 text-center transition-colors"
          >
            Explore All Recommended Suppliers
          </button>
        </div>
      </div>

      {/* Recent Transactions & Ledger Preview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Recent Debit / Credit Ledger Activity</h4>
            <p className="text-xs text-slate-500">Track pending and settled payments across trade partners</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTransactionModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Record Transaction
            </button>
            <button
              onClick={() => setDashboardView('transactions')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              All Transactions
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Business Counterparty</th>
                <th className="pb-3 font-semibold">Flow Type</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Invoice Ref</th>
                <th className="pb-3 font-semibold">Particulars</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 text-slate-600 font-mono">{tx.date}</td>
                  <td className="py-3 font-bold text-slate-900">{tx.businessName}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        tx.type === 'Credit'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {tx.type === 'Credit' ? (
                        <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-rose-600" />
                      )}
                      {tx.type} ({tx.type === 'Credit' ? 'Receivable' : 'Payable'})
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900 text-sm">
                    ₹{tx.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        tx.status === 'Settled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-slate-500">{tx.invoiceNumber}</td>
                  <td className="py-3 text-slate-600 truncate max-w-xs">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
