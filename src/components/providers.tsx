'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/theme-provider';
import { TranslationProvider } from '@/components/translation-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { GlobalErrorHandler } from '@/components/global-error-handler';
import { PerformanceMonitor } from '@/components/performance-monitor';
import { PWAInstaller } from '@/components/pwa-installer';
import { Toaster } from '@/components/ui/sonner';
import { ServiceWorkerRegister } from '@/components/service-worker-register';

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale: 'en' | 'pa' }) {
  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}