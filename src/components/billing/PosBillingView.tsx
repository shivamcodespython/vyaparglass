'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { db, createSaleInvoice } from '@/lib/db/db';
import { Product, Customer, InvoiceItem } from '@/lib/db/schema';
import confetti from 'canvas-confetti';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  UserPlus,
  IndianRupee,
  CreditCard,
  QrCode,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Percent,
  X,
} from 'lucide-react';

export function PosBillingView() {
  const {
    formatCurrency,
    storeProfile,
    showToast,
    triggerRefresh,
    openReceipt,
    setIsAddCustomerModalOpen,
  } = useVyapar();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cartItems, setCartItems] = useState<
    (InvoiceItem & { availableStock: number })[]
  >([]);

  // Customer selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Billing calculation states
  const [billDiscountType, setBillDiscountType] = useState<'flat' | 'percent'>('flat');
  const [billDiscountVal, setBillDiscountVal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Split' | 'Credit'>('Cash');
  const [amountPaidCustom, setAmountPaidCustom] = useState<string>('');
  const [splitCash, setSplitCash] = useState<string>('');
  const [splitUpi, setSplitUpi] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Load products and customers from local DB
  useEffect(() => {
    async function loadData() {
      try {
        const prodList = await db.products.filter(p => !p.isArchived).toArray();
        setProducts(prodList);
        const custList = await db.customers.toArray();
        setCustomers(custList);
      } catch (err) {
        console.error('Failed to load products for POS:', err);
      }
    }
    loadData();
  }, []);

  // Filter products by search and category
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
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

  // Handle direct barcode scanner enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const matched = products.find(
      p =>
        (p.barcode && p.barcode.toLowerCase() === searchQuery.toLowerCase()) ||
        p.sku.toLowerCase() === searchQuery.toLowerCase()
    );

    if (matched) {
      addToCart(matched);
      setSearchQuery('');
      showToast('Item Scanned', `Added ${matched.name} to cart.`, 'success');
    }
  };

  // Add product to cart
  const addToCart = (product: Product) => {
    const existingIndex = cartItems.findIndex(item => item.productId === product.id);

    if (existingIndex >= 0) {
      const currentQty = cartItems[existingIndex].quantity;
      if (!storeProfile?.allowNegativeStock && currentQty >= product.stockQuantity) {
        showToast('Stock Limit', `Cannot exceed available stock (${product.stockQuantity} ${product.unit}).`, 'warning');
        return;
      }

      setCartItems(prev =>
        prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const newQty = item.quantity + 1;
          const lineTotal = newQty * item.unitPrice - item.discountAmount;
          const taxAmount = (lineTotal * (item.taxRate / 100));
          return {
            ...item,
            quantity: newQty,
            taxAmount: Math.round(taxAmount * 100) / 100,
            total: Math.round(lineTotal * 100) / 100,
          };
        })
      );
    } else {
      if (!storeProfile?.allowNegativeStock && product.stockQuantity <= 0) {
        showToast('Out of Stock', `${product.name} is out of stock!`, 'warning');
        return;
      }

      const taxAmount = (product.sellingPrice * (product.taxRate / 100));
      const newItem: InvoiceItem & { availableStock: number } = {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unit: product.unit,
        unitPrice: product.sellingPrice,
        unitCost: product.purchaseCost, // snapshot COGS!
        discountPercent: 0,
        discountAmount: 0,
        taxRate: product.taxRate,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: product.sellingPrice,
        availableStock: product.stockQuantity,
      };

      setCartItems(prev => [newItem, ...prev]);
    }
  };

  // Update item quantity in cart
  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    const item = cartItems.find(i => i.productId === productId);
    if (item && !storeProfile?.allowNegativeStock && newQty > item.availableStock) {
      showToast('Stock Limit', `Only ${item.availableStock} ${item.unit} available in stock.`, 'warning');
      return;
    }

    setCartItems(prev =>
      prev.map(it => {
        if (it.productId !== productId) return it;
        const lineTotal = newQty * it.unitPrice - it.discountAmount;
        const taxAmount = lineTotal * (it.taxRate / 100);
        return {
          ...it,
          quantity: newQty,
          taxAmount: Math.round(taxAmount * 100) / 100,
          total: Math.round(lineTotal * 100) / 100,
        };
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const itemDiscounts = cartItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxTotal = cartItems.reduce((sum, item) => sum + item.taxAmount, 0);

  const billDiscountAmount =
    billDiscountType === 'percent'
      ? Math.round((subtotal * (billDiscountVal / 100)) * 100) / 100
      : Math.min(billDiscountVal, subtotal);

  const grandTotal = Math.max(0, Math.round(subtotal - billDiscountAmount + taxTotal));

  // Determine amount paid and remaining due based on payment method
  let amountPaid = grandTotal;
  let remainingDue = 0;

  if (paymentMethod === 'Credit') {
    const customPaid = parseFloat(amountPaidCustom) || 0;
    amountPaid = Math.min(customPaid, grandTotal);
    remainingDue = Math.max(0, grandTotal - amountPaid);
  } else if (paymentMethod === 'Split') {
    const cash = parseFloat(splitCash) || 0;
    const upi = parseFloat(splitUpi) || 0;
    amountPaid = cash + upi;
    remainingDue = Math.max(0, grandTotal - amountPaid);
  }

  // Complete Bill Checkout
  const handleCompleteBill = async () => {
    if (cartItems.length === 0) {
      showToast('Cart is Empty', 'Please add at least one product to the bill.', 'warning');
      return;
    }

    if (paymentMethod === 'Credit' && !selectedCustomer) {
      showToast('Customer Required', 'Please select a registered customer to record a Credit / Udhaar bill.', 'warning');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const createdInvoice = await createSaleInvoice({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone,
        items: cartItems.map(({ availableStock, ...item }) => item),
        subtotal,
        itemDiscountTotal: itemDiscounts,
        billDiscountAmount,
        taxTotal,
        grandTotal,
        amountPaid,
        remainingDue,
        paymentMethod,
        paymentDetails:
          paymentMethod === 'Split'
            ? { cashAmount: parseFloat(splitCash) || 0, upiAmount: parseFloat(splitUpi) || 0 }
            : undefined,
        notes,
      });

      // Confetti celebratory feedback
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Safe fallback if canvas not available
      }

      showToast('Bill Created Successfully', `Invoice #${createdInvoice.invoiceNumber} recorded.`, 'success');

      // Reset cart
      setCartItems([]);
      setSelectedCustomer(null);
      setBillDiscountVal(0);
      setNotes('');
      setAmountPaidCustom('');
      setSplitCash('');
      setSplitUpi('');

      // Refresh DB data
      triggerRefresh();
      // Reload products to reflect updated stock in POS
      const prodList = await db.products.filter(p => !p.isArchived).toArray();
      setProducts(prodList);

      // Open receipt modal immediately
      openReceipt(createdInvoice);
    } catch (err: any) {
      showToast('Checkout Error', err?.message || 'Failed to complete transaction.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-none">
      {/* LEFT COLUMN: Product Catalog & Search (Col 7) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search & Barcode Bar */}
        <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              ref={barcodeInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product name, SKU, or scan barcode..."
              className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-9 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              title="Barcode Scan Hit"
              className="absolute right-3 top-2.5 text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <Barcode className="w-5 h-5" />
            </button>
          </form>

          {/* Category Chips Scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
              <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              No products match "{searchQuery}".
            </div>
          ) : (
            filteredProducts.map((p) => {
              const inCart = cartItems.find((ci) => ci.productId === p.id);
              const isOutOfStock = p.stockQuantity <= 0;

              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group active:scale-95 ${
                    isOutOfStock
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                      : inCart
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800/80 shadow-subtle'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-mono text-slate-400 truncate">
                        {p.sku}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : p.stockQuantity <= p.lowStockThreshold
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                        }`}
                      >
                        {isOutOfStock ? '0 stock' : `${p.stockQuantity} ${p.unit}`}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {formatCurrency(p.sellingPrice)}
                      </span>
                      {p.mrp && p.mrp > p.sellingPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1">
                          ₹{p.mrp}
                        </span>
                      )}
                    </div>

                    {inCart ? (
                      <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {inCart.quantity}
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Cart, Customer Selection & Checkout (Col 5) */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
        <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-2xl shadow-glass flex-1 flex flex-col justify-between">
          <div>
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Bill Items ({cartItems.length})
                </h3>
              </div>

              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold"
                >
                  Clear Bill
                </button>
              )}
            </div>

            {/* Customer Picker Banner */}
            <div className="my-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const cust = customers.find((c) => c.id === e.target.value) || null;
                    setSelectedCustomer(cust);
                  }}
                  className="bg-transparent font-semibold text-slate-900 dark:text-white focus:outline-none truncate text-xs"
                >
                  <option value="">Walk-in Customer (Cash Sale)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.currentBalance > 0 ? `(Udhaar: ₹${c.currentBalance})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCustomerModalOpen(true)}
                title="Register New Customer"
                className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] hover:bg-indigo-100 shrink-0 flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" />
                <span>+ New</span>
              </button>
            </div>

            {/* If Customer Has Outstanding Balance Alert */}
            {selectedCustomer && selectedCustomer.currentBalance > 0 && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300">
                <span>Existing Udhaar Balance:</span>
                <span className="font-bold">₹{selectedCustomer.currentBalance}</span>
              </div>
            )}

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Bill is empty. Click any product from catalog on the left to add.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between gap-2 shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        ₹{item.unitPrice} / {item.unit} {item.taxRate > 0 ? `• GST ${item.taxRate}%` : ''}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="w-10 text-center font-bold text-xs bg-slate-50 dark:bg-slate-900 rounded py-0.5 border border-slate-200 dark:border-slate-700"
                      />

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right min-w-[65px]">
                      <p className="text-xs font-black text-slate-900 dark:text-white">
                        {formatCurrency(item.total)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[10px] text-slate-400 hover:text-rose-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Bottom Financial Summary & Checkout Options */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Bill Discount & Taxes Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1">
                <span>Discount:</span>
                <input
                  type="number"
                  min={0}
                  value={billDiscountVal || ''}
                  onChange={(e) => setBillDiscountVal(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-14 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-center"
                />
                <button
                  type="button"
                  onClick={() => setBillDiscountType(billDiscountType === 'flat' ? 'percent' : 'flat')}
                  className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold"
                >
                  {billDiscountType === 'flat' ? '₹' : '%'}
                </button>
              </div>

              <span>Subtotal: {formatCurrency(subtotal)}</span>
            </div>

            {/* Grand Total Highlight */}
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Total Payable
                </span>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {cartItems.length} items • GST Tax {formatCurrency(taxTotal)}
                </p>
              </div>
              <h2 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 tracking-tight">
                {formatCurrency(grandTotal)}
              </h2>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Payment Mode
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'Cash', label: 'Cash', icon: IndianRupee },
                  { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                  { id: 'Card', label: 'Card', icon: CreditCard },
                  { id: 'Credit', label: 'Credit (Udhaar)', icon: Wallet },
                  { id: 'Split', label: 'Split', icon: Percent },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as any)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center gap-1 transition-all text-[11px] font-semibold ${
                        paymentMethod === mode.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Payment Mode Fields */}
              {paymentMethod === 'Credit' && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                      Amount Paid Now (Cash / Advance):
                    </span>
                    <input
                      type="number"
                      value={amountPaidCustom}
                      onChange={(e) => setAmountPaidCustom(e.target.value)}
                      placeholder="0"
                      className="w-24 px-2 py-1 rounded bg-white dark:bg-slate-900 border text-right font-bold"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                    <span>Added to Customer's Bahi Khata (Udhaar):</span>
                    <span>{formatCurrency(remainingDue)}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'Split' && (
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Cash Paid (₹)</span>
                    <input
                      type="number"
                      value={splitCash}
                      onChange={(e) => setSplitCash(e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border text-right font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">UPI Paid (₹)</span>
                    <input
                      type="number"
                      value={splitUpi}
                      onChange={(e) => setSplitUpi(e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border text-right font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Complete Bill Action */}
            <button
              type="button"
              disabled={isSubmitting || cartItems.length === 0}
              onClick={handleCompleteBill}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-elevation transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Bill & Generate Receipt ({formatCurrency(grandTotal)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
