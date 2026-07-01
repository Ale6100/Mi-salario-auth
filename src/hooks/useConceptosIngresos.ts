// src\hooks\useConceptosIngresos.ts

import { fetchConceptosIngresos } from "@/lib/fetch/conceptosIngresos";
import { useAuth0, type User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { ConceptoIngresosDB } from "@/types/conceptosIngresos";

const EMPTY_CONCEPTOS_INGRESOS: ConceptoIngresosDB[] = [];

type UseConceptosIngresosResult = Omit<UseQueryResult<ConceptoIngresosDB[]>, "data"> & {
  data: ConceptoIngresosDB[];
}

type UseConceptosIngresosParams = {
  user?: User;
  periodo?: string;
}

export const useConceptosIngresos = ({ user, periodo }: UseConceptosIngresosParams = {}): UseConceptosIngresosResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<ConceptoIngresosDB[]>({
    queryKey: ["conceptos-ingreso", user, periodo],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_CONCEPTOS_INGRESOS;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_CONCEPTOS_INGRESOS;

      const response = await fetchConceptosIngresos({ sub: user.sub, periodo, token, signal });
      return response.data || EMPTY_CONCEPTOS_INGRESOS;
    },
    initialData: EMPTY_CONCEPTOS_INGRESOS,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}