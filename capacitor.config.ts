import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.heychef.app',
  appName: 'HeyChef',
  webDir: 'dist',
  server: {
    // Serve the bundled app over http://localhost so calling the LAN backend
    // (also http) is not treated as mixed content.
    androidScheme: 'http',
    // Allow plain-HTTP requests to the backend on the local network.
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    // Route XHR/fetch through the native layer: bypasses browser CORS and
    // handles cleartext, so axios can reach the LAN backend directly.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
