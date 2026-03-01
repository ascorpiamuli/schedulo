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
                  (isProd ? "https://schedule.pasbestventures.com" : "https://schedulo.internal");
  
  // Only log in development, not in production
  if (!isProd) {
    console.log(`🚀 Building for ${mode} mode with URL: ${siteUrl}`);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      allowedHosts: ["schedulo.internal", "localhost"],
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger()
    ].filter(Boolean),
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
    // Remove console logs in production
    esbuild: {
      pure: isProd ? ["console.log", "console.info", "console.debug", "console.warn"] : [],
      drop: isProd ? ["console"] : [],
    },
    // Build options for production
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug', 'console.warn'] : [],
        },
      },
      // Reduce build output verbosity
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
    },
  };
});