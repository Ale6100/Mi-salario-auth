// src\lib\fetch\fuentesIngresos.ts

import type { FuenteIngresosDB, POSTFuenteIngresos, PUTFuenteIngresos } from "@/types/fuentesIngresos";
import { requestBackend } from "./backend";

type FetchGetFuentesIngresosParams = {
  token: string;
  signal?: AbortSignal;
}

export const fetchFuentesIngresos = async ({ token, signal }: FetchGetFuentesIngresosParams) => {
  return await requestBackend<FuenteIngresosDB[]>("/fuentes-ingresos", { token, signal });
}

type FetchPostFuenteIngresosParams = {
  token: string;
  data: POSTFuenteIngresos;
}

export const fetchPostFuenteIngresos = async ({ token, data }: FetchPostFuenteIngresosParams) => {
  return await requestBackend<FuenteIngresosDB>("/fuentes-ingresos", { token, method: "POST", body: data });
}

type FetchPutFuenteIngresosParams = {
  token: string;
  id: string;
  data: PUTFuenteIngresos;
}

export const fetchPutFuenteIngresos = async ({ token, id, data }: FetchPutFuenteIngresosParams) => {
  return await requestBackend<FuenteIngresosDB>(`/fuentes-ingresos/${id}`, { token, method: "PUT", body: data });
}

type FetchDeleteFuenteIngresosParams = {
  token: string;
  id: string;
}

export const fetchDeleteFuenteIngresos = async ({ token, id }: FetchDeleteFuenteIngresosParams) => {
  return await requestBackend<null>(`/fuentes-ingresos/${id}`, { token, method: "DELETE" });
}
