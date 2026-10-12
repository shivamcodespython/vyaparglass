'use client';

import React from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LockScreen } from '@/components/layout/LockScreen';
import { StoreSetupModal } from '@/components/onboarding/StoreSetupModal';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { PosBillingView } from '@/components/billing/PosBillingView';
import { InventoryView } from '@/components/inventory/InventoryView';
import { PurchasesView } from '@/components/purchases/PurchasesView';
import { CustomersView } from '@/components/customers/CustomersView';
import { SuppliersView } from '@/components/suppliers/SuppliersView';
import { TransactionsView } from '@/components/transactions/TransactionsView';
import { ReportsView } from '@/components/reports/ReportsView';
import { OffersView } from '@/components/offers/OffersView';
import { SettingsView } from '@/components/settings/SettingsView';
import { TestSuiteView } from '@/components/testing/TestSuiteView';
import { InvoiceReceiptModal } from '@/components/billing/InvoiceReceiptModal';
import { AddProductModal } from '@/components/inventory/AddProductModal';
import { RecordPurchaseModal } from '@/components/purchases/RecordPurchaseModal';
import { AddCustomerModal } from '@/components/customers/AddCustomerModal';
import { RecordPaymentModal } from '@/components/customers/RecordPaymentModal';
import { VyaparToasts } from '@/components/ui/VyaparToasts';

export function VyaparApp() {
  const { activeTab, receiptInvoice, closeReceipt, isInitialized } = useVyapar();

  if (!isInitialized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white select-none">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 animate-spin flex items-center justify-center font-bold text-lg mb-4">
          VG
        </div>
        <p className="text-sm font-semibold tracking-tight">Initializing VyaparGlass Local Engine...</p>
        <p className="text-xs text-slate-400 mt-1">Connecting to Dexie IndexedDB</p>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <OverviewTab />;
      case 'pos':
        return <PosBillingView />;
      case 'inventory':
        return <InventoryView />;
      case 'purchases':
        return <PurchasesView />;
      case 'customers':
        return <CustomersView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'transactions':
        return <TransactionsView />;
      case 'reports':
        return <ReportsView />;
      case 'offers':
        return <OffersView />;
      case 'settings':
        return <SettingsView />;
      case 'test_suite':
        return <TestSuiteView />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Security Lock Screen Overlay */}
      <LockScreen />

      {/* First-Run Store Setup Modal */}
      <StoreSetupModal />

      {/* Receipt Modal */}
      <InvoiceReceiptModal invoice={receiptInvoice} onClose={closeReceipt} />

      {/* Quick Action Modals */}
      <AddProductModal />
      <RecordPurchaseModal />
      <AddCustomerModal />
      <RecordPaymentModal />

      {/* Global Notifications */}
      <VyaparToasts />

      <div className="flex flex-1 min-h-screen">
        {/* Apple Frosted Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto overflow-y-auto">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </div>
  );
}
