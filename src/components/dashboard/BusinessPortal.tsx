'use client';

import React from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { OverviewView } from './views/OverviewView';
import { FindSuppliersView } from './views/FindSuppliersView';
import { FindCustomersView } from './views/FindCustomersView';
import { SupplyChainGraph } from '../network/SupplyChainGraph';
import { ProductsView } from './views/ProductsView';
import { LedgerView } from './views/LedgerView';
import { ReviewsView } from './views/ReviewsView';
import { BusinessProfileView } from './views/BusinessProfileView';
import { SettingsView } from './views/SettingsView';
import { BusinessProfileModal } from '../modals/BusinessProfileModal';
import { RegisterBusinessModal } from '../modals/RegisterBusinessModal';
import { AddTransactionModal } from '../modals/AddTransactionModal';

export function BusinessPortal() {
  const { dashboardView } = useBizLink();

  const renderActiveView = () => {
    switch (dashboardView) {
      case 'overview':
        return <OverviewView />;
      case 'find_suppliers':
        return <FindSuppliersView />;
      case 'find_customers':
        return <FindCustomersView />;
      case 'network':
        return <SupplyChainGraph />;
      case 'products':
        return <ProductsView />;
      case 'transactions':
        return <LedgerView />;
      case 'reviews':
        return <ReviewsView />;
      case 'profile':
        return <BusinessProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />

        <main className="p-6 md:p-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <BusinessProfileModal />
      <RegisterBusinessModal />
      <AddTransactionModal />
    </div>
  );
}
