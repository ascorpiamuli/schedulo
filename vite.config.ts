import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const isProd = mode === "production";
  
  // Get the site URL from env, with fallbacks
  const siteUrl = process.env.VITE_SITE_URL || 
                  (isProd ? "https://schedule.pasbestventures.com" : "http://localhost:8080");
  
  console.log(`🚀 Building for ${mode} mode with URL: ${siteUrl}`);

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Define global constants
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
      'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(isProd),
    },
  };
});