// src\lib\fetch\fuentesGastos.ts

import type { FuenteGastosDB, POSTFuenteGastos, PUTFuenteGastos } from "@/types/fuentesGastos";
import { requestBackend } from "./backend";

type FetchGetFuentesGastosParams = {
  token: string;
  signal?: AbortSignal;
}

export const fetchFuentesGastos = async ({ token, signal }: FetchGetFuentesGastosParams) => {
  return await requestBackend<FuenteGastosDB[]>("/fuentes-gastos", { token, signal });
}

type FetchPostFuenteGastosParams = {
  token: string;
  data: POSTFuenteGastos;
}

export const fetchPostFuenteGastos = async ({ token, data }: FetchPostFuenteGastosParams) => {
  return await requestBackend<FuenteGastosDB>("/fuentes-gastos", { token, method: "POST", body: data });
}

type FetchPutFuenteGastosParams = {
  token: string;
  id: string;
  data: PUTFuenteGastos;
}

export const fetchPutFuenteGastos = async ({ token, id, data }: FetchPutFuenteGastosParams) => {
  return await requestBackend<FuenteGastosDB>(`/fuentes-gastos/${id}`, { token, method: "PUT", body: data });
}

type FetchDeleteFuenteGastosParams = {
  token: string;
  id: string;
}

export const fetchDeleteFuenteGastos = async ({ token, id }: FetchDeleteFuenteGastosParams) => {
  return await requestBackend<null>(`/fuentes-gastos/${id}`, { token, method: "DELETE" });
}
