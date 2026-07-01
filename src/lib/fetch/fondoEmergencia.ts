// src\lib\fetch\fondoEmergencia.ts

import type { FondoEmergenciaDB, PATCHFondoEmergencia } from "@/types/fondoEmergencia";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetFondoEmergenciaParams = {
  sub: string;
  token: string;
  signal?: AbortSignal;
}

type FetchGetFondoEmergenciaResponse = ResponseBackend<FondoEmergenciaDB>;

export const fetchFondoEmergencia = async ({ sub, token, signal }: FetchGetFondoEmergenciaParams) => {
  const queryString = new URLSearchParams({ sub }).toString();

  return await fetch(`${VITE_BACKEND_URL}/fondo-emergencia?${queryString}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetFondoEmergenciaResponse>;
}

type FetchPatchFondoEmergenciaParams = {
  token: string;
  data: PATCHFondoEmergencia;
}

type FetchPatchFondoEmergenciaResponse = ResponseBackend<FondoEmergenciaDB>;

export const fetchPatchFondoEmergencia = async ({ token, data }: FetchPatchFondoEmergenciaParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fondo-emergencia`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPatchFondoEmergenciaResponse>;
}
