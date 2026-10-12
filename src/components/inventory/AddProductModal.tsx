'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db } from '@/lib/db/db';
import { Product, Supplier, UnitOfMeasure } from '@/lib/db/schema';
import { Package, X, CheckCircle2, Barcode, Plus } from 'lucide-react';

export function AddProductModal() {
  const {
    isAddProductModalOpen,
    setIsAddProductModalOpen,
    showToast,
    triggerRefresh,
    storeProfile,
  } = useVyapar();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [form, setForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Groceries & Staples',
    brand: '',
    description: '',
    purchaseCost: 100,
    sellingPrice: 120,
    mrp: 130,
    stockQuantity: 20,
    unit: 'Packet' as UnitOfMeasure,
    lowStockThreshold: 5,
    taxRate: storeProfile?.defaultTaxRate || 5,
    supplierId: '',
    expiryDate: '',
    batchNumber: '',
  });

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
      // Auto-generate a suggested SKU
      const rand = Math.floor(1000 + Math.random() * 9000);
      setForm((prev) => ({ ...prev, sku: `SKU-${rand}` }));
    }
  }, [isAddProductModalOpen]);

  if (!isAddProductModalOpen) return null;

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

      const newProduct: Product = {
        id: productId,
        name: form.name.trim(),
        sku: form.sku.trim().toUpperCase(),
        barcode: form.barcode.trim() || undefined,
        category: form.category,
        brand: form.brand.trim() || undefined,
        description: form.description.trim() || undefined,
        purchaseCost: Number(form.purchaseCost) || 0,
        sellingPrice: Number(form.sellingPrice) || 0,
        mrp: form.mrp ? Number(form.mrp) : undefined,
        stockQuantity: Number(form.stockQuantity) || 0,
        unit: form.unit,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
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

        // Record opening stock movement
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
      setIsAddProductModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to add product.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation my-auto text-slate-900 dark:text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Add Inventory Product</h3>
              <p className="text-[11px] text-slate-400">Register new item in retail catalog</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddProductModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Row 1: Name, SKU, Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Tata Tea 500g"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                SKU Code *
              </label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="SKU-1001"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border uppercase font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Barcode (Optional)
              </label>
              <input
                type="text"
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                placeholder="Scanned EAN / UPC"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
              />
            </div>
          </div>

          {/* Row 2: Category, Brand, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Groceries & Staples"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. Tata, Philips, Nestle"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Unit of Measure
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as UnitOfMeasure })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-semibold"
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

          {/* Row 3: Cost, Selling Price, MRP, Tax Rate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.purchaseCost}
                onChange={(e) => setForm({ ...form, purchaseCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                MRP (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                GST Tax Rate (%)
              </label>
              <select
                value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-semibold"
              >
                <option value={0}>0%</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>
          </div>

          {/* Row 4: Opening Stock, Low Stock Threshold, Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Opening Stock Quantity *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Low-Stock Alert Level
              </label>
              <input
                type="number"
                min={1}
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: parseFloat(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Supplier (Optional)
              </label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5"
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
