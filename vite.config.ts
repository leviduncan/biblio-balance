import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    // Custom plugin to inject CSP header in dev
    {
      name: 'dev-csp-header',
      configResolved(config) {
        if (config.command === 'serve') {
          config.server.middlewares = config.server.middlewares || [];
          config.server.middlewares.push((req, res, next) => {
            // Allow connections to localhost on any port
            res.setHeader(
              'Content-Security-Policy',
              "default-src 'self' http://localhost:* ws://localhost:*; connect-src 'self' http://localhost:* ws://localhost:* blob:; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
            );
            next();
          });
        }
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
