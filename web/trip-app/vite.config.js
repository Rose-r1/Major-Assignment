import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有地址，包括局域网和本地 IPv4
    // 或者
    // host: 'localhost', 
    port: 5173,
  },
})