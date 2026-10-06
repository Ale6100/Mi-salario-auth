// src\hooks\useCotizacionDolarMep.ts

import { fetchCotizacionDolarMep } from "@/lib/fetch/dolar";
import { useQuery } from "@tanstack/react-query";

const TREINTA_MINUTOS = 30 * 60 * 1000;

export const useCotizacionDolarMep = () => {
  return useQuery({
    queryKey: ["cotizacion-dolar-mep"],
    queryFn: ({ signal }) => fetchCotizacionDolarMep({ signal }),
    staleTime: TREINTA_MINUTOS,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
