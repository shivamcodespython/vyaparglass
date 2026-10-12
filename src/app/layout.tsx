import type { Metadata } from 'next';
import './globals.css';
import { VyaparProvider } from '@/context/VyaparContext';
import { BizLinkProvider } from '@/context/BizLinkContext';
import { ToastContainer } from '@/components/ui/ToastContainer';

export const metadata: Metadata = {
  title: 'VyaparGlass | Premium Offline-First Business Management Software',
  description: 'Complete offline-first retail business management OS for small and medium shops in India. Inventory tracking, automated POS billing, digital Bahi Khata, and gross profit analytics.',
  keywords: ['VyaparGlass', 'Retail POS', 'Bahi Khata', 'Offline-First', 'Inventory Management', 'Billing Software', 'Indian Retail'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans antialiased bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-500 selection:text-white">
        <VyaparProvider>
          <BizLinkProvider>
            {children}
            <ToastContainer />
          </BizLinkProvider>
        </VyaparProvider>
      </body>
    </html>
  );
}
