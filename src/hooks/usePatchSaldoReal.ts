// src\hooks\usePatchSaldoReal.ts

import { fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { useAuth0, type User } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UsePatchSaldoRealParams = {
  user?: User;
}

export const usePatchSaldoReal = ({ user }: UsePatchSaldoRealParams = {}) => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: number | null) => {
      const token = await getAccessTokenSilently();
      const response = await fetchPatchFondoEmergencia({
        token,
        data: {
          sub: user?.sub ?? "",
          saldo_real: value,
        },
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fondo-emergencia"] });
    },
  });
}
