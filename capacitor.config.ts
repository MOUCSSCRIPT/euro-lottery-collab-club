
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9392500c09724f339a5c5897b836e6e1',
  appName: 'euro-lottery-collab-club',
  webDir: 'dist',
  server: {
    url: 'https://9392500c-0972-4f33-9a5c-5897b836e6e1.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#3B82F6',
      showSpinner: false
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;
