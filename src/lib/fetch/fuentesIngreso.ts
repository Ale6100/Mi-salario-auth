// src\lib\fetch\fuentesIngreso.ts

import type { FuenteIngresoDB } from "@/types/fuentesIngreso";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetFuentesIngresoParams = {
  token: string;
  signal?: AbortSignal;
};

type FetchGetFuentesIngresoResponse = { // Todo: Hacer tipo genérico donde solo cambie el data
  statusCode: number;
  message?: string;
  data?: FuenteIngresoDB[];
}

export const fetchFuentesIngreso = async ({ token, signal }: FetchGetFuentesIngresoParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-ingreso`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetFuentesIngresoResponse>;
}
