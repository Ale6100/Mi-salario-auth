// src\lib\fetch\fuentesGastos.ts

import type { FuenteGastosDB, POSTFuenteGastos, PUTFuenteGastos } from "@/types/fuentesGastos";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetFuentesGastosParams = {
  sub: string;
  token: string;
  signal?: AbortSignal;
};

type FetchGetFuentesGastosResponse = ResponseBackend<FuenteGastosDB[]>;

export const fetchFuentesGastos = async ({ sub, token, signal }: FetchGetFuentesGastosParams) => {
  const queryString = new URLSearchParams({ sub }).toString();

  return await fetch(`${VITE_BACKEND_URL}/fuentes-gastos?${queryString}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetFuentesGastosResponse>;
}

type FetchPostFuenteGastosParams = {
  token: string;
  data: POSTFuenteGastos;
}

type FetchPostFuenteGastosResponse = ResponseBackend<FuenteGastosDB>;

export const fetchPostFuenteGastos = async ({ token, data }: FetchPostFuenteGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-gastos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPostFuenteGastosResponse>;
}

type FetchPutFuenteGastosParams = {
  token: string;
  id: string;
  data: PUTFuenteGastos;
}

type FetchPutFuenteGastosResponse = ResponseBackend<FuenteGastosDB>;

export const fetchPutFuenteGastos = async ({ token, id, data }: FetchPutFuenteGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-gastos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPutFuenteGastosResponse>;
}

type FetchDeleteFuenteGastosParams = {
  token: string;
  id: string;
}

type FetchDeleteFuenteGastosResponse = ResponseBackend<null>;

export const fetchDeleteFuenteGastos = async ({ token, id }: FetchDeleteFuenteGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/fuentes-gastos/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  }).then(res => res.json()) as Promise<FetchDeleteFuenteGastosResponse>;
}
