'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerServiceWorker = async () => {
      try {
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[SW] Service worker registered:', registration.scope);

        // Check for updates every hour
        setInterval(() => {
          registration?.update();
        }, 60 * 60 * 1000);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              toast.info('App update available!', {
                description: 'Refresh to get the latest version',
                action: {
                  label: 'Refresh',
                  onClick: () => window.location.reload(),
                },
                duration: 10000,
              });
            }
          });
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[SW] Message from service worker:', event.data);

          if (event.data?.type === 'SYNC_ISSUES') {
            // Trigger offline queue sync
            window.dispatchEvent(new CustomEvent('sw-sync-issues'));
          }
        });

      } catch (error) {
        console.error('[SW] Service worker registration failed:', error);
      }
    };

    // Register service worker
    if (navigator.serviceWorker.controller) {
      console.log('[SW] Service worker already active');
    } else {
      registerServiceWorker();
    }

    // Handle service worker updates
    navigator.serviceWorker.ready.then((reg) => {
      console.log('[SW] Service worker ready');
      registration = reg;
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
}
