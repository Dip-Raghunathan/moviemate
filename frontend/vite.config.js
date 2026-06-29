import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      // During local dev, requests to /api/* are forwarded to the backend
      // running on localhost:5000, so the frontend can just call '/api/...'
      // without needing CORS configuration or an env var.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
