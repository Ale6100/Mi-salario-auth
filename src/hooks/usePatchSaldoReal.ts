// src\hooks\usePatchSaldoReal.ts

import { fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const usePatchSaldoReal = () => {
  const { getAccessTokenSilently } = useAuth0();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: number | null) => {
      const token = await getAccessTokenSilently();
      const response = await fetchPatchFondoEmergencia({
        token,
        data: { saldo_real: value },
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fondo-emergencia"] });
    },
  });
}
