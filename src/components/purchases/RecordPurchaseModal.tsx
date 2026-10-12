'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, recordGoodsPurchase } from '@/lib/db/db';
import { Product, Supplier, PurchaseItem } from '@/lib/db/schema';
import { ShoppingBag, X, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export function RecordPurchaseModal() {
  const {
    isRecordPurchaseModalOpen,
    setIsRecordPurchaseModalOpen,
    showToast,
    triggerRefresh,
    formatCurrency,
  } = useVyapar();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [customSupplierName, setCustomSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemCost, setItemCost] = useState<number>(100);

  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit'>('Cash');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supList = await db.suppliers.toArray();
        setSuppliers(supList);
        const prodList = await db.products.filter(p => !p.isArchived).toArray();
        setProducts(prodList);
        if (prodList.length > 0) {
          setSelectedProdId(prodList[0].id);
          setItemCost(prodList[0].purchaseCost);
        }
      } catch (err) {
        console.error(err);
      }
    }
    if (isRecordPurchaseModalOpen) {
      load();
    }
  }, [isRecordPurchaseModalOpen]);

  if (!isRecordPurchaseModalOpen) return null;

  const handleAddItem = () => {
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    const total = itemQty * itemCost;
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        quantity: itemQty,
        unit: prod.unit,
        unitCost: itemCost,
        taxRate: prod.taxRate || 0,
        total,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const subtotal = purchaseItems.reduce((sum, it) => sum + it.total, 0);
  const grandTotal = subtotal;
  const remainingDue = Math.max(0, grandTotal - (paymentMethod === 'Credit' ? 0 : amountPaid || grandTotal));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      showToast('Validation Error', 'Please add at least one product item received.', 'warning');
      return;
    }

    const supplierName = selectedSupplierId
      ? suppliers.find((s) => s.id === selectedSupplierId)?.name || 'Supplier'
      : customSupplierName.trim() || 'Wholesale Supplier';

    setIsSubmitting(true);
    try {
      const actualPaid = paymentMethod === 'Credit' ? 0 : amountPaid || grandTotal;
      await recordGoodsPurchase({
        supplierId: selectedSupplierId || undefined,
        supplierName,
        supplierPhone: supplierPhone.trim() || undefined,
        supplierInvoiceNo: supplierInvoiceNo.trim() || undefined,
        items: purchaseItems,
        subtotal,
        taxTotal: 0,
        otherCharges: 0,
        grandTotal,
        amountPaid: actualPaid,
        remainingDue: grandTotal - actualPaid,
        paymentMethod,
        notes,
      });

      showToast('Purchase Recorded', `Inventory restocked for ${purchaseItems.length} products.`, 'success');
      setIsRecordPurchaseModalOpen(false);
      setPurchaseItems([]);
      triggerRefresh();
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to record purchase.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-elevation my-auto text-slate-900 dark:text-white">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Inward Goods / Purchase</h3>
              <p className="text-[11px] text-slate-400">Restock inventory & track supplier payables</p>
            </div>
          </div>
          <button
            onClick={() => setIsRecordPurchaseModalOpen(false)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          {/* Supplier details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => {
                  setSelectedSupplierId(e.target.value);
                  const s = suppliers.find((sup) => sup.id === e.target.value);
                  if (s) setSupplierPhone(s.phone);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border"
              >
                <option value="">+ New / Custom Supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedSupplierId && (
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  required={!selectedSupplierId}
                  value={customSupplierName}
                  onChange={(e) => setCustomSupplierName(e.target.value)}
                  placeholder="e.g. Ambala FMCG Wholesalers"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Supplier Bill / Invoice #
              </label>
              <input
                type="text"
                value={supplierInvoiceNo}
                onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                placeholder="e.g. SUP-INV-994"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono"
              />
            </div>
          </div>

          {/* Add Item Line */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-2">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              Add Products Received
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setItemCost(p.purchaseCost);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={(e) => setItemQty(parseFloat(e.target.value) || 1)}
                  placeholder="Qty"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  value={itemCost}
                  onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                  placeholder="Cost Price"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold shrink-0 hover:bg-indigo-700"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Added Items List */}
            {purchaseItems.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {purchaseItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold">{item.productName}</span>
                      <span className="text-[10px] text-slate-400 ml-2">
                        {item.quantity} {item.unit} @ ₹{item.unitCost}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold">₹{item.total}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-rose-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-semibold"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Credit">Credit (Full Udhaar)</option>
              </select>
            </div>

            {paymentMethod !== 'Credit' && (
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Amount Paid Now (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={amountPaid || grandTotal}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-bold text-emerald-600"
                />
              </div>
            )}

            <div className="flex flex-col justify-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Total Inward Bill</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordPurchaseModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || purchaseItems.length === 0}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Purchase & Update Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
