import type { Metadata, Viewport } from 'next';
import './globals.css';
import { VyaparProvider } from '@/context/VyaparContext';
import { BizLinkProvider } from '@/context/BizLinkContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { PwaRegister } from '@/components/pwa/PwaRegister';

export const metadata: Metadata = {
  title: 'VyaparGlass | Premium Offline-First Business Management Software',
  description: 'Complete offline-first retail business management OS for small and medium shops in India. Inventory tracking, automated POS billing, digital Bahi Khata, and gross profit analytics.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VyaparGlass',
  },
  applicationName: 'VyaparGlass',
  keywords: ['VyaparGlass', 'Retail POS', 'Bahi Khata', 'Offline-First', 'Inventory Management', 'Billing Software', 'Indian Retail'],
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <VyaparProvider>
          <BizLinkProvider>
            {children}
            <ToastContainer />
            <PwaRegister />
          </BizLinkProvider>
        </VyaparProvider>
      </body>
    </html>
  );
}
