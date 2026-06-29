// src\hooks\useFuentesIngresos.ts

import { fetchFuentesIngresos } from "@/lib/fetch/fuentesIngresos";
import { useAuth0, User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { FuenteIngresosDB } from "@/types/fuentesIngresos";

const EMPTY_FUENTES_INGRESOS: FuenteIngresosDB[] = [];

type UseFuentesIngresosResult = Omit<UseQueryResult<FuenteIngresosDB[]>, "data"> & {
  data: FuenteIngresosDB[];
}

type UseFuentesIngresosParams = {
  user?: User;
}

export const useFuentesIngresos = ({ user }: UseFuentesIngresosParams = {}): UseFuentesIngresosResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<FuenteIngresosDB[]>({
    queryKey: ["fuentes-ingreso", user],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_FUENTES_INGRESOS;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_FUENTES_INGRESOS;

      const response = await fetchFuentesIngresos({ sub: user.sub, token, signal });
      return response.data || EMPTY_FUENTES_INGRESOS;
    },
    initialData: EMPTY_FUENTES_INGRESOS,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}
