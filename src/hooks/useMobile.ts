
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    setIsMobile(window.innerWidth < 768 || Capacitor.isNativePlatform());

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768 || Capacitor.isNativePlatform());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isNative };
};
