import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind()],
  adapter: vercel(),
  vite: {
    optimizeDeps: {
      exclude: ['@jsquash/avif', '@jsquash/jpeg', '@jsquash/png', '@jsquash/webp']
    },
    build: {
      target: 'esnext'
    },
    worker: {
      format: 'es'
    }
  }
});
