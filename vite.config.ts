import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/proxy/pii': {
        target: 'http://57.152.84.241:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/pii/, '')
      },
      '/proxy/toxicity': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/toxicity/, '')
      },
      '/proxy/jailbreak-roberta': {
        target: 'http://172.210.123.118:5005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/jailbreak-roberta/, '')
      },
      '/proxy/jailbreak-distilbert': {
        target: 'http://4.156.246.0:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/jailbreak-distilbert/, '')
      },
      '/proxy/ban': {
        target: 'http://48.194.33.158:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/ban/, '')
      },
      '/proxy/secrets': {
        target: 'http://4.156.154.216:8005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/secrets/, '')
      },
      '/proxy/format': {
        target: 'http://20.242.132.57:8006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/format/, '')
      },
      '/proxy/gibberish': {
        target: 'http://51.8.74.156:8007',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy\/gibberish/, '')
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
