import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.friends.crew',
  appName: 'Friends',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0c12',
    },
    Keyboard: {
      resize: 'none',
      style: 'DARK',
    },
  },
  ios: {
    contentInset: 'never',
    allowsLinkPreview: false,
    backgroundColor: '#0a0c12',
    allowsBackForwardNavigationGestures: true,
  },
};

export default config;
