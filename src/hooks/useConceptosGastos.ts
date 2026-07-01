// src\hooks\useConceptosGastos.ts

import { fetchConceptosGastos } from "@/lib/fetch/conceptosGastos";
import { useAuth0, type User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ConceptoGastosDB } from "@/types/conceptosGastos";

const EMPTY_CONCEPTOS_GASTOS: ConceptoGastosDB[] = [];

type UseConceptosGastosResult = Omit<UseQueryResult<ConceptoGastosDB[]>, "data"> & {
  data: ConceptoGastosDB[];
}

type UseConceptosGastosParams = {
  user?: User;
  periodo?: string;
}

export const useConceptosGastos = ({ user, periodo }: UseConceptosGastosParams = {}): UseConceptosGastosResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<ConceptoGastosDB[]>({
    queryKey: ["conceptos-gastos", user, periodo],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_CONCEPTOS_GASTOS;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_CONCEPTOS_GASTOS;

      const response = await fetchConceptosGastos({ sub: user.sub, periodo, token, signal });
      return response.data || EMPTY_CONCEPTOS_GASTOS;
    },
    initialData: EMPTY_CONCEPTOS_GASTOS,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}
