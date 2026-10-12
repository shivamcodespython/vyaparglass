'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  BusinessRole,
  SupplyRelationship,
  LedgerTransaction,
  SearchResultResponse,
  SerpApiSearchParams,
  UserAccount,
  AccountType,
} from '@/types';
import { CURRENT_USER_BUSINESS, MOCK_BUSINESSES } from '@/data/mockBusinesses';
import { INITIAL_RELATIONSHIPS } from '@/data/mockRelationships';
import { INITIAL_TRANSACTIONS } from '@/data/mockLedger';

export type ActiveAppMode = 'landing' | 'business_owner' | 'customer';

export type DashboardView =
  | 'overview'
  | 'find_suppliers'
  | 'find_customers'
  | 'products'
  | 'network'
  | 'transactions'
  | 'reviews'
  | 'profile'
  | 'settings';

interface BizLinkContextType {
  // App & User Accounts
  appMode: ActiveAppMode;
  setAppMode: (mode: ActiveAppMode) => void;
  currentUser: UserAccount;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserAccount>>;
  switchAccountType: (type: AccountType) => void;
  dashboardView: DashboardView;
  setDashboardView: (view: DashboardView) => void;

  // Business Data
  myBusiness: Business;
  updateMyBusiness: (updated: Partial<Business>) => void;
  businesses: Business[];
  relationships: SupplyRelationship[];
  transactions: LedgerTransaction[];
  savedBusinesses: string[];
  toggleSaveBusiness: (businessId: string) => void;
  
  // Modals & Drawers
  inspectingBusiness: Business | null;
  setInspectingBusiness: (business: Business | null) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  isAddTransactionModalOpen: boolean;
  setIsAddTransactionModalOpen: (open: boolean) => void;
  isAddProductModalOpen: boolean;
  setIsAddProductModalOpen: (open: boolean) => void;
  prefilledTxBusiness: Business | null;
  setPrefilledTxBusiness: (business: Business | null) => void;

  // Actions
  addSupplierToNetwork: (supplier: Business, initialVolume?: string) => void;
  addCustomerToNetwork: (customer: Business, initialVolume?: string) => void;
  addTransaction: (tx: Omit<LedgerTransaction, 'id'>) => void;
  settleTransaction: (txId: string) => void;
  registerNewBusiness: (formData: any) => Business;
  registerNewAccount: (accountData: Partial<UserAccount>) => UserAccount;

  // Search Engine State
  isSearching: boolean;
  searchResults: SearchResultResponse | null;
  searchParams: SerpApiSearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SerpApiSearchParams>>;
  performBusinessSearch: (customParams?: Partial<SerpApiSearchParams>) => Promise<SearchResultResponse | null>;
  useMockMode: boolean;
  setUseMockMode: (val: boolean) => void;
  detectUserLocation: () => Promise<{ lat: number; lng: number; label: string } | null>;
  isDetectingLocation: boolean;

  // Notifications / Toast
  toastMessage: { title: string; desc: string; type?: 'success' | 'info' | 'warning' } | null;
  showToast: (title: string, desc: string, type?: 'success' | 'info' | 'warning') => void;
}

const DEFAULT_USER: UserAccount = {
  id: 'usr_rajesh_sharma',
  name: 'Rajesh Sharma',
  email: 'rajesh.sharma@bizlink.in',
  phone: '+91 98960 44321',
  accountType: 'businessman',
  city: 'Ambala',
  businessName: 'Sharma Electronics & Hardware',
  businessRole: 'Retailer',
  category: 'Electronics & Hardware',
};

const BizLinkContext = createContext<BizLinkContextType | undefined>(undefined);

export function BizLinkProvider({ children }: { children: React.ReactNode }) {
  const [appMode, setAppMode] = useState<ActiveAppMode>('landing');
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview');
  const [currentUser, setCurrentUser] = useState<UserAccount>(DEFAULT_USER);
  
  const [myBusiness, setMyBusiness] = useState<Business>(CURRENT_USER_BUSINESS);
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [relationships, setRelationships] = useState<SupplyRelationship[]>(INITIAL_RELATIONSHIPS);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>(INITIAL_TRANSACTIONS);
  const [savedBusinesses, setSavedBusinesses] = useState<string[]>(['biz_ambala_led_hub']);
  
  const [inspectingBusiness, setInspectingBusiness] = useState<Business | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [prefilledTxBusiness, setPrefilledTxBusiness] = useState<Business | null>(null);

  // Search state
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultResponse | null>(null);
  const [useMockMode, setUseMockMode] = useState(false);
  const [searchParams, setSearchParams] = useState<SerpApiSearchParams>({
    query: 'Bakery & Sweets',
    location: 'Ambala',
    radiusKm: 20,
    businessType: 'All',
    category: 'All',
  });

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type?: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ title, desc, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const switchAccountType = (type: AccountType) => {
    setCurrentUser(prev => ({ ...prev, accountType: type }));
    if (type === 'individual') {
      setAppMode('customer');
      showToast('Switched to Customer Mode', 'You are now browsing as an Individual / Consumer.');
    } else {
      setAppMode('business_owner');
      showToast('Switched to Merchant Mode', 'You are now managing your Business Portal & Khata.');
    }
  };

  const updateMyBusiness = (updated: Partial<Business>) => {
    setMyBusiness(prev => {
      const next = { ...prev, ...updated };
      setBusinesses(bList => bList.map(b => b.id === prev.id ? next : b));
      return next;
    });
    showToast('Profile Updated', 'Your business profile has been updated successfully.');
  };

  const toggleSaveBusiness = (businessId: string) => {
    setSavedBusinesses(prev => {
      const isSaved = prev.includes(businessId);
      if (isSaved) {
        showToast('Removed from Saved', 'Business removed from your favourites list.', 'info');
        return prev.filter(id => id !== businessId);
      } else {
        showToast('Saved to Favourites', 'Business saved to your favourites list.', 'success');
        return [...prev, businessId];
      }
    });
  };

  // Add Supplier to Network
  const addSupplierToNetwork = (supplier: Business, initialVolume = '₹40,000 / month') => {
    setBusinesses(prev => {
      const exists = prev.find(b => b.id === supplier.id);
      if (!exists) return [...prev, supplier];
      return prev;
    });

    const alreadyConnected = relationships.some(
      r => r.sourceId === supplier.id && r.targetId === myBusiness.id
    );

    if (alreadyConnected) {
      showToast('Already Connected', `${supplier.name} is already in your supply network!`, 'info');
      return;
    }

    const newRel: SupplyRelationship = {
      id: `rel_${Date.now()}`,
      sourceId: supplier.id,
      targetId: myBusiness.id,
      sourceName: supplier.name,
      targetName: myBusiness.name,
      sourceRole: supplier.primaryRole,
      targetRole: myBusiness.primaryRole,
      category: supplier.categories[0] || 'Commercial Trade',
      volumeMonthly: initialVolume,
      activeSince: 'Just now',
      status: 'active',
      creditTermDays: 14,
    };

    setRelationships(prev => [newRel, ...prev]);
    setMyBusiness(prev => ({
      ...prev,
      totalSuppliersCount: prev.totalSuppliersCount + 1,
    }));

    showToast(
      'Supplier Connected!',
      `Connected ${supplier.name} to your business. Supply-chain network updated!`,
      'success'
    );
  };

  // Add Customer to Network
  const addCustomerToNetwork = (customer: Business, initialVolume = '₹25,000 / month') => {
    setBusinesses(prev => {
      const exists = prev.find(b => b.id === customer.id);
      if (!exists) return [...prev, customer];
      return prev;
    });

    const alreadyConnected = relationships.some(
      r => r.sourceId === myBusiness.id && r.targetId === customer.id
    );

    if (alreadyConnected) {
      showToast('Already Connected', `${customer.name} is already registered as your buyer.`, 'info');
      return;
    }

    const newRel: SupplyRelationship = {
      id: `rel_${Date.now()}`,
      sourceId: myBusiness.id,
      targetId: customer.id,
      sourceName: myBusiness.name,
      targetName: customer.name,
      sourceRole: myBusiness.primaryRole,
      targetRole: customer.primaryRole,
      category: customer.categories[0] || 'Retail Supply',
      volumeMonthly: initialVolume,
      activeSince: 'Just now',
      status: 'active',
      creditTermDays: 7,
    };

    setRelationships(prev => [newRel, ...prev]);
    setMyBusiness(prev => ({
      ...prev,
      totalCustomersCount: prev.totalCustomersCount + 1,
    }));

    showToast('Customer Added!', `Added ${customer.name} to your client portfolio.`, 'success');
  };

  // Ledger / Khata actions (Credit / Debit)
  const addTransaction = (tx: Omit<LedgerTransaction, 'id'>) => {
    const newTx: LedgerTransaction = {
      ...tx,
      id: `tx_${Date.now()}`,
    };
    setTransactions(prev => [newTx, ...prev]);
    showToast(
      'Khata Entry Logged',
      `Recorded ${newTx.type === 'Debit' ? 'Udhaar (Given)' : 'Jama (Received)'} of ₹${newTx.amount.toLocaleString('en-IN')} with ${newTx.businessName || newTx.customerName}.`,
      'success'
    );
  };

  const settleTransaction = (txId: string) => {
    setTransactions(prev =>
      prev.map(t => (t.id === txId ? { ...t, status: 'Settled' } : t))
    );
    showToast('Khata Settled', 'Transaction marked as Settled (Payment completed).', 'success');
  };

  // Register new business
  const registerNewBusiness = (formData: any): Business => {
    const city = formData.city || 'Ambala';
    const cityPrefix = city.substring(0, 3).toUpperCase();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const newCode = `BL-${cityPrefix}-${randomDigits}`;

    const newBiz: Business = {
      id: `biz_reg_${Date.now()}`,
      businessCode: newCode,
      name: formData.name || 'New Enterprise',
      ownerName: formData.ownerName || currentUser.name || 'Business Owner',
      roles: formData.roles?.length ? formData.roles : ['Retailer'],
      primaryRole: formData.roles?.[0] || 'Retailer',
      categories: formData.categories?.length ? formData.categories : ['General Trade'],
      description: formData.description || 'Verified enterprise registered on BizLink Universal Network.',
      location: {
        address: formData.address || 'Commercial Market',
        area: formData.area || city,
        city: city,
        state: formData.state || 'Local Region',
        pincode: formData.pincode || '133001',
        lat: 30.36,
        lng: 76.84,
        distanceKm: 0,
      },
      rating: 5.0,
      reviewCount: 1,
      verified: true,
      phone: formData.phone || currentUser.phone || '+91 98000 00000',
      email: formData.email || currentUser.email || 'contact@business.com',
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.name + ' ' + city)}`,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=30.36,76.84`,
      openStatus: 'Open now · Closes 9:00 PM',
      gstNumber: formData.gstNumber || `06AACXX${randomDigits.toString().substring(0, 4)}A1Z5`,
      establishedYear: new Date().getFullYear(),
      minOrderValue: 500,
      priceLevel: '₹₹',
      suppliesTo: ['Retailer', 'Service Provider'],
      purchasesFrom: ['Wholesaler', 'Manufacturer', 'Distributor'],
      products: [],
      reviews: [],
      totalSuppliersCount: 0,
      totalCustomersCount: 0,
      trustScore: 92,
      fulfillmentRate: 98.0,
      source: 'verified_bizlink',
    };

    setBusinesses(prev => [newBiz, ...prev]);
    setMyBusiness(newBiz);
    setCurrentUser(prev => ({
      ...prev,
      accountType: 'businessman',
      businessName: newBiz.name,
      businessRole: newBiz.primaryRole,
      city: newBiz.location.city,
    }));

    showToast(
      'Business Registered!',
      `Business ID ${newCode} generated for ${newBiz.name}. Your online store & Khata are ready!`,
      'success'
    );
    return newBiz;
  };

  const registerNewAccount = (accountData: Partial<UserAccount>): UserAccount => {
    const newAcc: UserAccount = {
      id: `usr_${Date.now()}`,
      name: accountData.name || 'User Account',
      email: accountData.email || 'user@bizlink.in',
      phone: accountData.phone || '+91 98765 43210',
      accountType: accountData.accountType || 'individual',
      city: accountData.city || 'Ambala',
      businessName: accountData.businessName,
      businessRole: accountData.businessRole,
      category: accountData.category,
      gstNumber: accountData.gstNumber,
    };

    setCurrentUser(newAcc);
    if (newAcc.accountType === 'businessman') {
      registerNewBusiness({
        name: newAcc.businessName || `${newAcc.name}'s Enterprise`,
        ownerName: newAcc.name,
        city: newAcc.city,
        phone: newAcc.phone,
        email: newAcc.email,
        roles: [newAcc.businessRole || 'Retailer'],
        categories: [newAcc.category || 'General Trade'],
        gstNumber: newAcc.gstNumber,
      });
      setAppMode('business_owner');
    } else {
      setAppMode('customer');
    }

    showToast('Account Created!', `Welcome, ${newAcc.name}! You are now logged in as ${newAcc.accountType === 'businessman' ? 'Business Owner' : 'Individual Customer'}.`, 'success');
    return newAcc;
  };

  // Browser Geolocation Detection
  const detectUserLocation = async (): Promise<{ lat: number; lng: number; label: string } | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Location Error', 'Geolocation is not supported by your browser.', 'warning');
      return null;
    }

    setIsDetectingLocation(true);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingLocation(false);
          const lat = Number(position.coords.latitude.toFixed(4));
          const lng = Number(position.coords.longitude.toFixed(4));
          const locLabel = `GPS (${lat}, ${lng})`;
          setSearchParams(prev => ({
            ...prev,
            location: 'Current Location',
            userLat: lat,
            userLng: lng,
          }));
          showToast('GPS Location Detected', `Coordinates: ${lat}, ${lng}. Ready for radius search.`, 'success');
          resolve({ lat, lng, label: locLabel });
        },
        (error) => {
          setIsDetectingLocation(false);
          console.warn('Geolocation error:', error);
          showToast('GPS Notice', 'Could not retrieve precise GPS. Searching using city name.', 'info');
          resolve(null);
        },
        { timeout: 8000 }
      );
    });
  };

  // Business Search Execution via Backend API Route
  const performBusinessSearch = async (customParams?: Partial<SerpApiSearchParams>): Promise<SearchResultResponse | null> => {
    setIsSearching(true);
    const mergedParams: SerpApiSearchParams = {
      ...searchParams,
      ...customParams,
      forceMock: useMockMode || (customParams?.forceMock ?? false),
    };

    try {
      const res = await fetch('/api/search-businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mergedParams),
      });

      if (!res.ok) {
        throw new Error(`Search request failed: ${res.statusText}`);
      }

      const data = (await res.json()) as SearchResultResponse;
      setSearchResults(data);

      // Register any new businesses into the in-memory businesses directory
      if (data.results && data.results.length > 0) {
        setBusinesses(prev => {
          const map = new Map(prev.map(b => [b.id, b]));
          data.results.forEach(b => {
            if (!map.has(b.id)) {
              map.set(b.id, b);
            }
          });
          return Array.from(map.values());
        });
      }

      return data;
    } catch (error) {
      console.error('[Search Error]', error);
      showToast('Search Notice', 'Using local real-time synthesized business catalog.', 'info');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <BizLinkContext.Provider
      value={{
        appMode,
        setAppMode,
        currentUser,
        setCurrentUser,
        switchAccountType,
        dashboardView,
        setDashboardView,
        myBusiness,
        updateMyBusiness,
        businesses,
        relationships,
        transactions,
        savedBusinesses,
        toggleSaveBusiness,
        inspectingBusiness,
        setInspectingBusiness,
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        isAddTransactionModalOpen,
        setIsAddTransactionModalOpen,
        isAddProductModalOpen,
        setIsAddProductModalOpen,
        prefilledTxBusiness,
        setPrefilledTxBusiness,
        addSupplierToNetwork,
        addCustomerToNetwork,
        addTransaction,
        settleTransaction,
        registerNewBusiness,
        registerNewAccount,
        isSearching,
        searchResults,
        searchParams,
        setSearchParams,
        performBusinessSearch,
        useMockMode,
        setUseMockMode,
        detectUserLocation,
        isDetectingLocation,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </BizLinkContext.Provider>
  );
}

export function useBizLink() {
  const context = useContext(BizLinkContext);
  if (!context) {
    throw new Error('useBizLink must be used within a BizLinkProvider');
  }
  return context;
}
