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
    },
  };
});
