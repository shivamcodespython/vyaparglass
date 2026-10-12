'use client';

import React, { useState, useEffect } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import {
  exportDatabaseBackup,
  downloadBackupFile,
  validateBackupFile,
  restoreDatabaseFromBackup,
  requestPersistentStorage,
} from '@/lib/db/backup';
import {
  Settings,
  Shield,
  Download,
  Upload,
  Database,
  Lock,
  Save,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function SettingsView() {
  const {
    storeProfile,
    updateStoreProfile,
    togglePinRequired,
    resetToDemoData,
    clearAllData,
    showToast,
    triggerRefresh,
  } = useVyapar();

  const [form, setForm] = useState({
    storeName: storeProfile.storeName || '',
    appName: storeProfile.appName || 'VyaparGlass',
    ownerName: storeProfile.ownerName || '',
    phone: storeProfile.phone || '',
    email: storeProfile.email || '',
    address: storeProfile.address || '',
    city: storeProfile.city || '',
    gstin: storeProfile.gstin || '',
    category: storeProfile.category || 'Retail Store',
    defaultTaxRate: storeProfile.defaultTaxRate || 5,
    upiId: storeProfile.upiId || '',
    receiptHeader: storeProfile.receiptHeader || '',
    receiptFooter: storeProfile.receiptFooter || '',
    allowNegativeStock: storeProfile.allowNegativeStock || false,
    autoLockMinutes: storeProfile.autoLockMinutes || 15,
  });

  const [pinRequired, setPinRequired] = useState(storeProfile.pinRequired || false);
  const [newPin, setNewPin] = useState(storeProfile.appPin || '1234');

  // Backup & Restore states
  const [isExporting, setIsExporting] = useState(false);
  const [pendingRestoreData, setPendingRestoreData] = useState<any | null>(null);
  const [restoreMetadata, setRestoreMetadata] = useState<any | null>(null);
  const [storageStatus, setStorageStatus] = useState<string>('');

  useEffect(() => {
    setForm({
      storeName: storeProfile.storeName || '',
      appName: storeProfile.appName || 'VyaparGlass',
      ownerName: storeProfile.ownerName || '',
      phone: storeProfile.phone || '',
      email: storeProfile.email || '',
      address: storeProfile.address || '',
      city: storeProfile.city || '',
      gstin: storeProfile.gstin || '',
      category: storeProfile.category || 'Retail Store',
      defaultTaxRate: storeProfile.defaultTaxRate || 5,
      upiId: storeProfile.upiId || '',
      receiptHeader: storeProfile.receiptHeader || '',
      receiptFooter: storeProfile.receiptFooter || '',
      allowNegativeStock: storeProfile.allowNegativeStock || false,
      autoLockMinutes: storeProfile.autoLockMinutes || 15,
    });
    setPinRequired(storeProfile.pinRequired || false);
    setNewPin(storeProfile.appPin || '1234');
  }, [storeProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStoreProfile({
        ...form,
        appPin: newPin,
        pinRequired,
      });
    } catch (err: any) {
      showToast('Error', err?.message || 'Failed to update store settings.', 'error');
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const backup = await exportDatabaseBackup();
      downloadBackupFile(backup);
      showToast('Backup Exported', 'Full local database exported as protected JSON file.', 'success');
    } catch (err: any) {
      showToast('Export Error', err?.message || 'Failed to export backup.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const validation = validateBackupFile(parsed);
        if (!validation.isValid) {
          showToast('Invalid Backup File', validation.error || 'Failed schema validation.', 'error');
          return;
        }
        setPendingRestoreData(parsed);
        setRestoreMetadata(validation.metadata);
      } catch (err) {
        showToast('JSON Error', 'File is not valid JSON.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!pendingRestoreData) return;
    try {
      await restoreDatabaseFromBackup(pendingRestoreData);
      setPendingRestoreData(null);
      setRestoreMetadata(null);
      triggerRefresh();
      showToast('Database Restored', 'All records replaced from backup file.', 'success');
    } catch (err: any) {
      showToast('Restore Error', err?.message || 'Failed to restore database.', 'error');
    }
  };

  const handleCheckStorage = async () => {
    const result = await requestPersistentStorage();
    setStorageStatus(result.message);
    showToast(
      result.isPersisted ? 'Storage Protected' : 'Storage Heuristic',
      result.message,
      result.isPersisted ? 'success' : 'info'
    );
  };

  return (
    <div className="space-y-6 animate-fade-in select-none max-w-4xl">
      {/* Settings Form */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Store Configuration & Settings
              </h3>
              <p className="text-xs text-slate-400">
                Customise branding, bill header notes, UPI payment ID, and business rules
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {/* Row 1: Store Name, App Name, Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                App Display Name (Configurable)
              </label>
              <input
                type="text"
                value={form.appName}
                onChange={(e) => setForm({ ...form, appName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Owner's Name *
              </label>
              <input
                type="text"
                required
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          {/* Row 2: Phone, Address, GSTIN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Contact Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Shop Address & City
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                placeholder="15-digit GSTIN"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
              />
            </div>
          </div>

          {/* Row 3: UPI ID, Tax Rate, Negative Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Shop UPI ID for QR Bill Payments
              </label>
              <input
                type="text"
                value={form.upiId}
                onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                placeholder="merchant@upi"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Default Tax Rate (%)
              </label>
              <select
                value={form.defaultTaxRate}
                onChange={(e) => setForm({ ...form, defaultTaxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-semibold"
              >
                <option value={0}>0% (Non-GST)</option>
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
                <option value={28}>28%</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={form.allowNegativeStock}
                  onChange={(e) => setForm({ ...form, allowNegativeStock: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Allow Negative Inventory Sale
                </span>
              </label>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Permits billing even if physical inventory count is 0
              </p>
            </div>
          </div>

          {/* Security & PIN Lock */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-500" />
              <h4 className="font-bold text-slate-900 dark:text-white">
                Application Security & Screen Lock
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={pinRequired}
                  onChange={(e) => setPinRequired(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="pinToggle" className="font-semibold cursor-pointer">
                  Require 4-Digit Owner PIN to Access
                </label>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Set 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border text-center font-bold tracking-widest font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Auto-Lock Timeout
                </label>
                <select
                  value={form.autoLockMinutes}
                  onChange={(e) => setForm({ ...form, autoLockMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border font-semibold"
                >
                  <option value={0}>Never</option>
                  <option value={5}>After 5 Minutes Inactivity</option>
                  <option value={15}>After 15 Minutes Inactivity</option>
                  <option value={30}>After 30 Minutes Inactivity</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save All Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup, Restore & Persistent Storage */}
      <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl shadow-glass space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Database className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Persistence, Backup & Restore
            </h3>
            <p className="text-xs text-slate-400">
              Export and safeguard your offline business data
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-bold">Offline Storage Guidance:</span> Local records are stored securely in your browser's IndexedDB database. Because browser caches can be cleared by disk cleaners or application uninstalls, regular exports are advised.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border text-left flex flex-col justify-between transition-colors"
          >
            <div>
              <Download className="w-5 h-5 text-indigo-500 mb-2" />
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Export Local Backup</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Download structured JSON backup of all products, bills & customer ledgers.
              </p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-3">
              {isExporting ? 'Generating...' : 'Download Backup File →'}
            </span>
          </button>

          <label className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border text-left flex flex-col justify-between transition-colors cursor-pointer">
            <div>
              <Upload className="w-5 h-5 text-sky-500 mb-2" />
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">Restore from Backup</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Import and validate a previous VyaparGlass JSON export file.
              </p>
            </div>
            <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 mt-3">
              Select JSON File →
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleCheckStorage}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 border text-left flex flex-col justify-between transition-colors"
          >
            <div>
              <Shield className="w-5 h-5 text-emerald-500 mb-2" />
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Request Persistent Storage
              </h5>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Locks browser storage to prevent automated eviction on low disk space.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-3">
              Request Browser Lock →
            </span>
          </button>
        </div>

        {/* Restore Confirmation Dialog */}
        {pendingRestoreData && restoreMetadata && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs space-y-3">
            <div>
              <h5 className="font-bold text-indigo-900 dark:text-indigo-200">
                Backup File Validated: {restoreMetadata.storeName}
              </h5>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                Exported on: {new Date(restoreMetadata.exportedAt).toLocaleString('en-IN')} • Contains{' '}
                {restoreMetadata.recordCounts.products} Products, {restoreMetadata.recordCounts.invoices}{' '}
                Invoices, {restoreMetadata.recordCounts.customers} Customers.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setPendingRestoreData(null);
                  setRestoreMetadata(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 font-semibold text-xs border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Confirm & Restore Database
              </button>
            </div>
          </div>
        )}

        {/* Danger Zone: Reset Data */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
              Database Maintenance
            </span>
            <p className="text-[10px] text-slate-400">
              Populate demo store items or reset to an empty canvas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetToDemoData}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/20"
            >
              Reload Demo Retail Data
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data? This action cannot be undone unless you have a backup.')) {
                  clearAllData();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/20"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
