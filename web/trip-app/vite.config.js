import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { basename } from 'path'

export default defineConfig({
  base: '/Major-Assignment/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})