// src\hooks\usePatchSaldoReal.ts

import { fetchPatchFondoEmergencia } from "@/lib/fetch/fondoEmergencia";
import { getDataOrThrow } from "@/lib/fetch/backend";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
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
      return getDataOrThrow(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["fondo-emergencia"] });
    },
    onError: () => {
      toast.error("No se pudo guardar el saldo real");
    },
  });
}
