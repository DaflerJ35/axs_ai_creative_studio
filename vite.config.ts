import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Proxy ComfyUI through Vite so the browser talks to same-origin,
      // completely bypassing CORS / mixed-content issues.
      proxy: {
        '/__comfyui': {
          target: 'http://127.0.0.1:8188',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/__comfyui/, ''),
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            const normalized = id.replace(/\\/g, '/');
            if (!normalized.includes('/node_modules/')) return undefined;
            if (normalized.includes('/node_modules/three/')) return 'vendor-three';
            if (normalized.includes('/node_modules/@react-three/fiber/')) return 'vendor-r3f';
            if (normalized.includes('/node_modules/@react-three/drei/')) return 'vendor-drei';
            if (
              normalized.includes('/node_modules/react/') ||
              normalized.includes('/node_modules/react-dom/') ||
              normalized.includes('/node_modules/scheduler/')
            ) return 'vendor-react';
            if (normalized.includes('/node_modules/lucide-react/')) return 'vendor-icons';
            if (normalized.includes('/node_modules/@dnd-kit/')) return 'vendor-dnd';
            return undefined;
          },
        },
      },
    },
  };
});
