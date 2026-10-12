'use client';

import React, { useState } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Package, Plus, Search, Tag, Check, Edit2, AlertCircle } from 'lucide-react';
import { ProductItem } from '@/types';

export function ProductsView() {
  const { myBusiness, updateMyBusiness, showToast } = useBizLink();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    name: '',
    category: 'LED Lighting',
    description: '',
    unitPrice: 500,
    moq: 1,
    unit: 'boxes',
    inStock: true,
    leadTimeDays: 1,
  });

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name?.trim()) return;

    const created: ProductItem = {
      id: `prod_${Date.now()}`,
      name: newProduct.name,
      category: newProduct.category || 'LED Lighting',
      description: newProduct.description || 'Standard trade offering.',
      unitPrice: Number(newProduct.unitPrice) || 500,
      moq: Number(newProduct.moq) || 1,
      unit: newProduct.unit || 'boxes',
      inStock: true,
      leadTimeDays: Number(newProduct.leadTimeDays) || 1,
    };

    updateMyBusiness({
      products: [created, ...myBusiness.products],
    });

    setIsAddModalOpen(false);
    setNewProduct({
      name: '',
      category: 'LED Lighting',
      description: '',
      unitPrice: 500,
      moq: 1,
      unit: 'boxes',
      inStock: true,
      leadTimeDays: 1,
    });
    showToast('Product Added', `Added ${created.name} to your wholesale catalog.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Product Catalog & Trade Inventory
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage line items, wholesale packaging units, minimum order quantities (MOQ), and trade prices
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myBusiness.products.map(prod => (
          <div
            key={prod.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{prod.name}</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                  {prod.category}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{prod.description}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wholesale Price:</span>
                <strong className="text-slate-900 font-bold text-sm">
                  ₹{prod.unitPrice.toLocaleString('en-IN')} <span className="text-slate-500 text-[11px] font-normal">/ {prod.unit}</span>
                </strong>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Minimum Order:</span>
                <span className="font-semibold text-slate-800">{prod.moq} {prod.unit}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Dispatch Lead Time:</span>
                <span className="font-semibold text-emerald-700">{prod.leadTimeDays} day(s)</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">Add Product to Catalog</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. 12W Concealed Downlight (Pack of 20)"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                  >
                    <option value="LED Lighting">LED Lighting</option>
                    <option value="Switches & Sockets">Switches & Sockets</option>
                    <option value="Wiring & Cables">Wiring & Cables</option>
                    <option value="Home Appliances">Home Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.unitPrice}
                    onChange={e => setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">MOQ (Minimum Order)</label>
                  <input
                    type="number"
                    min="1"
                    value={newProduct.moq}
                    onChange={e => setNewProduct({ ...newProduct, moq: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                    placeholder="e.g. cartons, boxes, pcs"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Specifications</label>
                <textarea
                  rows={2}
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Lumens, warranty, certifications, specifications..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
