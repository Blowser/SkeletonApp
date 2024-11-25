import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SkeletonApp',
  webDir: 'www',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https', // Configura el esquema del servidor para Android
  },
};

export default config;

