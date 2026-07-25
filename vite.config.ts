import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'HeyChef',
        short_name: 'HeyChef',
        description: 'Gestão de estabelecimentos — cardápio digital e pedidos por QR Code',
        lang: 'pt-BR',
        theme_color: '#E86024',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell; navigations fall back to index.html (SPA).
        navigateFallback: '/index.html',
        // Never intercept API calls — the SPA talks to a separate backend.
        navigateFallbackDenylist: [/^\/api/, /^\/auth/, /^\/public/],
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      },
      devOptions: {
        // Let us test the install flow while running `vite` in dev.
        enabled: true,
      },
    }),
  ],
  server: {
    port: 3000,
  },
})
