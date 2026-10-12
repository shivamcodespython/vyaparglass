'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  db,
  initializeDatabase,
  saveStoreProfile,
  seedDemoData,
  logAuditEvent,
} from '@/lib/db/db';
import {
  StoreProfile,
  Product,
  Customer,
  Supplier,
  Invoice,
  PurchaseOrder,
  StockMovement,
  CustomerLedgerEntry,
  OfferPromotion,
  AuditLog,
} from '@/lib/db/schema';
import { DEFAULT_STORE_CONFIG } from '@/lib/db/initialData';

export type VyaparTab =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'purchases'
  | 'customers'
  | 'suppliers'
  | 'transactions'
  | 'reports'
  | 'offers'
  | 'settings'
  | 'test_suite';

interface ToastInfo {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface VyaparContextType {
  // Initialization & Store
  isInitialized: boolean;
  isFirstRun: boolean;
  setIsFirstRun: (val: boolean) => void;
  storeProfile: StoreProfile;
  updateStoreProfile: (profile: Partial<StoreProfile>) => Promise<void>;
  resetToDemoData: () => Promise<void>;
  clearAllData: () => Promise<void>;

  // Security & App Lock
  isLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  togglePinRequired: (required: boolean, pin?: string) => Promise<void>;

  // App Navigation & Theme
  activeTab: VyaparTab;
  setActiveTab: (tab: VyaparTab) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isOnline: boolean;

  // Active Modals & Quick Actions
  isNewBillModalOpen: boolean;
  setIsNewBillModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  isRecordPurchaseModalOpen: boolean;
  setIsRecordPurchaseModalOpen: (open: boolean) => void;
  isAddCustomerModalOpen: boolean;
  setIsAddCustomerModalOpen: (open: boolean) => void;
  isRecordPaymentModalOpen: boolean;
  setIsRecordPaymentModalOpen: (open: boolean) => void;
  
  // Receipt Viewer Modal
  receiptInvoice: Invoice | null;
  openReceipt: (inv: Invoice) => void;
  closeReceipt: () => void;

  // Global State Refresh Trigger
  refreshTrigger: number;
  triggerRefresh: () => void;

  // Toasts
  toasts: ToastInfo[];
  showToast: (title: string, description: string, type?: ToastInfo['type']) => void;
  dismissToast: (id: string) => void;

  // Formatters
  formatCurrency: (amount: number) => string;
}

const VyaparContext = createContext<VyaparContextType | undefined>(undefined);

export function VyaparProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isFirstRun, setIsFirstRun] = useState(false);
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(DEFAULT_STORE_CONFIG);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<VyaparTab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isOnline, setIsOnline] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Quick modals
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isRecordPurchaseModalOpen, setIsRecordPurchaseModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback(
    (title: string, description: string, type: ToastInfo['type'] = 'success') => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((c) => c + 1);
  }, []);

  // Format currency in Indian numbering system
  const formatCurrency = useCallback(
    (amount: number) => {
      const symbol = storeProfile?.currency || '₹';
      if (typeof amount !== 'number' || isNaN(amount)) return `${symbol}0.00`;
      return `${symbol}${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [storeProfile?.currency]
  );

  // Online / Offline listener
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => {
        setIsOnline(true);
        showToast('Online', 'Network connection detected. Local-first storage remains primary.', 'info');
      };
      const handleOffline = () => {
        setIsOnline(false);
        showToast('Offline Mode Active', 'Operating completely offline. All sales, stock & ledgers save locally.', 'warning');
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [showToast]);

  // Initial Database Load
  useEffect(() => {
    async function init() {
      try {
        const { isFirstRun: firstRun, profile } = await initializeDatabase();
        if (firstRun || !profile) {
          setIsFirstRun(true);
          setStoreProfile(DEFAULT_STORE_CONFIG);
        } else {
          setStoreProfile(profile);
          setIsFirstRun(false);
          if (profile.pinRequired && profile.appPin) {
            setIsLocked(true);
          }
        }
      } catch (err) {
        console.error('Failed to init Vyapar database:', err);
      } finally {
        setIsInitialized(true);
      }
    }

    init();
  }, []);

  // Auto-lock on inactivity
  useEffect(() => {
    if (!storeProfile?.pinRequired || !storeProfile?.autoLockMinutes || storeProfile.autoLockMinutes <= 0) {
      return;
    }

    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (!isLocked) {
          setIsLocked(true);
          showToast('App Locked', 'Screen locked due to inactivity.', 'info');
        }
      }, storeProfile.autoLockMinutes * 60 * 1000);
    };

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [storeProfile?.pinRequired, storeProfile?.autoLockMinutes, isLocked, showToast]);

  // Lock / Unlock functions
  const unlockApp = useCallback(
    (pin: string) => {
      if (!storeProfile.appPin || pin === storeProfile.appPin) {
        setIsLocked(false);
        showToast('Welcome Back', `Unlocked ${storeProfile.storeName}`, 'success');
        return true;
      }
      return false;
    },
    [storeProfile.appPin, storeProfile.storeName, showToast]
  );

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  const togglePinRequired = useCallback(
    async (required: boolean, newPin?: string) => {
      const updated = {
        ...storeProfile,
        pinRequired: required,
        appPin: newPin || storeProfile.appPin || '1234',
      };
      await saveStoreProfile(updated);
      setStoreProfile(updated);
      showToast(
        'Security Updated',
        required ? 'App PIN lock enabled.' : 'App PIN lock disabled.',
        'success'
      );
    },
    [storeProfile, showToast]
  );

  const updateStoreProfile = useCallback(
    async (partial: Partial<StoreProfile>) => {
      const updated = {
        ...storeProfile,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      await saveStoreProfile(updated);
      setStoreProfile(updated);
      triggerRefresh();
      showToast('Settings Saved', 'Store configuration updated successfully.', 'success');
    },
    [storeProfile, triggerRefresh, showToast]
  );

  const resetToDemoData = useCallback(async () => {
    await seedDemoData();
    const profile = await db.storeProfile.get('primary_store');
    if (profile) setStoreProfile(profile);
    setIsFirstRun(false);
    triggerRefresh();
    showToast('Demo Data Loaded', 'Sample Indian retail store items, customers & ledgers populated.', 'success');
  }, [triggerRefresh, showToast]);

  const clearAllData = useCallback(async () => {
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
        db.auditLogs,
      ],
      async () => {
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
        await db.auditLogs.clear();
      }
    );
    setIsFirstRun(true);
    triggerRefresh();
    showToast('Database Reset', 'All records cleared. Store is ready for fresh setup.', 'warning');
  }, [triggerRefresh, showToast]);

  const openReceipt = useCallback((inv: Invoice) => {
    setReceiptInvoice(inv);
  }, []);

  const closeReceipt = useCallback(() => {
    setReceiptInvoice(null);
  }, []);

  return (
    <VyaparContext.Provider
      value={{
        isInitialized,
        isFirstRun,
        setIsFirstRun,
        storeProfile,
        updateStoreProfile,
        resetToDemoData,
        clearAllData,
        isLocked,
        unlockApp,
        lockApp,
        togglePinRequired,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        isOnline,
        isNewBillModalOpen,
        setIsNewBillModalOpen,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        isRecordPurchaseModalOpen,
        setIsRecordPurchaseModalOpen,
        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,
        isRecordPaymentModalOpen,
        setIsRecordPaymentModalOpen,
        receiptInvoice,
        openReceipt,
        closeReceipt,
        refreshTrigger,
        triggerRefresh,
        toasts,
        showToast,
        dismissToast,
        formatCurrency,
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>{children}</div>
    </VyaparContext.Provider>
  );
}

export function useVyapar() {
  const context = useContext(VyaparContext);
  if (!context) {
    throw new Error('useVyapar must be used within a VyaparProvider');
  }
  return context;
}
