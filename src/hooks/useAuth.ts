// src\auth\useAuth.ts

import { toast } from "sonner";
import { useAuth0 } from "@auth0/auth0-react";

const { DEV } = import.meta.env;

/**
 * Hook personalizado que wrappea `useAuth0` de Auth0.
 *
 * En desarrollo ignora el contexto de Auth0 y retorna un usuario mockeado
 * autenticado, así no hace falta tener credenciales configuradas.
 *
 * En producción delega al hook real de Auth0.
 *
 */
export function useAuth() {
  const auth = useAuth0();

  if (DEV) {
    return {
      user: { name: "Usuario DEV", email: "dev@example.com" },
      isAuthenticated: true,
      isLoading: false,
      error: undefined,
      loginWithRedirect: () => toast.info('No disponible en desarrollo'),
      logout: () => toast.info('No disponible en desarrollo'),
      getAccessTokenSilently: () => Promise.resolve("mock-token"),
    };
  }

  return auth;
}
