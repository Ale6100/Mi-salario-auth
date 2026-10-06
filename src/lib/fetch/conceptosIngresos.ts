// src\lib\fetch\conceptosIngresos.ts

import type { ConceptoIngresosDB, POSTConceptoIngresos, PUTConceptoIngresos } from "@/types/conceptosIngresos";
import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

type FetchGetConceptosIngresosParams = {
  periodo?: string;
  token: string;
  signal?: AbortSignal;
}

type FetchGetConceptosIngresosResponse = ResponseBackend<ConceptoIngresosDB[]>;

export const fetchConceptosIngresos = async ({ periodo, token, signal }: FetchGetConceptosIngresosParams) => {
  const query = new URLSearchParams();
  if (periodo) {
    query.set("periodo", periodo);
  }

  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos?${query.toString()}`, {
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

type FetchCopiarConceptosIngresosParams = {
  token: string;
  periodoDestino: string;
}

type FetchCopiarConceptosIngresosResponse = ResponseBackend<ConceptoIngresosDB[]>;

export const fetchCopiarConceptosIngresosDelMesAnterior = async ({ token, periodoDestino }: FetchCopiarConceptosIngresosParams) => {
  return await fetch(`${VITE_BACKEND_URL}/conceptos-ingresos/copiar-periodo-anterior`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ periodo_destino: periodoDestino }),
  }).then(res => res.json()) as Promise<FetchCopiarConceptosIngresosResponse>;
}
