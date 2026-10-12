# VyaparGlass — Premium Offline-First Business Management Software 💎🇮🇳

> **Production-minded, offline-first business management OS for small and medium retail shops in India.**  
> Built with Next.js, React 19, TypeScript, Tailwind CSS, and Dexie.js (IndexedDB). Designed with an Apple-inspired liquid-glass aesthetic.

---

## 🌟 1. Product Vision & Architecture

VyaparGlass enables a retail shopkeeper to run their entire shop from a single device (laptop, tablet, or mobile phone) with **complete offline capability, absolute privacy, and persistent local storage**.

### Core Pillars
- **Offline-First Storage:** All inventory, customer khata records, sales invoices, stock movements, and purchase orders are permanently stored on the device using browser IndexedDB via Dexie.js. No cloud connection is required for core operations.
- **Data Integrity & Traceability:** Uses atomic database transactions (`db.transaction('rw', ...)`). Completed invoices deduction, stock movement logging, and Bahi Khata signed balance updates happen atomically.
- **Accurate Gross Profit & COGS:** Financial profit is computed using snapshot Cost of Goods Sold (COGS) recorded at the exact moment of each sale, preventing distortions when procurement costs change later.
- **Signed Digital Bahi Khata:** Chronological ledger model with signed Udhaar (debit) and Jama (credit) tracking. Historical balances are strictly calculated from recorded ledger transactions.
- **Apple Liquid-Glass UI:** Modern translucent frosted-glass surfaces, dark/light theme switching, responsive layouts for mobile and desktop, and tactile feedback.

---

## 🚀 2. System Architecture & Modules

```
                           [ LOCAL BROWSER RUNTIME ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                │             Dexie.js / IndexedDB            │
                │         (13 Indexed Persistent Tables)      │
                └──────────────────────┬──────────────────────┘
                                       │
     ┌───────────────┬─────────────────┼─────────────────┬───────────────┐
     ▼               ▼                 ▼                 ▼               ▼
[ POS Billing ] [ Inventory ]  [ Digital Khata ]   [ Purchases ]   [ Analytics ]
- Barcode Scan  - Stock Ledger - Udhaar & Jama     - Inward Goods  - COGS Profit
- Predefined SP - Thresholds   - Signed Ledger     - Vendor Dues   - Stock Valuation
- Thermal/A4    - Adjustments  - WhatsApp Remind   - Audit Trail   - 7-Day Trend
```

### Modules Summary:
1. **Onboarding & Store Setup:** First-run wizard for Store Name, Owner Name, Contact, GSTIN, Default Tax %, UPI ID, and 4-Digit Security PIN. Includes a one-click "Load Sample Retail Store Data" button.
2. **Device App Lock Screen:** Protected access screen requiring the owner's 4-digit PIN. Automatic locking after inactivity (configurable: 5, 15, 30 min).
3. **POS Billing Counter:** Live search by name, SKU, or barcode; line-item discounts; GST tax calculation; customer credit integration; instant receipt generator with UPI payment QR code; thermal 80mm and A4 print options; WhatsApp / SMS sharing.
4. **Inventory Management:** Full catalog management with SKU codes, barcodes, units of measure (Pcs, Packet, Box, Kg, etc.), purchase costs, selling prices, MRP, and low-stock alerts.
5. **Stock Movement Ledger:** Complete audit trail recording every quantity change with type (`OPENING`, `PURCHASE`, `SALE`, `RETURN_IN`, `ADJUSTMENT`, `CANCELLATION_REVERSAL`), reference ID, and snapshot unit cost.
6. **Purchases & Supplier Management:** Inward goods reception, automatic stock increments, purchase orders, and supplier payables tracking.
7. **Digital Bahi Khata (Customer Ledger):** Customer profiles with outstanding receivables (Udhaar), signed ledger history, "Record Jama" payment recording, statement printing, and WhatsApp payment reminders.
8. **Sales History & Returns:** Transaction log with receipt reprint, product return processing with automatic stock replenishment, and invoice cancellation with full reversal.
9. **Financial Reports:** Sales turnover, Cost of Goods Sold (COGS), estimated gross profit, GST collected, and CSV export.
10. **Offers & Customer Sharing:** Promotional deal builder, WhatsApp broadcast formatting, and customer consent tracking.
11. **Settings, Security & Backup:** Full configuration, negative inventory toggle, persistent storage request (`navigator.storage.persist()`), and encrypted/checksummed JSON backup export and restore with schema validation.
12. **Acceptance Test Suite:** Built-in interactive automated test suite verifying Scenarios A through J against the live database.

---

## 🛠️ 3. Quickstart & Development Commands

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd yatra-guard-GDGoC

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development dev server
npm run dev

# Open in browser:
# http://localhost:3000
```

### Production Build & Launch
```bash
# Build the production bundle
npm run build

# Start the production server
npm run start
```

---

## 🧪 4. Testing & Acceptance Criteria Verification

The application includes an in-app **Acceptance Verification Suite** (accessible via the **Acceptance Tests** tab in the sidebar). It programmatically validates:

- **TEST A — Inventory Arithmetic:** Product created with 100 units. Purchase of 20 units recorded. Sale of 5 units completed. Stock verified to be exactly **115**.
- **TEST B — Price Consistency:** Bill created using product's configured selling price of ₹300. Product price changed to ₹450 later. Historical invoice verified to retain its original price of **₹300**.
- **TEST C — Customer Credit:** Customer created with ₹500 opening due. Credit purchase of ₹300 recorded. Payment of ₹200 received. Balance verified to be exactly **₹600**.
- **TEST D — Duplicate Protection:** Atomic transaction locks ensure that invoices are not duplicated and inventory deductions happen exactly once.
- **TEST E — Returns & Restocking:** Processing a return of 2 units restores product inventory, marks the invoice status as `Partially Refunded`, and adjusts the customer ledger.
- **TEST F — Local Persistence:** Validates that Dexie IndexedDB schemas persist across browser refreshes.
- **TEST G — Offline Mode:** Validates that billing, inventory updates, and ledger mutations execute with 0 network latency and without internet access.
- **TEST H — Backup & Restore:** Validates JSON export, schema verification, and atomic restoration.
- **TEST I — Messaging:** Verifies that WhatsApp and device SMS links are prepared correctly without fabricating false cloud delivery confirmations.
- **TEST J — Responsive Layout:** Validates desktop sidebar, tablet viewport, and mobile touch interface.

---

## 💾 5. Backup, Storage & Offline Limitations

1. **Local-First Nature:** Business data is stored in the browser's IndexedDB on that specific device. It is not shared across devices unless a backup file is exported and imported.
2. **Browser Storage Eviction Protection:** Use the **Request Persistent Storage** button in **Settings & Backup** to invoke `navigator.storage.persist()`, protecting your local data from browser heuristic eviction on low disk space.
3. **Regular Backups:** Use the **Export Local Backup** button in Settings to save your `.json` backup file regularly to an external drive or cloud drive.
4. **Third-Party Messaging Gateways:** Direct automated background SMS delivery requires server-side API keys (e.g., Fast2SMS or MSG91). By default, VyaparGlass uses standard, privacy-preserving client-side WhatsApp and SMS intent URLs.

---

## 📄 License
MIT License. Built for retailers and small businesses across India.
