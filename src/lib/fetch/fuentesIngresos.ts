// src\lib\fetch\fuentesIngresos.ts

import type { FuenteIngresosDB, POSTFuenteIngresos, PUTFuenteIngresos } from "@/types/fuentesIngresos";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetFuentesIngresosParams = {
  sub: string;
  token: string;
  signal?: AbortSignal;
};

type FetchGetFuentesIngresosResponse = ResponseBackend<FuenteIngresosDB[]>;

export const fetchFuentesIngresos = async ({ sub, token, signal }: FetchGetFuentesIngresosParams) => {
  const queryString = new URLSearchParams({ sub }).toString();

  return await fetch(`${VITE_BACKEND_URL}/fuentes-ingresos?${queryString}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetFuentesIngresosResponse>;
}

type FetchPostFuenteIngresosParams = {
  token: string;
  data: POSTFuenteIngresos;
}

type FetchPostFuenteIngresosResponse = ResponseBackend<FuenteIngresosDB>;

export const fetchPostFuenteIngresos = async ({ token, data }: FetchPostFuenteIngresosParams) => {

  return await fetch(`${VITE_BACKEND_URL}/fuentes-ingresos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPostFuenteIngresosResponse>;
}

type FetchPutFuenteIngresosParams = {
  token: string;
  id: string;
  data: PUTFuenteIngresos;
}

type FetchPutFuenteIngresosResponse = ResponseBackend<FuenteIngresosDB>;

export const fetchPutFuenteIngresos = async ({ token, id, data }: FetchPutFuenteIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-ingresos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPutFuenteIngresosResponse>;
}

type FetchDeleteFuenteIngresosParams = {
  token: string;
  id: string;
}

type FetchDeleteFuenteIngresosResponse = ResponseBackend<null>;

export const fetchDeleteFuenteIngresos = async ({ token, id }: FetchDeleteFuenteIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-ingresos/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  }).then(res => res.json()) as Promise<FetchDeleteFuenteIngresosResponse>;
}
