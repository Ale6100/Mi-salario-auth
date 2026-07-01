// src\hooks\useFondoEmergencia.ts

import { fetchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { useAuth0, type User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { FondoEmergenciaDB } from "@/types/fondoEmergencia";

const EMPTY_FONDO_EMERGENCIA = null;

type UseFondoEmergenciaResult = Omit<UseQueryResult<FondoEmergenciaDB | null>, "data"> & {
  data: FondoEmergenciaDB | null;
}

type UseFondoEmergenciaParams = {
  user?: User;
}

export const useFondoEmergencia = ({ user }: UseFondoEmergenciaParams = {}): UseFondoEmergenciaResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<FondoEmergenciaDB | null>({
    queryKey: ["fondo-emergencia", user],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_FONDO_EMERGENCIA;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_FONDO_EMERGENCIA;

      const response = await fetchFondoEmergencia({ sub: user.sub, token, signal });
      return response.data || EMPTY_FONDO_EMERGENCIA;
    },
    initialData: EMPTY_FONDO_EMERGENCIA,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}
