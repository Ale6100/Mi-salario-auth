// src\lib\fetch\conceptosGastos.ts

import type { ConceptoGastosDB, PATCHConceptoGastos, POSTConceptoGastos, PUTConceptoGastos } from "@/types/conceptosGastos";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetConceptosGastosParams = {
  sub: string;
  token: string;
  signal?: AbortSignal;
}

type FetchGetConceptosGastosResponse = ResponseBackend<ConceptoGastosDB[]>;

export const fetchConceptosGastos = async ({ sub, token, signal }: FetchGetConceptosGastosParams) => {
  const queryString = new URLSearchParams({ sub }).toString();

  return await fetch(`${VITE_BACKEND_URL}/conceptos-gastos?${queryString}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
    signal,
  }).then(res => res.json()) as Promise<FetchGetConceptosGastosResponse>;
}

type FetchPostConceptoGastosParams = {
  token: string;
  data: POSTConceptoGastos;
}

type FetchPostConceptoGastosResponse = ResponseBackend<ConceptoGastosDB>;

export const fetchPostConceptoGastos = async ({ token, data }: FetchPostConceptoGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-gastos`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPostConceptoGastosResponse>;
}

type FetchPutConceptoGastosParams = {
  token: string;
  id: string;
  data: PUTConceptoGastos;
}

type FetchPutConceptoGastosResponse = ResponseBackend<ConceptoGastosDB>;

export const fetchPutConceptoGastos = async ({ token, id, data }: FetchPutConceptoGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-gastos/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPutConceptoGastosResponse>;
}

type FetchPatchConceptoGastosParams = {
  token: string;
  id: string;
  data: PATCHConceptoGastos;
}

type FetchPatchConceptoGastosResponse = ResponseBackend<ConceptoGastosDB>;

export const fetchPatchConceptoGastos = async ({ token, id, data }: FetchPatchConceptoGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-gastos/${id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => res.json()) as Promise<FetchPatchConceptoGastosResponse>;
}

type FetchDeleteConceptoGastosParams = {
  token: string;
  id: string;
}

type FetchDeleteConceptoGastosResponse = ResponseBackend<null>;

export const fetchDeleteConceptoGastos = async ({ token, id }: FetchDeleteConceptoGastosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-gastos/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  }).then(res => res.json()) as Promise<FetchDeleteConceptoGastosResponse>;
}
