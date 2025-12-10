'use client';

import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if prompt was previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    
    if (dismissed && Date.now() - dismissedTime < sevenDays) {
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after user has visited report page (engagement)
      const visited = localStorage.getItem('visited-report');
      if (visited) {
        setTimeout(() => setShowInstallPrompt(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('PWA installation accepted');
    } else {
      console.log('PWA installation dismissed');
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-md">
      <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-50 to-white p-4 shadow-2xl dark:from-blue-950/30 dark:to-slate-900">
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
            <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Install SE Repairs
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Add to your home screen for quick access and offline reporting capabilities.
            </p>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Install App
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="outline"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
