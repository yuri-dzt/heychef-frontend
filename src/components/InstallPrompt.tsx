import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, DownloadIcon, ShareIcon, PlusSquareIcon } from 'lucide-react';

/** How long to stay quiet after the user dismisses the banner. */
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const DISMISS_KEY = 'heychef_install_dismissed_at';
const INSTALLED_KEY = 'heychef_installed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  const ua = window.navigator.userAgent;
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as Mac but has touch
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
}

function inCooldown(): boolean {
  if (localStorage.getItem(INSTALLED_KEY)) return true;
  const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return at > 0 && Date.now() - at < DISMISS_COOLDOWN_MS;
}

/**
 * "Install app" banner (PWA).
 * - Android/Chromium: shows a real install button via `beforeinstallprompt`.
 * - iOS/Safari: no programmatic install exists, so it shows the manual steps.
 * Hidden entirely once installed or recently dismissed.
 */
export function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandalone() || inCooldown()) return;

    // Android / desktop Chromium — the browser tells us it's installable.
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Once installed, never nag again.
    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, '1');
      setVisible(false);
    };
    window.addEventListener('appinstalled', onInstalled);

    // iOS never fires beforeinstallprompt — show instructions instead.
    let iosTimer: ReturnType<typeof setTimeout> | undefined;
    if (isIOS()) {
      setIos(true);
      iosTimer = setTimeout(() => setVisible(true), 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, '1');
    } else {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setDeferred(null);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Instalar o aplicativo HeyChef"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-[70] p-3 pb-safe pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-surface shadow-2xl border border-border p-4">
            <div className="flex items-start gap-3">
              <img src="/pwa-192.png" alt="" className="w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary">Instale o HeyChef</p>
                <p className="text-sm text-text-secondary mt-0.5">
                  Acesso rápido na tela inicial — não perca nenhuma novidade.
                </p>
              </div>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Agora não"
                className="p-2 -m-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary rounded-full flex-shrink-0"
              >
                <XIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {ios ? (
              <div className="mt-3 rounded-xl bg-background p-3 text-sm text-text-secondary">
                Para instalar no iPhone: toque em{' '}
                <ShareIcon className="inline w-4 h-4 mx-0.5 -mt-0.5 text-info" aria-label="Compartilhar" />{' '}
                <span className="font-medium text-text-primary">Compartilhar</span> e depois em{' '}
                <PlusSquareIcon className="inline w-4 h-4 mx-0.5 -mt-0.5" aria-hidden="true" />{' '}
                <span className="font-medium text-text-primary">Adicionar à Tela de Início</span>.
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-1 min-h-[44px] rounded-lg border border-border text-text-secondary font-medium hover:bg-gray-50 transition-colors"
                >
                  Agora não
                </button>
                <button
                  type="button"
                  onClick={install}
                  className="flex-1 min-h-[44px] rounded-lg bg-primary hover:bg-primary-hover text-white font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" aria-hidden="true" />
                  Instalar
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
