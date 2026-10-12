'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Product, Supplier, UnitOfMeasure } from '@/lib/db/schema';
import { Package, X, CheckCircle2, RotateCw, Sparkles } from 'lucide-react';

interface ProductFormState {
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  description: string;
  purchaseCost: string;
  sellingPrice: string;
  mrp: string;
  stockQuantity: string;
  unit: UnitOfMeasure;
  lowStockThreshold: string;
  taxRate: number;
  supplierId: string;
  expiryDate: string;
  batchNumber: string;
}

const createEmptyProductForm = (defaultTaxRate = 5): ProductFormState => ({
  name: '',
  sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
  barcode: '',
  category: 'Groceries & Staples',
  brand: '',
  description: '',
  purchaseCost: '',
  sellingPrice: '',
  mrp: '',
  stockQuantity: '',
  unit: 'Packet',
  lowStockThreshold: '5',
  taxRate: defaultTaxRate,
  supplierId: '',
  expiryDate: '',
  batchNumber: '',
});

export function AddProductModal() {
  const {
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    showToast,
    triggerRefresh,
    storeProfile,
  } = useVyapar();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [form, setForm] = useState<ProductFormState>(() => createEmptyProductForm(storeProfile?.defaultTaxRate || 5));
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Every time the modal opens, reset all fields cleanly to blank
  useEffect(() => {
    async function loadSuppliers() {
      try {
        const list = await db.suppliers.toArray();
        setSuppliers(list);
      } catch (err) {
        console.error(err);
      }
    }

    if (isAddProductModalOpen) {
      loadSuppliers();
      setForm(createEmptyProductForm(storeProfile?.defaultTaxRate || 5));
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isAddProductModalOpen, storeProfile?.defaultTaxRate]);

  if (!isAddProductModalOpen) return null;

  const handleClose = () => {
    setForm(createEmptyProductForm(storeProfile?.defaultTaxRate || 5));
    setIsAddProductModalOpen(false);
  };

  const handleGenerateSku = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({ ...prev, sku: `SKU-${rand}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) {
      showToast('Validation Error', 'Product name and SKU are required.', 'warning');
      return;
    }

    try {
      const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();

      const selectedSupplier = suppliers.find((s) => s.id === form.supplierId);

      const purchaseCost = parseFloat(form.purchaseCost) || 0;
      const sellingPrice = parseFloat(form.sellingPrice) || 0;
      const mrp = form.mrp ? parseFloat(form.mrp) : undefined;
      const stockQuantity = parseFloat(form.stockQuantity) || 0;
      const lowStockThreshold = parseFloat(form.lowStockThreshold) || 5;

      const newProduct: Product = {
        id: productId,
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        barcode: form.barcode.trim() || undefined,
        category: form.category.trim() || 'General',
        brand: form.brand.trim() || undefined,
        description: form.description.trim() || undefined,
        purchaseCost,
        sellingPrice,
        mrp,
        stockQuantity,
        unit: form.unit,
        lowStockThreshold,
        taxRate: Number(form.taxRate) || 0,
        supplierId: form.supplierId || undefined,
        supplierName: selectedSupplier ? selectedSupplier.name : undefined,
        expiryDate: form.expiryDate || undefined,
        batchNumber: form.batchNumber.trim() || undefined,
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.transaction('rw', [db.products, db.stockMovements, db.auditLogs], async () => {
        await db.products.add(newProduct);

        // Record opening stock movement if quantity > 0
        if (newProduct.stockQuantity > 0) {
          await db.stockMovements.add({
            id: `sm_open_${productId}`,
            productId,
            productName: newProduct.name,
            quantityChange: newProduct.stockQuantity,
            quantityAfter: newProduct.stockQuantity,
            type: 'OPENING',
            referenceType: 'MANUAL',
            unitCostSnapshot: newProduct.purchaseCost,
            reason: 'Opening stock on product registration',
            timestamp: now,
          });
        }
      });

      showToast('Product Added', `${newProduct.name} added to inventory.`, 'success');
      // Clean reset
      setForm(createEmptyProductForm(storeProfile?.defaultTaxRate || 5));
      setIsAddProductModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add product.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 overflow-y-auto select-none">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xl my-auto text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quick product entry into your shop inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5 text-xs">
          {/* Product Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Name *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Tata Tea Premium 500g"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
            />
          </div>

          {/* Row: SKU & Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  SKU Code *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSku}
                  className="text-[10px] text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Randomize</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU-1001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 uppercase font-mono text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Barcode (Optional)
              </label>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="Scan or type barcode"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Row: Category, Brand, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Groceries"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Brand
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Tata, Amul, Nestle"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Unit of Measure
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as UnitOfMeasure })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-900 dark:text-white transition-all text-xs"
              >
                <option value="Packet">Packet</option>
                <option value="Pcs">Pcs (Piece)</option>
                <option value="Box">Box</option>
                <option value="Kg">Kg</option>
                <option value="Gram">Gram</option>
                <option value="Litre">Litre</option>
                <option value="Ml">Ml</option>
                <option value="Metre">Metre</option>
                <option value="Dozen">Dozen</option>
              </select>
            </div>
          </div>

          {/* Pricing Section: Clean Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 block">
              Pricing & Tax Details
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0.00"
                  value={form.purchaseCost}
                  onChange={(e) => setForm({ ...form, purchaseCost: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  required
                  placeholder="0.00"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  placeholder="0.00"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  GST Rate
                </label>
                <select
                  value={form.taxRate}
                  onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value={0}>0% (Exempt)</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row: Stock & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Stock Qty
              </label>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Low Stock Alert
              </label>
              <input
                type="number"
                min={1}
                placeholder="5"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Supplier (Optional)
              </label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white transition-all text-xs"
              >
                <option value="">None / Cash Purchase</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end items-center gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-slate-600 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Product</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
