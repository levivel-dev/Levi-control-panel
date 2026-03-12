import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../utils/api';

const SettingsPage = () => {
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [swStatus, setSwStatus] = useState('Checking...');

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setSwStatus('Service worker active');
        } else {
          setSwStatus('Service worker not registered');
        }
      });
    } else {
      setSwStatus('Service worker not supported');
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl border border-white/10 bg-panel/70 p-8"
      >
        <h3 className="text-2xl font-semibold text-white">Settings</h3>
        <p className="mt-2 text-sm text-white/60">
          Manage environment settings, install the app, and check PWA status.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">Environment</h4>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>API Base URL</p>
            <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-white">
              {API_BASE_URL}
            </p>
            <p className="text-xs text-white/50">Set via VITE_API_BASE_URL</p>
          </div>
        </div>
        <div className="rounded-3xl border border-white/5 bg-panel/80 p-6">
          <h4 className="text-lg font-semibold text-white">PWA Install</h4>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>{swStatus}</p>
            <button
              onClick={handleInstall}
              disabled={!canInstall}
              className={`rounded-full px-4 py-2 text-sm ${
                canInstall ? 'bg-accent text-ink' : 'bg-white/10 text-white/50'
              }`}
            >
              {canInstall ? 'Install App' : 'Install not available'}
            </button>
            <p className="text-xs text-white/50">
              Use Chrome and select Install App for the full mobile experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
