// src\lib\fetch\fondoEmergencia.ts

import type { FondoEmergenciaDB, PATCHFondoEmergencia } from "@/types/fondoEmergencia";
import { requestBackend } from "./backend";

type FetchGetFondoEmergenciaParams = {
  token: string;
  signal?: AbortSignal;
}

export const fetchFondoEmergencia = async ({ token, signal }: FetchGetFondoEmergenciaParams) => {
  return await requestBackend<FondoEmergenciaDB | null>("/fondo-emergencia", { token, signal });
}

type FetchPatchFondoEmergenciaParams = {
  token: string;
  data: PATCHFondoEmergencia;
}

export const fetchPatchFondoEmergencia = async ({ token, data }: FetchPatchFondoEmergenciaParams) => {
  return await requestBackend<FondoEmergenciaDB>("/fondo-emergencia", { token, method: "PATCH", body: data });
}
