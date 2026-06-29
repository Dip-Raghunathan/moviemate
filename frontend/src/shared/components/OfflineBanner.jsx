import { useEffect, useState } from 'react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('api-offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('api-offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        background: 'rgba(232, 16, 42, 0.96)',
        color: 'white',
        padding: '0.75rem 1rem',
        textAlign: 'center',
        fontSize: '0.95rem',
        fontWeight: 600,
        backdropFilter: 'blur(10px)',
      }}
    >
      You are offline. Reconnect to continue using PhilixMate normally.
    </div>
  );
};

export default OfflineBanner;
