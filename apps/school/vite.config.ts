import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: "globalThis", //<-- AWS SDK 
      },
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyFill(),
      ],
      output: {
        manualChunks: {
          lodash: ['lodash']
        }
      }
    },
    chunkSizeWarningLimit: 1600
  },
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser', // <-- Fix from above
    },
  }
});