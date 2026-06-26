// src\hooks\useFuentesIngreso.ts

import { fetchFuentesIngreso } from "@/lib/fetch/fuentesIngreso";
import type { FuenteIngresoDB } from "@/types/fuentesIngreso";
import { useAuth0, User } from "@auth0/auth0-react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

const EMPTY_FUENTES_INGRESO: FuenteIngresoDB[] = [];

type UseFuentesIngresoResult = Omit<UseQueryResult<FuenteIngresoDB[]>, "data"> & {
  data: FuenteIngresoDB[];
}

type UseFuentesIngresoParams = {
  user?: User;
}

export const useFuentesIngreso = ({ user }: UseFuentesIngresoParams = {}): UseFuentesIngresoResult => {
  const { getAccessTokenSilently } = useAuth0();

  const query = useQuery<FuenteIngresoDB[]>({
    queryKey: ["fuentes-ingreso", user],
    queryFn: async ({ signal }) => {
      if (!user?.sub) return EMPTY_FUENTES_INGRESO;

      const token = await getAccessTokenSilently();
      if (!token) return EMPTY_FUENTES_INGRESO;

      const response = await fetchFuentesIngreso({ token, signal });
      return response.data || EMPTY_FUENTES_INGRESO;
    },
    initialData: EMPTY_FUENTES_INGRESO,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: Boolean(user?.sub),
  })

  return query
}
