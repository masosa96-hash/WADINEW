import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/",
    plugins: [react()],
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL || env.SUPABASE_URL
      ),
      "import.meta.env.VITE_SUPABASE_KEY": JSON.stringify(
        env.VITE_SUPABASE_KEY || env.SUPABASE_KEY
      ),
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'react-vendor';
              }
              if (id.includes('@supabase')) {
                return 'supabase';
              }
              if (id.includes('lucide-react')) {
                return 'ui-vendor';
              }
              // Catch-all for other large deps if any, or let them stay in index
              // return 'vendor'; 
            }
          }
        }
      }
    },
  };
});
