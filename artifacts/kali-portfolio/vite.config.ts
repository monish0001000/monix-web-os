import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const isReplit = !!process.env.REPL_ID;

const port = isReplit ? Number(process.env.PORT ?? 3000) : 3000;
const basePath = isReplit ? (process.env.BASE_PATH ?? "/") : "/";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: basePath,
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ""),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ""),
      "import.meta.env.VITE_GROQ_API_KEY": JSON.stringify(env.VITE_GROQ_API_KEY ?? process.env.VITE_GROQ_API_KEY ?? ""),
      "import.meta.env.VITE_GEMINI_KEY_1": JSON.stringify(env.VITE_GEMINI_KEY_1 ?? env.VITE_GEMINI_API_KEY ?? process.env.VITE_GEMINI_KEY_1 ?? process.env.VITE_GEMINI_API_KEY ?? ""),
      "import.meta.env.VITE_GEMINI_KEY_2": JSON.stringify(env.VITE_GEMINI_KEY_2 ?? process.env.VITE_GEMINI_KEY_2 ?? ""),
    },
  plugins: [
    react(),
    tailwindcss(),
    ...(isReplit
      ? [
          (await import("@replit/vite-plugin-runtime-error-modal")).default(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({ root: path.resolve(import.meta.dirname, "..") })
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner()
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "src", "assets"),
      "@awareness": path.resolve(import.meta.dirname, "..", "..", "awareness-simulator", "src"),
      "motion/react": path.resolve(import.meta.dirname, "node_modules", "framer-motion"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
    fs: {
      strict: true,
      allow: [
        path.resolve(import.meta.dirname),
        path.resolve(import.meta.dirname, "..", ".."),
      ],
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
};
});
