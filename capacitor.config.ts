import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.metromemory.app',
  appName: 'MetroMemory',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // useful for local development:
    url: 'http://10.0.0.168:3000',
    cleartext: true
  }
};

export default config;
