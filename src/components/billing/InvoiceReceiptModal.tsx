'use client';

import React, { useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { Invoice } from '@/lib/db/schema';
import {
  Printer,
  Share2,
  X,
  CheckCircle2,
  MessageSquare,
  Smartphone,
  Copy,
  Receipt,
  QrCode,
  Download,
  AlertCircle,
} from 'lucide-react';

interface InvoiceReceiptModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceReceiptModal({ invoice, onClose }: InvoiceReceiptModalProps) {
  const { storeProfile, formatCurrency, showToast } = useVyapar();
  const [receiptFormat, setReceiptFormat] = useState<'thermal' | 'standard'>('thermal');
  const [copied, setCopied] = useState(false);

  if (!invoice) return null;

  const upiId = storeProfile?.upiId || 'merchant@upi';
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    storeProfile?.storeName || 'Merchant'
  )}&am=${invoice.grandTotal}&cu=INR&tn=${encodeURIComponent(`Bill ${invoice.invoiceNumber}`)}`;

  // Google Charts QR code API (works with or without internet if cached, fallback gracefully)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    upiPayUri
  )}`;

  // Prepared WhatsApp text
  const waBillMessage = `*${storeProfile?.storeName || 'VyaparGlass'}*\nBill No: ${
    invoice.invoiceNumber
  }\nDate: ${new Date(invoice.date).toLocaleDateString('en-IN')}\nCustomer: ${
    invoice.customerName
  }\n\n*Items:*\n${invoice.items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.productName} (${it.quantity} ${it.unit}) - ₹${it.total}`
    )
    .join('\n')}\n\n*Total Amount: ₹${invoice.grandTotal}*\nAmount Paid: ₹${
    invoice.amountPaid
  }\nBalance Due: ₹${invoice.remainingDue}\n\n${
    storeProfile?.receiptHeader || 'Thank you for shopping with us!'
  }`;

  const cleanPhone = (invoice.customerPhone || '').replace(/\D/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waBillMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waBillMessage)}`;

  const smsUrl = cleanPhone
    ? `sms:${cleanPhone}?body=${encodeURIComponent(waBillMessage)}`
    : `sms:?body=${encodeURIComponent(waBillMessage)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(waBillMessage);
    setCopied(true);
    showToast('Copied to Clipboard', 'Bill text copied for manual sharing.', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-elevation p-5 sm:p-6 my-auto text-slate-900 dark:text-white print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold">Tax Invoice #{invoice.invoiceNumber}</h4>
              <p className="text-[11px] text-slate-400">
                Status: <span className="text-emerald-500 font-semibold">{invoice.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format toggle */}
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setReceiptFormat('thermal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  receiptFormat === 'thermal'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Thermal (80mm)
              </button>
              <button
                onClick={() => setReceiptFormat('standard')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  receiptFormat === 'standard'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Standard (A4)
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Container */}
        <div
          id="printable-receipt"
          className={`mx-auto bg-white text-slate-900 border rounded-2xl p-5 shadow-sm transition-all font-sans ${
            receiptFormat === 'thermal'
              ? 'max-w-[360px] border-dashed border-slate-300 text-xs'
              : 'max-w-full border-slate-200 text-sm'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-3 border-b border-slate-200">
            <h2 className="text-base font-black tracking-tight uppercase text-slate-900">
              {storeProfile?.storeName || 'Vyapar Retail Mart'}
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              {storeProfile?.address}, {storeProfile?.city}
            </p>
            <p className="text-[11px] text-slate-600">
              Phone: {storeProfile?.phone} {storeProfile?.gstin ? `| GSTIN: ${storeProfile.gstin}` : ''}
            </p>
            {storeProfile?.receiptHeader && (
              <p className="text-[10px] text-slate-500 italic mt-1">
                "{storeProfile.receiptHeader}"
              </p>
            )}
          </div>

          {/* Meta Details */}
          <div className="py-2.5 border-b border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice No:</span>
              <span className="font-mono font-bold">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date & Time:</span>
              <span>{new Date(invoice.date).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{invoice.customerName}</span>
            </div>
            {invoice.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile:</span>
                <span>{invoice.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold uppercase text-indigo-700">{invoice.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-slate-200">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-1 font-semibold">Item</th>
                  <th className="pb-1 font-semibold text-center">Qty</th>
                  <th className="pb-1 font-semibold text-right">Rate</th>
                  <th className="pb-1 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="py-1">
                    <td className="py-1 pr-1 font-medium max-w-[150px] truncate">
                      {item.productName}
                    </td>
                    <td className="py-1 text-center">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-1 text-right">₹{item.unitPrice}</td>
                    <td className="py-1 text-right font-bold">₹{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary */}
          <div className="py-2.5 border-b border-slate-200 text-[11px] space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            {invoice.billDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Bill Discount:</span>
                <span>-₹{invoice.billDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            {invoice.taxTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>GST Tax:</span>
                <span>+₹{invoice.taxTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200 text-slate-900">
              <span>Total Payable:</span>
              <span>₹{invoice.grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-semibold">
              <span>Amount Paid:</span>
              <span>₹{invoice.amountPaid.toFixed(2)}</span>
            </div>
            {invoice.remainingDue > 0 && (
              <div className="flex justify-between text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                <span>Balance Due (Udhaar):</span>
                <span>₹{invoice.remainingDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* UPI QR Code for instant payment */}
          {storeProfile?.upiId && (
            <div className="py-3 text-center border-b border-slate-200">
              <div className="inline-block p-1 bg-white border border-slate-200 rounded-xl shadow-xs">
                {/* Fallback image */}
                <img
                  src={qrCodeUrl}
                  alt="UPI Payment QR"
                  className="w-24 h-24 mx-auto object-contain"
                  onError={(e) => {
                    // Hide if image fails offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-600 font-mono mt-1">
                Scan & Pay via UPI: <span className="font-bold">{storeProfile.upiId}</span>
              </p>
            </div>
          )}

          {/* Footer Policy */}
          <div className="pt-3 text-center text-[10px] text-slate-500">
            <p>{storeProfile?.receiptFooter || 'Goods once sold can be exchanged within 3 days.'}</p>
            <p className="mt-1 font-semibold text-slate-700">Powered by VyaparGlass Local POS</p>
          </div>
        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <a
            href={smsUrl}
            className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>SMS Message</span>
          </a>

          <button
            onClick={handleCopyText}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
