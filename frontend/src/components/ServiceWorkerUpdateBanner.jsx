import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ServiceWorkerUpdateBanner = () => {
  const [registration, setRegistration] = useState(null);
  const [visible, setVisible] = useState(false);
  const shouldReload = useRef(false);

  useEffect(() => {
    const handler = (event) => {
      const nextRegistration = event.detail && event.detail.registration;
      if (!nextRegistration) return;
      setRegistration(nextRegistration);
      setVisible(true);
    };

    window.addEventListener('sw-update', handler);
    return () => window.removeEventListener('sw-update', handler);
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onControllerChange = () => {
      if (shouldReload.current) {
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, []);

  const handleRefresh = () => {
    if (!registration || !registration.waiting) {
      setVisible(false);
      return;
    }

    shouldReload.current = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-6 left-6 right-6 z-50 mx-auto max-w-xl rounded-2xl border border-white/10 bg-panel/90 px-6 py-4 shadow-glow backdrop-blur"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">Update available</p>
          <p className="text-xs text-white/60">Refresh to get the latest dashboard features.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setVisible(false)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
          >
            Later
          </button>
          <button
            onClick={handleRefresh}
            className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-ink"
          >
            Update now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ServiceWorkerUpdateBanner;
