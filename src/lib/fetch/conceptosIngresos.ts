// src\lib\fetch\conceptosIngresos.ts

import type { ConceptoIngresosDB, POSTConceptoIngresos, PUTConceptoIngresos } from "@/types/conceptosIngresos";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetConceptosIngresosParams = {
  sub: string;
  token: string;
  signal?: AbortSignal;
}

type FetchGetConceptosIngresosResponse = ResponseBackend<ConceptoIngresosDB[]>;

export const fetchConceptosIngresos = async ({ sub, token, signal }: FetchGetConceptosIngresosParams) => {
  const queryString = new URLSearchParams({ sub }).toString();

  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos?${queryString}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetConceptosIngresosResponse>;
}

type FetchPostConceptoIngresosParams = {
  token: string;
  data: POSTConceptoIngresos;
}

type FetchPostConceptoIngresosResponse = ResponseBackend<ConceptoIngresosDB>;

export const fetchPostConceptoIngresos = async ({ token, data }: FetchPostConceptoIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPostConceptoIngresosResponse>;
}

type FetchPutConceptoIngresosParams = {
  token: string;
  id: string;
  data: PUTConceptoIngresos;
}

type FetchPutConceptoIngresosResponse = ResponseBackend<ConceptoIngresosDB>;

export const fetchPutConceptoIngresos = async ({ token, id, data }: FetchPutConceptoIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPutConceptoIngresosResponse>;
}

type FetchDeleteConceptoIngresosParams = {
  token: string;
  id: string;
}

type FetchDeleteConceptoIngresosResponse = ResponseBackend<null>;

export const fetchDeleteConceptoIngresos = async ({ token, id }: FetchDeleteConceptoIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  }).then(res => res.json()) as Promise<FetchDeleteConceptoIngresosResponse>;
}
