import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendUrl = process.env.VITE_BACKEND_URL || process.env.BACKEND_URL || 'http://127.0.0.1:5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: true,
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true
      },
      '/socket.io': {
        target: backendUrl,
        ws: true
      }
    }
  }
});
