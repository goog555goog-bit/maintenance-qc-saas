import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const setOffline = () => setIsOffline(true);
    const setOnline = () => setIsOffline(false);
    window.addEventListener('offline', setOffline);
    window.addEventListener('online', setOnline);
    return () => {
      window.removeEventListener('offline', setOffline);
      window.removeEventListener('online', setOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-yellow-500 text-white px-4 py-2 flex items-center justify-center text-sm">
      <WifiOff size={16} className="mr-2" />
      You are currently offline. Changes will be synced when you reconnect.
    </div>
  );
}
