// src\hooks\useFuentesGastos.ts

import { fetchFuentesGastos } from "@/lib/fetch/fuentesGastos";
import { useAuth0, type User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { FuenteGastosDB } from "@/types/fuentesGastos";

const EMPTY_FUENTES_GASTOS: FuenteGastosDB[] = [];

type UseFuentesGastosResult = Omit<UseQueryResult<FuenteGastosDB[]>, "data"> & {
  data: FuenteGastosDB[];
}

type UseFuentesGastosParams = {
  user?: User;
}

export const useFuentesGastos = ({ user }: UseFuentesGastosParams = {}): UseFuentesGastosResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<FuenteGastosDB[]>({
    queryKey: ["fuentes-gastos", user],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_FUENTES_GASTOS;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_FUENTES_GASTOS;

      const response = await fetchFuentesGastos({ sub: user.sub, token, signal });
      return response.data || EMPTY_FUENTES_GASTOS;
    },
    initialData: EMPTY_FUENTES_GASTOS,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}
