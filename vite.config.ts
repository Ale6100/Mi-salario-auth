import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { z } from 'zod';

const envSchema = z.object({
  VITE_AUTH_DOMAIN: z.string({ message: 'La variable de entorno VITE_AUTH_DOMAIN es requerida' }),
  VITE_AUTH_CLIENT_ID: z.string({ message: 'La variable de entorno VITE_AUTH_CLIENT_ID es requerida' }),
  VITE_BACKEND_URL: z.string({ message: 'La variable de entorno VITE_BACKEND_URL es requerida' })
});

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const { VITE_AUTH_DOMAIN, VITE_AUTH_CLIENT_ID, VITE_BACKEND_URL } = loadEnv(mode, process.cwd(), '');

  const { success, error } = envSchema.safeParse({
    VITE_AUTH_DOMAIN,
    VITE_AUTH_CLIENT_ID,
    VITE_BACKEND_URL
  });

  if (!success) {
    console.error(`Error en las variables de entorno: ${JSON.stringify(z.treeifyError(error))}`);
    process.exit(1);
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: ["junkyard-timing-consensus.ngrok-free.dev"],
    },
  }
});
