import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('three') || id.includes('@react-three') || id.includes('@react-spring/three') || id.includes('@react-spring/core') || id.includes('@react-spring/shared') || id.includes('@react-spring/animated')) return 'vendor-three';
          if (id.includes('motion') || id.includes('gsap') || id.includes('animejs')) return 'vendor-motion';
          if (id.includes('jspdf') || id.includes('html-to-image') || id.includes('html2canvas') || id.includes('dompurify')) return 'vendor-pdf';
          if (id.includes('@supabase')) return 'vendor-supabase';
          return undefined;
        },
      },
    },
  },
});
