'use client';

import React, { useEffect, useState } from 'react';
import { useVyapar } from '@/context/VyaparContext';
import { Download, RefreshCw, CheckCircle2 } from 'lucide-react';

export function PwaRegister() {
  const { showToast } = useVyapar();
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if running in installed standalone mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Capture install prompt for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Register Service Worker in production / supported environments
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[VyaparGlass SW] Registered with scope:', registration.scope);

            // Listen for service worker updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    setUpdateAvailable(true);
                    showToast(
                      'App Update Ready',
                      'A new version of VyaparGlass is ready. Reload to apply.',
                      'info'
                    );
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[VyaparGlass SW] Registration failed:', err);
          });
      });

      // Reload smoothly when new worker takes control
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [showToast]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      showToast('App Installed', 'VyaparGlass was added to your device home screen.', 'success');
    }
    setInstallPrompt(null);
  };

  const handleReloadUpdate = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="fixed top-18 right-5 z-[100] max-w-sm bg-indigo-900/90 text-white p-3 rounded-2xl border border-indigo-500/50 backdrop-blur-xl shadow-glass flex items-center justify-between gap-3 text-xs animate-slide-up">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin" />
            <span>New application update downloaded!</span>
          </div>
          <button
            onClick={handleReloadUpdate}
            className="px-2.5 py-1 rounded-xl bg-white text-indigo-900 font-bold text-[11px] hover:bg-slate-100 shrink-0"
          >
            Reload Now
          </button>
        </div>
      )}

      {/* Install App Prompt Pill (Visible when eligible and not in standalone mode) */}
      {installPrompt && !isStandalone && (
        <div className="fixed bottom-20 left-5 z-[90] animate-slide-up select-none">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-elevation flex items-center gap-2 border border-indigo-400/40 backdrop-blur-md transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Install VyaparGlass App</span>
          </button>
        </div>
      )}
    </>
  );
}
