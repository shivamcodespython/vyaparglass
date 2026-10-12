import { db } from './db';
import {
  StoreProfile,
  Product,
  StockMovement,
  Customer,
  CustomerLedgerEntry,
  Invoice,
  PurchaseOrder,
  Supplier,
  SupplierLedgerEntry,
  PaymentRecord,
  OfferPromotion,
  CommunicationLog,
  AuditLog,
} from './schema';

export interface VyaparBackupData {
  version: number;
  appName: string;
  exportedAt: string;
  storeName: string;
  recordCounts: {
    products: number;
    invoices: number;
    purchases: number;
    customers: number;
    suppliers: number;
    movements: number;
  };
  tables: {
    storeProfile: StoreProfile[];
    products: Product[];
    stockMovements: StockMovement[];
    customers: Customer[];
    customerLedger: CustomerLedgerEntry[];
    invoices: Invoice[];
    purchases: PurchaseOrder[];
    suppliers: Supplier[];
    supplierLedger: SupplierLedgerEntry[];
    payments: PaymentRecord[];
    offers: OfferPromotion[];
    communications: CommunicationLog[];
    auditLogs: AuditLog[];
  };
}

/**
 * Request persistent browser storage so data won't be purged on low disk space
 */
export async function requestPersistentStorage(): Promise<{ isPersisted: boolean; message: string }> {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return {
      isPersisted: false,
      message: 'Persistent storage API is not supported in this browser.',
    };
  }

  try {
    const isPersisted = await navigator.storage.persist();
    return {
      isPersisted,
      message: isPersisted
        ? 'Persistent browser storage granted. Local records are protected from automatic browser eviction.'
        : 'Browser storage is managed by the browser heuristic. Regular backups are strongly advised.',
    };
  } catch (err: any) {
    return {
      isPersisted: false,
      message: `Failed to request persistent storage: ${err?.message || 'Unknown error'}`,
    };
  }
}

/**
 * Export entire database to a validated JSON file
 */
export async function exportDatabaseBackup(): Promise<VyaparBackupData> {
  const storeProfile = await db.storeProfile.toArray();
  const products = await db.products.toArray();
  const stockMovements = await db.stockMovements.toArray();
  const customers = await db.customers.toArray();
  const customerLedger = await db.customerLedger.toArray();
  const invoices = await db.invoices.toArray();
  const purchases = await db.purchases.toArray();
  const suppliers = await db.suppliers.toArray();
  const supplierLedger = await db.supplierLedger.toArray();
  const payments = await db.payments.toArray();
  const offers = await db.offers.toArray();
  const communications = await db.communications.toArray();
  const auditLogs = await db.auditLogs.toArray();

  const primaryProfile = storeProfile[0];

  const backup: VyaparBackupData = {
    version: 1,
    appName: primaryProfile?.appName || 'VyaparGlass',
    storeName: primaryProfile?.storeName || 'My Retail Store',
    exportedAt: new Date().toISOString(),
    recordCounts: {
      products: products.length,
      invoices: invoices.length,
      purchases: purchases.length,
      customers: customers.length,
      suppliers: suppliers.length,
      movements: stockMovements.length,
    },
    tables: {
      storeProfile,
      products,
      stockMovements,
      customers,
      customerLedger,
      invoices,
      purchases,
      suppliers,
      supplierLedger,
      payments,
      offers,
      communications,
      auditLogs,
    },
  };

  return backup;
}

/**
 * Validate imported JSON backup file before restoration
 */
export function validateBackupFile(data: any): { isValid: boolean; error?: string; metadata?: any } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'File does not contain valid JSON object.' };
  }

  if (!data.tables || typeof data.tables !== 'object') {
    return { isValid: false, error: 'Missing tables payload in backup structure.' };
  }

  const requiredTables = ['products', 'invoices', 'customers', 'storeProfile'];
  for (const table of requiredTables) {
    if (!Array.isArray(data.tables[table])) {
      return { isValid: false, error: `Invalid or missing table array: "${table}".` };
    }
  }

  return {
    isValid: true,
    metadata: {
      appName: data.appName || 'VyaparGlass',
      storeName: data.storeName || 'Unknown Store',
      exportedAt: data.exportedAt,
      recordCounts: data.recordCounts || {
        products: data.tables.products?.length || 0,
        invoices: data.tables.invoices?.length || 0,
        customers: data.tables.customers?.length || 0,
      },
    },
  };
}

/**
 * Restore database from validated backup data atomically
 */
export async function restoreDatabaseFromBackup(backup: VyaparBackupData): Promise<void> {
  const { tables } = backup;

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
      db.payments,
      db.offers,
      db.communications,
      db.auditLogs,
    ],
    async () => {
      // 1. Clear existing records safely
      await db.storeProfile.clear();
      await db.products.clear();
      await db.stockMovements.clear();
      await db.customers.clear();
      await db.customerLedger.clear();
      await db.invoices.clear();
      await db.purchases.clear();
      await db.suppliers.clear();
      await db.supplierLedger.clear();
      await db.payments.clear();
      await db.offers.clear();
      await db.communications.clear();
      await db.auditLogs.clear();

      // 2. Populate records
      if (tables.storeProfile?.length) await db.storeProfile.bulkAdd(tables.storeProfile);
      if (tables.products?.length) await db.products.bulkAdd(tables.products);
      if (tables.stockMovements?.length) await db.stockMovements.bulkAdd(tables.stockMovements);
      if (tables.customers?.length) await db.customers.bulkAdd(tables.customers);
      if (tables.customerLedger?.length) await db.customerLedger.bulkAdd(tables.customerLedger);
      if (tables.invoices?.length) await db.invoices.bulkAdd(tables.invoices);
      if (tables.purchases?.length) await db.purchases.bulkAdd(tables.purchases);
      if (tables.suppliers?.length) await db.suppliers.bulkAdd(tables.suppliers);
      if (tables.supplierLedger?.length) await db.supplierLedger.bulkAdd(tables.supplierLedger);
      if (tables.payments?.length) await db.payments.bulkAdd(tables.payments);
      if (tables.offers?.length) await db.offers.bulkAdd(tables.offers);
      if (tables.communications?.length) await db.communications.bulkAdd(tables.communications);
      if (tables.auditLogs?.length) await db.auditLogs.bulkAdd(tables.auditLogs);

      await db.auditLogs.add({
        id: `audit_restore_${Date.now()}`,
        action: 'RESTORE_COMPLETED',
        entityType: 'database',
        entityId: 'backup',
        details: `Restored backup from ${backup.exportedAt} (${backup.storeName})`,
        timestamp: new Date().toISOString(),
      });
    }
  );
}

/**
 * Trigger file download in browser
 */
export function downloadBackupFile(backup: VyaparBackupData): void {
  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitizedStore = (backup.storeName || 'VyaparGlass').replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  link.href = url;
  link.download = `${sanitizedStore}_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
