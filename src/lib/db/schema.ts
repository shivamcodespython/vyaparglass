import Dexie, { type Table } from 'dexie';

export interface StoreProfile {
  id: string; // e.g. 'primary_store'
  storeName: string;
  appName: string; // 'VyaparGlass' (configurable)
  ownerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  category: string;
  currency: string; // e.g. '₹'
  currencyCode: string; // 'INR'
  gstin?: string;
  taxEnabled: boolean;
  defaultTaxRate: number; // e.g. 0, 5, 12, 18
  appPin: string; // e.g. '1234'
  pinRequired: boolean;
  autoLockMinutes: number; // 0 = never, 5, 15, 30
  allowNegativeStock: boolean;
  logoUrl?: string; // base64 / data url
  receiptHeader?: string;
  receiptFooter?: string;
  upiId?: string; // e.g. 'shopname@upi'
  smsProvider?: {
    provider: 'manual' | 'mock' | 'fast2sms';
    apiKey?: string;
    senderId?: string;
    isConfigured: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export type UnitOfMeasure =
  | 'Pcs'
  | 'Packet'
  | 'Box'
  | 'Kg'
  | 'Gram'
  | 'Litre'
  | 'Ml'
  | 'Metre'
  | 'Dozen'
  | 'Set';

export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  category: string;
  brand?: string;
  description?: string;
  purchaseCost: number; // Unit cost in INR
  sellingPrice: number; // Selling price per unit
  mrp?: number;
  stockQuantity: number;
  unit: UnitOfMeasure;
  lowStockThreshold: number;
  taxRate: number; // % e.g. 0, 5, 12, 18
  supplierId?: string;
  supplierName?: string;
  expiryDate?: string;
  batchNumber?: string;
  imageUrl?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type StockMovementType =
  | 'OPENING'
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN_IN'
  | 'RETURN_OUT'
  | 'ADJUSTMENT'
  | 'CANCELLATION_REVERSAL';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantityChange: number; // Positive (addition) or Negative (deduction)
  quantityAfter: number;
  type: StockMovementType;
  referenceType: 'INVOICE' | 'PURCHASE' | 'MANUAL' | 'RETURN';
  referenceId?: string;
  unitCostSnapshot: number;
  reason?: string;
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  notes?: string;
  currentBalance: number; // Positive = Customer owes shop (Udhaar/Receivable), Negative = Advance/Jama
  creditLimit?: number;
  marketingConsent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerLedgerEntryType =
  | 'CREDIT_SALE'
  | 'PAYMENT_RECEIVED'
  | 'RETURN_CREDIT'
  | 'ADJUSTMENT'
  | 'OPENING_BALANCE';

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  type: CustomerLedgerEntryType;
  debit: number; // Udhaar added to customer
  credit: number; // Payment received from customer (Jama)
  balanceAfter: number; // Signed balance after entry
  paymentMode?: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice: number;
  unitCost: number; // Snapshotted purchase cost at time of sale for accurate COGS
  discountPercent: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export type InvoiceStatus =
  | 'Completed'
  | 'Partially Refunded'
  | 'Refunded'
  | 'Cancelled'
  | 'Draft';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "VG-2026-0001"
  date: string; // ISO string
  customerId?: string;
  customerName: string; // Walk-in or Customer Name
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  itemDiscountTotal: number;
  billDiscountAmount: number;
  taxTotal: number;
  grandTotal: number;
  totalCogs: number; // Sum of (item.unitCost * item.quantity)
  estimatedGrossProfit: number; // grandTotal - taxTotal - totalCogs - billDiscountAmount
  amountPaid: number;
  remainingDue: number; // Credit given (Udhaar)
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Split' | 'Credit';
  paymentDetails?: {
    cashAmount?: number;
    upiAmount?: number;
    cardAmount?: number;
  };
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  taxRate: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  purchaseNumber: string; // e.g. "PO-2026-0001"
  supplierInvoiceNo?: string;
  date: string;
  supplierId?: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  subtotal: number;
  taxTotal: number;
  otherCharges: number;
  grandTotal: number;
  amountPaid: number;
  remainingDue: number; // Payable to supplier
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Credit';
  status: 'Received' | 'Draft' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  address?: string;
  currentBalance: number; // Amount we owe supplier
  createdAt: string;
  updatedAt: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  type: 'PURCHASE_CREDIT' | 'PAYMENT_MADE' | 'RETURN_DEBIT' | 'ADJUSTMENT' | 'OPENING_BALANCE';
  amount: number;
  balanceAfter: number;
  paymentMode?: string;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  type: 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT';
  partyId: string;
  partyName: string;
  partyPhone?: string;
  date: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque';
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

export interface OfferPromotion {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FLAT' | 'BOGO' | 'CUSTOM';
  discountValue: number;
  targetCategory?: string;
  targetAudience: 'ALL' | 'FREQUENT_BUYERS' | 'DUE_CLEARERS' | 'INACTIVE';
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
  createdAt: string;
}

export interface CommunicationLog {
  id: string;
  recipientName: string;
  recipientPhone: string;
  type: 'BILL_SHARE' | 'PAYMENT_REMINDER' | 'OFFER_BROADCAST' | 'LEDGER_STATEMENT';
  channel: 'WHATSAPP' | 'SMS_MANUAL' | 'SMS_GATEWAY';
  message: string;
  status: 'PREPARED' | 'SENT_CLIENT_FALLBACK' | 'CONFIRMED_DELIVERED' | 'FAILED';
  referenceId?: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export class VyaparDatabase extends Dexie {
  storeProfile!: Table<StoreProfile, string>;
  products!: Table<Product, string>;
  stockMovements!: Table<StockMovement, string>;
  customers!: Table<Customer, string>;
  customerLedger!: Table<CustomerLedgerEntry, string>;
  invoices!: Table<Invoice, string>;
  purchases!: Table<PurchaseOrder, string>;
  suppliers!: Table<Supplier, string>;
  supplierLedger!: Table<SupplierLedgerEntry, string>;
  payments!: Table<PaymentRecord, string>;
  offers!: Table<OfferPromotion, string>;
  communications!: Table<CommunicationLog, string>;
  auditLogs!: Table<AuditLog, string>;

  constructor() {
    super('VyaparGlass_RetailDB');

    this.version(1).stores({
      storeProfile: 'id',
      products: 'id, sku, barcode, name, category, supplierId, isArchived, createdAt',
      stockMovements: 'id, productId, type, referenceId, timestamp',
      customers: 'id, name, phone, createdAt',
      customerLedger: 'id, customerId, date, type, referenceId',
      invoices: 'id, invoiceNumber, date, customerId, status, paymentMethod, createdAt',
      purchases: 'id, purchaseNumber, date, supplierId, status, createdAt',
      suppliers: 'id, name, phone, createdAt',
      supplierLedger: 'id, supplierId, date, type',
      payments: 'id, type, partyId, date, paymentMode',
      offers: 'id, status, startDate, expiryDate',
      communications: 'id, type, channel, timestamp, recipientPhone',
      auditLogs: 'id, entityType, timestamp',
    });
  }
}
