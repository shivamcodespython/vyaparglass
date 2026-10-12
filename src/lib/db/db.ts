import {
  VyaparDatabase,
  StoreProfile,
  Product,
  StockMovement,
  Customer,
  CustomerLedgerEntry,
  Invoice,
  InvoiceItem,
  PurchaseOrder,
  PurchaseItem,
  Supplier,
  SupplierLedgerEntry,
  PaymentRecord,
  AuditLog,
} from './schema';
import {
  DEFAULT_STORE_CONFIG,
  DEMO_PRODUCTS,
  DEMO_CUSTOMERS,
  DEMO_SUPPLIERS,
  DEMO_OFFERS,
} from './initialData';

// Singleton instance
export const db = new VyaparDatabase();

/**
 * Initialize database and check if store profile exists.
 * Returns true if initial setup is required.
 */
export async function initializeDatabase(): Promise<{ isFirstRun: boolean; profile: StoreProfile | null }> {
  try {
    const profile = await db.storeProfile.get('primary_store');
    if (!profile) {
      return { isFirstRun: true, profile: null };
    }
    return { isFirstRun: false, profile };
  } catch (err) {
    console.error('Failed to initialize database:', err);
    return { isFirstRun: true, profile: null };
  }
}

/**
 * Setup or update the store profile
 */
export async function saveStoreProfile(profile: StoreProfile): Promise<void> {
  await db.storeProfile.put({
    ...profile,
    id: 'primary_store',
    updatedAt: new Date().toISOString(),
  });
  await logAuditEvent('STORE_PROFILE_UPDATED', 'storeProfile', 'primary_store', `Profile saved for ${profile.storeName}`);
}

/**
 * Seed demo data for testing and demonstrations
 */
export async function seedDemoData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.storeProfile,
      db.products,
      db.stockMovements,
      db.customers,
      db.customerLedger,
      db.invoices,
      db.purchases,
      db.suppliers,
      db.supplierLedger,
      db.offers,
      db.auditLogs,
    ],
    async () => {
      // Save store profile
      await db.storeProfile.put(DEFAULT_STORE_CONFIG);

      // Seed products & opening stock movements
      for (const prod of DEMO_PRODUCTS) {
        await db.products.put(prod);
        // Create initial stock movement
        await db.stockMovements.put({
          id: `sm_init_${prod.id}`,
          productId: prod.id,
          productName: prod.name,
          quantityChange: prod.stockQuantity,
          quantityAfter: prod.stockQuantity,
          type: 'OPENING',
          referenceType: 'MANUAL',
          unitCostSnapshot: prod.purchaseCost,
          reason: 'Initial opening stock',
          timestamp: prod.createdAt,
        });
      }

      // Seed customers
      for (const cust of DEMO_CUSTOMERS) {
        await db.customers.put(cust);
        if (cust.currentBalance > 0) {
          await db.customerLedger.put({
            id: `cl_open_${cust.id}`,
            customerId: cust.id,
            customerName: cust.name,
            date: cust.createdAt,
            type: 'OPENING_BALANCE',
            debit: cust.currentBalance,
            credit: 0,
            balanceAfter: cust.currentBalance,
            description: 'Opening balance (Previous Udhaar)',
            createdAt: cust.createdAt,
          });
        }
      }

      // Seed suppliers
      for (const sup of DEMO_SUPPLIERS) {
        await db.suppliers.put(sup);
        if (sup.currentBalance > 0) {
          await db.supplierLedger.put({
            id: `sl_open_${sup.id}`,
            supplierId: sup.id,
            supplierName: sup.name,
            date: sup.createdAt,
            type: 'OPENING_BALANCE',
            amount: sup.currentBalance,
            balanceAfter: sup.currentBalance,
            description: 'Opening balance payable',
            createdAt: sup.createdAt,
          });
        }
      }

      // Seed offers
      for (const off of DEMO_OFFERS) {
        await db.offers.put(off);
      }

      // Add a couple of initial completed invoices for realistic dashboard stats
      const initialInvoiceId = 'inv_demo_001';
      const sampleItem1 = DEMO_PRODUCTS[0]; // Tata Tea
      const sampleItem2 = DEMO_PRODUCTS[3]; // Philips LED
      const invItems: InvoiceItem[] = [
        {
          productId: sampleItem1.id,
          productName: sampleItem1.name,
          sku: sampleItem1.sku,
          quantity: 2,
          unit: sampleItem1.unit,
          unitPrice: sampleItem1.sellingPrice,
          unitCost: sampleItem1.purchaseCost,
          discountPercent: 0,
          discountAmount: 0,
          taxRate: sampleItem1.taxRate,
          taxAmount: Math.round(sampleItem1.sellingPrice * 2 * (sampleItem1.taxRate / 100) * 100) / 100,
          total: sampleItem1.sellingPrice * 2,
        },
        {
          productId: sampleItem2.id,
          productName: sampleItem2.name,
          sku: sampleItem2.sku,
          quantity: 1,
          unit: sampleItem2.unit,
          unitPrice: sampleItem2.sellingPrice,
          unitCost: sampleItem2.purchaseCost,
          discountPercent: 0,
          discountAmount: 0,
          taxRate: sampleItem2.taxRate,
          taxAmount: Math.round(sampleItem2.sellingPrice * (sampleItem2.taxRate / 100) * 100) / 100,
          total: sampleItem2.sellingPrice,
        },
      ];

      const invSubtotal = invItems.reduce((s, i) => s + i.total, 0); // 640 + 110 = 750
      const invTax = invItems.reduce((s, i) => s + i.taxAmount, 0);
      const invCogs = invItems.reduce((s, i) => s + i.unitCost * i.quantity, 0); // 265*2 + 75 = 605
      const grandTotal = invSubtotal + invTax;

      await db.invoices.put({
        id: initialInvoiceId,
        invoiceNumber: 'VG-2026-0001',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        customerId: DEMO_CUSTOMERS[0].id,
        customerName: DEMO_CUSTOMERS[0].name,
        customerPhone: DEMO_CUSTOMERS[0].phone,
        items: invItems,
        subtotal: invSubtotal,
        itemDiscountTotal: 0,
        billDiscountAmount: 0,
        taxTotal: invTax,
        grandTotal: Math.round(grandTotal),
        totalCogs: invCogs,
        estimatedGrossProfit: Math.round(grandTotal - invTax - invCogs),
        amountPaid: Math.round(grandTotal),
        remainingDue: 0,
        paymentMethod: 'UPI',
        status: 'Completed',
        notes: 'Walk-in regular order paid via GooglePay UPI',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      });

      await logAuditEvent('DEMO_SEEDED', 'system', 'system', 'Seeded realistic Indian retail data');
    }
  );
}

/**
 * Generate sequential invoice number
 */
export async function getNextInvoiceNumber(): Promise<string> {
  const count = await db.invoices.count();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `VG-${year}-${seq}`;
}

/**
 * Generate sequential purchase order number
 */
export async function getNextPurchaseNumber(): Promise<string> {
  const count = await db.purchases.count();
  const year = new Date().getFullYear();
  const seq = String(count + 1).padStart(4, '0');
  return `PO-${year}-${seq}`;
}

/**
 * Create a sales invoice atomically:
 * 1. Checks and verifies inventory availability
 * 2. Deducts product stock and adds StockMovement entry
 * 3. Records Invoice
 * 4. If credit given (due > 0), updates Customer balance and adds CustomerLedgerEntry
 */
export async function createSaleInvoice(data: {
  invoiceNumber?: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  itemDiscountTotal: number;
  billDiscountAmount: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  remainingDue: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Credit';
  paymentDetails?: { cashAmount?: number; upiAmount?: number; cardAmount?: number };
  notes?: string;
}): Promise<Invoice> {
  const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const invoiceNumber = data.invoiceNumber || (await getNextInvoiceNumber());
  const now = new Date().toISOString();

  // Fetch store profile to check negative stock preference
  const profile = await db.storeProfile.get('primary_store');
  const allowNegative = profile?.allowNegativeStock ?? false;

  return await db.transaction(
    'rw',
    [
      db.invoices,
      db.products,
      db.stockMovements,
      db.customers,
      db.customerLedger,
      db.payments,
      db.auditLogs,
    ],
    async () => {
      // 1. Validate stock availability and calculate accurate COGS
      let totalCogs = 0;
      for (const item of data.items) {
        const prod = await db.products.get(item.productId);
        if (!prod) {
          throw new Error(`Product "${item.productName}" not found in database.`);
        }

        if (!allowNegative && prod.stockQuantity < item.quantity) {
          throw new Error(
            `Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity} ${prod.unit}, Requested: ${item.quantity} ${prod.unit}.`
          );
        }

        // Snapshot COGS with actual current purchase cost
        const lineCogs = (item.unitCost || prod.purchaseCost) * item.quantity;
        totalCogs += lineCogs;
      }

      // Calculate estimated gross profit
      // Net Sales (grandTotal - taxTotal - billDiscountAmount) minus COGS
      const netSales = data.grandTotal - data.taxTotal;
      const estimatedGrossProfit = Math.round((netSales - totalCogs) * 100) / 100;

      // 2. Deduct inventory & record stock movements
      for (const item of data.items) {
        const prod = (await db.products.get(item.productId))!;
        const newQty = prod.stockQuantity - item.quantity;

        await db.products.update(item.productId, {
          stockQuantity: newQty,
          updatedAt: now,
        });

        await db.stockMovements.add({
          id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: item.productId,
          productName: item.productName,
          quantityChange: -item.quantity, // Negative for sale deduction
          quantityAfter: newQty,
          type: 'SALE',
          referenceType: 'INVOICE',
          referenceId: invoiceId,
          unitCostSnapshot: item.unitCost || prod.purchaseCost,
          reason: `Sale on Bill #${invoiceNumber}`,
          timestamp: now,
        });
      }

      // 3. Create invoice record
      const invoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        date: now,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        items: data.items,
        subtotal: data.subtotal,
        itemDiscountTotal: data.itemDiscountTotal,
        billDiscountAmount: data.billDiscountAmount,
        taxTotal: data.taxTotal,
        grandTotal: data.grandTotal,
        totalCogs,
        estimatedGrossProfit,
        amountPaid: data.amountPaid,
        remainingDue: data.remainingDue,
        paymentMethod: data.paymentMethod,
        paymentDetails: data.paymentDetails,
        status: 'Completed',
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      };

      await db.invoices.add(invoice);

      // 4. If customer credit is involved (remainingDue > 0 or payment recorded), update Bahi Khata
      if (data.customerId) {
        const cust = await db.customers.get(data.customerId);
        if (cust) {
          let updatedBalance = cust.currentBalance;

          // If there's an outstanding balance from this bill, add Udhaar to ledger
          if (data.remainingDue > 0) {
            updatedBalance += data.remainingDue;
            await db.customerLedger.add({
              id: `cl_${Date.now()}_due`,
              customerId: cust.id,
              customerName: cust.name,
              date: now,
              type: 'CREDIT_SALE',
              debit: data.remainingDue,
              credit: 0,
              balanceAfter: updatedBalance,
              referenceId: invoiceId,
              description: `Udhaar on Bill #${invoiceNumber} (Total ₹${data.grandTotal}, Paid ₹${data.amountPaid})`,
              createdAt: now,
            });
          }

          // If payment was made on this bill by a registered customer
          if (data.amountPaid > 0) {
            await db.customerLedger.add({
              id: `cl_${Date.now()}_paid`,
              customerId: cust.id,
              customerName: cust.name,
              date: now,
              type: 'PAYMENT_RECEIVED',
              debit: 0,
              credit: data.amountPaid,
              balanceAfter: updatedBalance, // Balance after paying for this bill
              paymentMode: (data.paymentMethod === 'Split' ? 'Cash' : data.paymentMethod) as any,
              referenceId: invoiceId,
              description: `Payment for Bill #${invoiceNumber}`,
              createdAt: now,
            });
          }

          await db.customers.update(cust.id, {
            currentBalance: updatedBalance,
            updatedAt: now,
          });
        }
      }

      await logAuditEvent('INVOICE_CREATED', 'invoice', invoiceId, `Created Invoice ${invoiceNumber} for ₹${data.grandTotal}`);

      return invoice;
    }
  );
}

/**
 * Record a Goods Purchase from a supplier:
 * 1. Increases product inventory quantities
 * 2. Writes StockMovement records with type 'PURCHASE'
 * 3. Updates supplier balance & ledger if payable exists
 */
export async function recordGoodsPurchase(data: {
  supplierInvoiceNo?: string;
  supplierId?: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  subtotal: number;
  taxTotal: number;
  otherCharges: number;
  grandTotal: number;
  amountPaid: number;
  remainingDue: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit';
  notes?: string;
}): Promise<PurchaseOrder> {
  const purchaseId = `po_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const purchaseNumber = await getNextPurchaseNumber();
  const now = new Date().toISOString();

  return await db.transaction(
    'rw',
    [
      db.purchases,
      db.products,
      db.stockMovements,
      db.suppliers,
      db.supplierLedger,
      db.auditLogs,
    ],
    async () => {
      // 1. Increase stock for each purchased item
      for (const item of data.items) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newQty = prod.stockQuantity + item.quantity;
          // Update product purchase cost to latest purchase cost
          await db.products.update(item.productId, {
            stockQuantity: newQty,
            purchaseCost: item.unitCost, // Update to latest cost
            updatedAt: now,
          });

          await db.stockMovements.add({
            id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: item.productId,
            productName: item.productName,
            quantityChange: item.quantity, // Positive for inward purchase
            quantityAfter: newQty,
            type: 'PURCHASE',
            referenceType: 'PURCHASE',
            referenceId: purchaseId,
            unitCostSnapshot: item.unitCost,
            reason: `Purchase order ${purchaseNumber}`,
            timestamp: now,
          });
        }
      }

      // 2. Create purchase order
      const purchase: PurchaseOrder = {
        id: purchaseId,
        purchaseNumber,
        supplierInvoiceNo: data.supplierInvoiceNo,
        date: now,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        supplierPhone: data.supplierPhone,
        items: data.items,
        subtotal: data.subtotal,
        taxTotal: data.taxTotal,
        otherCharges: data.otherCharges,
        grandTotal: data.grandTotal,
        amountPaid: data.amountPaid,
        remainingDue: data.remainingDue,
        paymentMethod: data.paymentMethod,
        status: 'Received',
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      };

      await db.purchases.add(purchase);

      // 3. Update supplier dues if supplierId is present
      if (data.supplierId && data.remainingDue > 0) {
        const sup = await db.suppliers.get(data.supplierId);
        if (sup) {
          const newBal = sup.currentBalance + data.remainingDue;
          await db.suppliers.update(sup.id, {
            currentBalance: newBal,
            updatedAt: now,
          });

          await db.supplierLedger.add({
            id: `sl_${Date.now()}`,
            supplierId: sup.id,
            supplierName: sup.name,
            date: now,
            type: 'PURCHASE_CREDIT',
            amount: data.remainingDue,
            balanceAfter: newBal,
            referenceId: purchaseId,
            description: `Purchase #${purchaseNumber} (Total ₹${data.grandTotal}, Paid ₹${data.amountPaid})`,
            createdAt: now,
          });
        }
      }

      await logAuditEvent('PURCHASE_RECORDED', 'purchase', purchaseId, `Recorded purchase ${purchaseNumber} for ₹${data.grandTotal}`);

      return purchase;
    }
  );
}

/**
 * Process a product return / invoice refund safely:
 * 1. Restores the returned product quantities to inventory
 * 2. Writes StockMovement records ('RETURN_IN')
 * 3. Updates invoice status to 'Partially Refunded' or 'Refunded'
 * 4. Adjusts customer ledger if needed
 */
export async function processSaleReturn(
  invoiceId: string,
  returnedItems: { productId: string; quantity: number; refundAmount: number; returnReason: string }[]
): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [
      db.invoices,
      db.products,
      db.stockMovements,
      db.customers,
      db.customerLedger,
      db.auditLogs,
    ],
    async () => {
      const inv = await db.invoices.get(invoiceId);
      if (!inv) throw new Error('Invoice not found');

      let totalRefund = 0;

      for (const ret of returnedItems) {
        totalRefund += ret.refundAmount;
        const prod = await db.products.get(ret.productId);
        if (prod) {
          const restoredQty = prod.stockQuantity + ret.quantity;
          await db.products.update(ret.productId, {
            stockQuantity: restoredQty,
            updatedAt: now,
          });

          await db.stockMovements.add({
            id: `sm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            productId: ret.productId,
            productName: prod.name,
            quantityChange: ret.quantity, // Positive for restocking returned goods
            quantityAfter: restoredQty,
            type: 'RETURN_IN',
            referenceType: 'RETURN',
            referenceId: invoiceId,
            unitCostSnapshot: prod.purchaseCost,
            reason: `Return on Bill #${inv.invoiceNumber}: ${ret.returnReason}`,
            timestamp: now,
          });
        }
      }

      // Check if all items are fully returned or partial
      const isFullReturn = totalRefund >= inv.grandTotal;
      await db.invoices.update(invoiceId, {
        status: isFullReturn ? 'Refunded' : 'Partially Refunded',
        updatedAt: now,
      });

      // Update customer ledger if customer is associated
      if (inv.customerId) {
        const cust = await db.customers.get(inv.customerId);
        if (cust) {
          const newBal = Math.max(0, cust.currentBalance - totalRefund);
          await db.customers.update(cust.id, {
            currentBalance: newBal,
            updatedAt: now,
          });

          await db.customerLedger.add({
            id: `cl_${Date.now()}_ret`,
            customerId: cust.id,
            customerName: cust.name,
            date: now,
            type: 'RETURN_CREDIT',
            debit: 0,
            credit: totalRefund,
            balanceAfter: newBal,
            referenceId: invoiceId,
            description: `Return refund on Bill #${inv.invoiceNumber} (-₹${totalRefund})`,
            createdAt: now,
          });
        }
      }

      await logAuditEvent('INVOICE_RETURNED', 'invoice', invoiceId, `Processed return for ₹${totalRefund} on Bill #${inv.invoiceNumber}`);
    }
  );
}

/**
 * Cancel an invoice completely and restore all stock
 */
export async function cancelInvoice(invoiceId: string, reason: string): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [
      db.invoices,
      db.products,
      db.stockMovements,
      db.customers,
      db.customerLedger,
      db.auditLogs,
    ],
    async () => {
      const inv = await db.invoices.get(invoiceId);
      if (!inv) throw new Error('Invoice not found');
      if (inv.status === 'Cancelled') throw new Error('Invoice is already cancelled');

      // 1. Restore all product stock
      for (const item of inv.items) {
        const prod = await db.products.get(item.productId);
        if (prod) {
          const newQty = prod.stockQuantity + item.quantity;
          await db.products.update(item.productId, {
            stockQuantity: newQty,
            updatedAt: now,
          });

          await db.stockMovements.add({
            id: `sm_${Date.now()}_rev`,
            productId: item.productId,
            productName: item.productName,
            quantityChange: item.quantity,
            quantityAfter: newQty,
            type: 'CANCELLATION_REVERSAL',
            referenceType: 'INVOICE',
            referenceId: invoiceId,
            unitCostSnapshot: item.unitCost,
            reason: `Cancelled Bill #${inv.invoiceNumber}: ${reason}`,
            timestamp: now,
          });
        }
      }

      // 2. Reverse customer balance if credit was pending
      if (inv.customerId && inv.remainingDue > 0) {
        const cust = await db.customers.get(inv.customerId);
        if (cust) {
          const newBal = Math.max(0, cust.currentBalance - inv.remainingDue);
          await db.customers.update(cust.id, {
            currentBalance: newBal,
            updatedAt: now,
          });

          await db.customerLedger.add({
            id: `cl_${Date.now()}_can`,
            customerId: cust.id,
            customerName: cust.name,
            date: now,
            type: 'ADJUSTMENT',
            debit: 0,
            credit: inv.remainingDue,
            balanceAfter: newBal,
            referenceId: invoiceId,
            description: `Cancelled Bill #${inv.invoiceNumber} (-₹${inv.remainingDue})`,
            createdAt: now,
          });
        }
      }

      // 3. Mark invoice cancelled
      await db.invoices.update(invoiceId, {
        status: 'Cancelled',
        notes: `${inv.notes ? inv.notes + ' | ' : ''}Cancelled: ${reason}`,
        updatedAt: now,
      });

      await logAuditEvent('INVOICE_CANCELLED', 'invoice', invoiceId, `Cancelled invoice ${inv.invoiceNumber}: ${reason}`);
    }
  );
}

/**
 * Record a Customer Payment (Jama / Receipt) in Digital Bahi Khata
 */
export async function recordCustomerPayment(data: {
  customerId: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  notes?: string;
}): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [db.customers, db.customerLedger, db.payments, db.auditLogs],
    async () => {
      const cust = await db.customers.get(data.customerId);
      if (!cust) throw new Error('Customer not found');

      // Deduct paid amount from customer outstanding balance
      const newBalance = cust.currentBalance - data.amount;

      await db.customers.update(cust.id, {
        currentBalance: newBalance,
        updatedAt: now,
      });

      const paymentId = `pay_${Date.now()}`;

      await db.payments.add({
        id: paymentId,
        type: 'CUSTOMER_PAYMENT',
        partyId: cust.id,
        partyName: cust.name,
        partyPhone: cust.phone,
        date: now,
        amount: data.amount,
        paymentMode: data.paymentMode,
        referenceNo: data.referenceNo,
        notes: data.notes,
        createdAt: now,
      });

      await db.customerLedger.add({
        id: `cl_${Date.now()}`,
        customerId: cust.id,
        customerName: cust.name,
        date: now,
        type: 'PAYMENT_RECEIVED',
        debit: 0,
        credit: data.amount,
        balanceAfter: newBalance,
        paymentMode: data.paymentMode,
        referenceId: paymentId,
        description: `Payment received (Jama) via ${data.paymentMode}${data.referenceNo ? ` [Ref: ${data.referenceNo}]` : ''}${data.notes ? ` - ${data.notes}` : ''}`,
        createdAt: now,
      });

      await logAuditEvent('CUSTOMER_PAYMENT', 'customer', cust.id, `Received payment ₹${data.amount} from ${cust.name}`);
    }
  );
}

/**
 * Record a Supplier Payment
 */
export async function recordSupplierPayment(data: {
  supplierId: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  notes?: string;
}): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction(
    'rw',
    [db.suppliers, db.supplierLedger, db.payments, db.auditLogs],
    async () => {
      const sup = await db.suppliers.get(data.supplierId);
      if (!sup) throw new Error('Supplier not found');

      const newBalance = sup.currentBalance - data.amount;

      await db.suppliers.update(sup.id, {
        currentBalance: newBalance,
        updatedAt: now,
      });

      const paymentId = `spay_${Date.now()}`;

      await db.payments.add({
        id: paymentId,
        type: 'SUPPLIER_PAYMENT',
        partyId: sup.id,
        partyName: sup.name,
        partyPhone: sup.phone,
        date: now,
        amount: data.amount,
        paymentMode: data.paymentMode,
        referenceNo: data.referenceNo,
        notes: data.notes,
        createdAt: now,
      });

      await db.supplierLedger.add({
        id: `sl_${Date.now()}`,
        supplierId: sup.id,
        supplierName: sup.name,
        date: now,
        type: 'PAYMENT_MADE',
        amount: data.amount,
        balanceAfter: newBalance,
        paymentMode: data.paymentMode,
        referenceId: paymentId,
        description: `Payment made via ${data.paymentMode}${data.referenceNo ? ` [Ref: ${data.referenceNo}]` : ''}`,
        createdAt: now,
      });

      await logAuditEvent('SUPPLIER_PAYMENT', 'supplier', sup.id, `Paid ₹${data.amount} to ${sup.name}`);
    }
  );
}

/**
 * Perform manual stock adjustment with required reason
 */
export async function recordStockAdjustment(data: {
  productId: string;
  newQuantity: number;
  reason: string;
}): Promise<void> {
  const now = new Date().toISOString();

  await db.transaction('rw', [db.products, db.stockMovements, db.auditLogs], async () => {
    const prod = await db.products.get(data.productId);
    if (!prod) throw new Error('Product not found');

    const qtyDiff = data.newQuantity - prod.stockQuantity;
    if (qtyDiff === 0) return;

    await db.products.update(data.productId, {
      stockQuantity: data.newQuantity,
      updatedAt: now,
    });

    await db.stockMovements.add({
      id: `sm_${Date.now()}_adj`,
      productId: data.productId,
      productName: prod.name,
      quantityChange: qtyDiff,
      quantityAfter: data.newQuantity,
      type: 'ADJUSTMENT',
      referenceType: 'MANUAL',
      unitCostSnapshot: prod.purchaseCost,
      reason: data.reason,
      timestamp: now,
    });

    await logAuditEvent('STOCK_ADJUSTMENT', 'product', data.productId, `Stock adjusted for ${prod.name} from ${prod.stockQuantity} to ${data.newQuantity}: ${data.reason}`);
  });
}

/**
 * Audit log helper
 */
export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId: string,
  details: string
): Promise<void> {
  try {
    await db.auditLogs.add({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
