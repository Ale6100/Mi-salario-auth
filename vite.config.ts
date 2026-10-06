/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import { z } from 'zod';
import path from "node:path"
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

const envSchema = z.object({
  VITE_AUTH_DOMAIN: z.string({ message: 'La variable de entorno VITE_AUTH_DOMAIN es requerida' }),
  VITE_AUTH_CLIENT_ID: z.string({ message: 'La variable de entorno VITE_AUTH_CLIENT_ID es requerida' }),
  VITE_AUTH_AUDIENCE: z.string({ message: 'La variable de entorno VITE_AUTH_AUDIENCE es requerida' }),
  VITE_BACKEND_URL: z.string({ message: 'La variable de entorno VITE_BACKEND_URL es requerida' })
});

// Los tests no dependen del .env local: usan valores ficticios y todo lo remoto se mockea.
const TEST_ENV: z.infer<typeof envSchema> = {
  VITE_AUTH_DOMAIN: 'auth.test',
  VITE_AUTH_CLIENT_ID: 'client-id-test',
  VITE_AUTH_AUDIENCE: 'https://audience.test',
  VITE_BACKEND_URL: 'https://backend.test',
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isTest = mode === 'test';
  const { VITE_AUTH_DOMAIN, VITE_AUTH_CLIENT_ID, VITE_AUTH_AUDIENCE, VITE_BACKEND_URL } = isTest ? TEST_ENV : loadEnv(mode, process.cwd(), '');

  const { success, error } = envSchema.safeParse({
    VITE_AUTH_DOMAIN,
    VITE_AUTH_CLIENT_ID,
    VITE_AUTH_AUDIENCE,
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
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      env: TEST_ENV,
      clearMocks: true,
      restoreMocks: true,
      unstubGlobals: true,
      unstubEnvs: true,
    },
  }
});
