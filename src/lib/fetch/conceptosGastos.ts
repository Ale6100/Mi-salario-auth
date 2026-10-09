// src\lib\fetch\conceptosGastos.ts

import type { ConceptoGastosDB, PATCHConceptoGastos, POSTConceptoGastos, PUTConceptoGastos } from "@/types/conceptosGastos";
import { requestBackend } from "./backend";

type FetchGetConceptosGastosParams = {
  periodo?: string;
  token: string;
  signal?: AbortSignal;
}

export const fetchConceptosGastos = async ({ periodo, token, signal }: FetchGetConceptosGastosParams) => {
  const query = new URLSearchParams();
  if (periodo) {
    query.set("periodo", periodo);
  }

  return await requestBackend<ConceptoGastosDB[]>(`/conceptos-gastos?${query.toString()}`, { token, signal });
}

type FetchPostConceptoGastosParams = {
  token: string;
  data: POSTConceptoGastos;
}

export const fetchPostConceptoGastos = async ({ token, data }: FetchPostConceptoGastosParams) => {
  return await requestBackend<ConceptoGastosDB>("/conceptos-gastos", { token, method: "POST", body: data });
}

type FetchPutConceptoGastosParams = {
  token: string;
  id: string;
  data: PUTConceptoGastos;
}

export const fetchPutConceptoGastos = async ({ token, id, data }: FetchPutConceptoGastosParams) => {
  return await requestBackend<ConceptoGastosDB>(`/conceptos-gastos/${id}`, { token, method: "PUT", body: data });
}

type FetchPatchConceptoGastosParams = {
  token: string;
  id: string;
  data: PATCHConceptoGastos;
}

export const fetchPatchConceptoGastos = async ({ token, id, data }: FetchPatchConceptoGastosParams) => {
  return await requestBackend<ConceptoGastosDB>(`/conceptos-gastos/${id}`, { token, method: "PATCH", body: data });
}

type FetchDeleteConceptoGastosParams = {
  token: string;
  id: string;
}

export const fetchDeleteConceptoGastos = async ({ token, id }: FetchDeleteConceptoGastosParams) => {
  return await requestBackend<null>(`/conceptos-gastos/${id}`, { token, method: "DELETE" });
}

type FetchCopiarConceptosGastosParams = {
  token: string;
  periodoDestino: string;
}

export const fetchCopiarConceptosGastosDelMesAnterior = async ({ token, periodoDestino }: FetchCopiarConceptosGastosParams) => {
  return await requestBackend<ConceptoGastosDB[]>("/conceptos-gastos/copiar-periodo-anterior", { token, method: "POST", body: { periodo_destino: periodoDestino } });
}
