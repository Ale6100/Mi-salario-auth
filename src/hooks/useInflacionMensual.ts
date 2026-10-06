// src\hooks\useInflacionMensual.ts

import { fetchInflacionMensual } from "@/lib/fetch/inflacion";
import { useQuery } from "@tanstack/react-query";

const DOCE_HORAS = 12 * 60 * 60 * 1000;

export const useInflacionMensual = () => {
  return useQuery({
    queryKey: ["inflacion-mensual"],
    queryFn: ({ signal }) => fetchInflacionMensual({ signal }),
    staleTime: DOCE_HORAS,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
