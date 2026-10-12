'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, recordStockAdjustment } from '@/lib/db/db';
import { Product, StockMovement } from '@/lib/db/schema';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  History,
  Edit2,
  Trash2,
  TrendingUp,
  Boxes,
  ArrowUpDown,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export function InventoryView() {
  const {
    formatCurrency,
    refreshTrigger,
    triggerRefresh,
    showToast,
    setIsAddProductModalOpen,
    storeProfile,
  } = useVyapar();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'InStock' | 'LowStock' | 'OutOfStock'>('All');

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [newStockQty, setNewStockQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Stock Movement Ledger Modal
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [movementLedger, setMovementLedger] = useState<StockMovement[]>([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const list = await db.products.filter(p => !p.isArchived).toArray();
        setProducts(list);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    loadProducts();
  }, [refreshTrigger]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    if (stockStatusFilter === 'InStock' && p.stockQuantity <= p.lowStockThreshold) return false;
    if (stockStatusFilter === 'LowStock' && (p.stockQuantity <= 0 || p.stockQuantity > p.lowStockThreshold)) return false;
    if (stockStatusFilter === 'OutOfStock' && p.stockQuantity > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Stock Valuation Metrics
  const totalStockUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + p.stockQuantity * p.purchaseCost, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.stockQuantity * p.sellingPrice, 0);
  const potentialGrossMargin = totalRetailValue - totalPurchaseValue;

  const handleOpenAdjustment = (prod: Product) => {
    setAdjustingProduct(prod);
    setNewStockQty(prod.stockQuantity);
    setAdjustReason('Physical stock audit count');
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    if (!adjustReason.trim()) {
      showToast('Reason Required', 'Please provide a reason for the stock correction.', 'warning');
      return;
    }

    try {
      await recordStockAdjustment({
        productId: adjustingProduct.id,
        newQuantity: newStockQty,
        reason: adjustReason,
      });

      showToast(
        'Stock Adjusted',
        `Updated ${adjustingProduct.name} stock to ${newStockQty} ${adjustingProduct.unit}.`,
        'success'
      );
      setAdjustingProduct(null);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to adjust stock.', 'error');
    }
  };

  const handleOpenMovementLedger = async (prod: Product) => {
    setInspectingProduct(prod);
    try {
      const moves = await db.stockMovements.where('productId').equals(prod.id).reverse().sortBy('timestamp');
      setMovementLedger(moves);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveProduct = async (prod: Product) => {
    if (confirm(`Are you sure you want to archive "${prod.name}"? It will be hidden from the active catalog.`)) {
      await db.products.update(prod.id, { isArchived: true, updatedAt: new Date().toISOString() });
      showToast('Archived', `${prod.name} has been archived.`, 'info');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Top Header & Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Total Catalog Items</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {products.length} Products
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{totalStockUnits.toLocaleString()} units in store</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Stock Purchase Valuation</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalPurchaseValue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">At landed cost price</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Retail Sales Valuation</span>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totalRetailValue)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">At current selling prices</p>
        </div>

        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Potential Gross Margin</span>
          <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(potentialGrossMargin)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Expected inventory gross return</p>
        </div>
      </div>

      {/* Control Bar: Search, Category, Status, Add Button */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, SKU, or barcode..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Stock Status Pills */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            {[
              { id: 'All', label: 'All' },
              { id: 'InStock', label: 'In Stock' },
              { id: 'LowStock', label: 'Low Stock' },
              { id: 'OutOfStock', label: 'Out of Stock' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStockStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] ${
                  stockStatusFilter === tab.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action: Add Product */}
        <button
          type="button"
          onClick={() => setIsAddProductModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Product Name & SKU</th>
                <th className="py-3 px-3 font-semibold">Category</th>
                <th className="py-3 px-3 font-semibold text-center">Available Stock</th>
                <th className="py-3 px-3 font-semibold text-right">Cost Price</th>
                <th className="py-3 px-3 font-semibold text-right">Selling Price</th>
                <th className="py-3 px-3 font-semibold text-right">Stock Value</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.stockQuantity <= 0;
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-tight">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-mono">
                            <span>SKU: {p.sku}</span>
                            {p.barcode && <span>• Barcode: {p.barcode}</span>}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                        {p.category}
                      </td>

                      {/* Stock Quantity & Status Badge */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isOut
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                : isLow
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                            }`}
                          >
                            {p.stockQuantity} {p.unit}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5">
                            Min: {p.lowStockThreshold}
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {formatCurrency(p.purchaseCost)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.sellingPrice)}
                      </td>

                      {/* Stock Value */}
                      <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700 dark:text-slate-200">
                        {formatCurrency(p.stockQuantity * p.purchaseCost)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAdjustment(p)}
                            title="Adjust Stock Quantity (Audit Reason Required)"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenMovementLedger(p)}
                            title="View Stock Movement Audit History"
                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 transition-colors"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleArchiveProduct(p)}
                            title="Archive Product"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Adjust Stock: {adjustingProduct.name}
              </h4>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Stock: {adjustingProduct.stockQuantity} {adjustingProduct.unit}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">New Physical Count:</span>
                  <input
                    type="number"
                    required
                    value={newStockQty}
                    onChange={(e) => setNewStockQty(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {adjustingProduct.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Adjustment (Audit Required) *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Broken packet, physical count correction, expired item discarded"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement History Modal */}
      {inspectingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Stock Movement History
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    {inspectingProduct.name} ({inspectingProduct.stockQuantity} {inspectingProduct.unit} currently)
                  </p>
                </div>
                <button
                  onClick={() => setInspectingProduct(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {movementLedger.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-8">
                    No recorded movements yet.
                  </p>
                ) : (
                  movementLedger.map((mv) => (
                    <div
                      key={mv.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                              mv.quantityChange > 0
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {mv.type}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {mv.reason || mv.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(mv.timestamp).toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            mv.quantityChange > 0 ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {mv.quantityChange > 0 ? `+${mv.quantityChange}` : mv.quantityChange}{' '}
                          {inspectingProduct.unit}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Stock after: {mv.quantityAfter}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingProduct(null)}
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
