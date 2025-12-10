import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { TranslationProvider } from '@/components/translation-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { GlobalErrorHandler } from '@/components/global-error-handler';
import { PWAInstaller } from '@/components/pwa-installer';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SE Repairs - Professional Fleet Management & Repair Solutions',
  description: 'Advanced fleet management system for truck and trailer repairs. Streamline operations, track maintenance, and optimize fleet performance with our comprehensive repair management platform.',
  keywords: 'fleet management, truck repair, trailer maintenance, vehicle tracking, repair scheduling, fleet operations, maintenance management',
  authors: [{ name: 'SE Repairs' }],
  creator: 'SE Repairs',
  publisher: 'SE Repairs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SE Repairs - Professional Fleet Management Solutions',
    description: 'Advanced fleet management system for truck and trailer repairs. Streamline operations and optimize fleet performance.',
    url: '/',
    siteName: 'SE Repairs',
    images: [
      {
        url: '/logo.svg',
        width: 200,
        height: 60,
        alt: 'SE Repairs Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SE Repairs - Professional Fleet Management Solutions',
    description: 'Advanced fleet management system for truck and trailer repairs.',
    images: ['/logo.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
};

const LOCALE_COOKIE = 'se-repairs-locale';

async function getInitialLocale(): Promise<'en' | 'pa'> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (cookieLocale === 'pa') return 'pa';
  return 'en';
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = await getInitialLocale();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <GlobalErrorHandler />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TranslationProvider initialLocale={initialLocale}>
              <ServiceWorkerRegister />
              <PerformanceMonitor enableLogging={process.env.NODE_ENV === 'development'} />
              {children}
              <PWAInstaller />
              <Toaster position="top-center" richColors />
            </TranslationProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
