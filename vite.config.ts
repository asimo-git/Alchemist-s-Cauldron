import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    globals: true,
  },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,gif,svg,woff2}'],
      },
      manifest: {
        name: "Alchemist's Cauldron",
        short_name: 'Cauldron',
        description: 'Brew potions before time runs out',
        // the color of the system panel/window header around the application
        theme_color: '#130e10',
        //the color of the splash screen while the game is loading.
        background_color: '#0a0708',
        //The app opens in its own window, without an address bar or tabs.
        //Variants: 'fullscreen' (no system bars at all), 'minimal-ui', 'browser'.
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
