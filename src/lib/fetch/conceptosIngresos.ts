// src\lib\fetch\conceptosIngresos.ts

import type { ConceptoIngresosDB, POSTConceptoIngresos, PUTConceptoIngresos } from "@/types/conceptosIngresos";
import { requestBackend } from "./backend";

type FetchGetConceptosIngresosParams = {
  periodo?: string;
  token: string;
  signal?: AbortSignal;
}

export const fetchConceptosIngresos = async ({ periodo, token, signal }: FetchGetConceptosIngresosParams) => {
  const query = new URLSearchParams();
  if (periodo) {
    query.set("periodo", periodo);
  }

  return await requestBackend<ConceptoIngresosDB[]>(`/conceptos-ingresos?${query.toString()}`, { token, signal });
}

type FetchPostConceptoIngresosParams = {
  token: string;
  data: POSTConceptoIngresos;
}

export const fetchPostConceptoIngresos = async ({ token, data }: FetchPostConceptoIngresosParams) => {
  return await requestBackend<ConceptoIngresosDB>("/conceptos-ingresos", { token, method: "POST", body: data });
}

type FetchPutConceptoIngresosParams = {
  token: string;
  id: string;
  data: PUTConceptoIngresos;
}

export const fetchPutConceptoIngresos = async ({ token, id, data }: FetchPutConceptoIngresosParams) => {
  return await requestBackend<ConceptoIngresosDB>(`/conceptos-ingresos/${id}`, { token, method: "PUT", body: data });
}

type FetchDeleteConceptoIngresosParams = {
  token: string;
  id: string;
}

export const fetchDeleteConceptoIngresos = async ({ token, id }: FetchDeleteConceptoIngresosParams) => {
  return await requestBackend<null>(`/conceptos-ingresos/${id}`, { token, method: "DELETE" });
}

type FetchCopiarConceptosIngresosParams = {
  token: string;
  periodoDestino: string;
}

export const fetchCopiarConceptosIngresosDelMesAnterior = async ({ token, periodoDestino }: FetchCopiarConceptosIngresosParams) => {
  return await requestBackend<ConceptoIngresosDB[]>("/conceptos-ingresos/copiar-periodo-anterior", { token, method: "POST", body: { periodo_destino: periodoDestino } });
}
