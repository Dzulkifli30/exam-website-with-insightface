import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'; // 1. Import plugin

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl() // 2. Add plugin to the list
  ],

  server: {
    // allowedHosts: [
    //   'lusty-ipad-spendable.ngrok-free.dev'
    // ]
    host: '0.0.0.0',
    port: 5173,
    // strictPort: false,

  }
})
