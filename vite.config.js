import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages project path. Change this if you choose another repository name.
  base: '/travel-hub/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Travel Hub',
        short_name: 'Travel Hub',
        description: 'Tu gestor personal de viaje',
        theme_color: '#172d3b',
        background_color: '#f4f6f7',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        icons: [
          { src: 'pwa-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: 'pwa-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}']
      }
    })
  ]
})
