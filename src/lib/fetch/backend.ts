// src\lib\fetch\backend.ts

import type { ResponseBackend } from "@/types/global";

const { VITE_BACKEND_URL } = import.meta.env;

export const STATUS_SIN_CONEXION = 0;

type RequestBackendParams = {
  token: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export const requestBackend = async <T>(ruta: string, { token, method = "GET", body, signal }: RequestBackendParams): Promise<ResponseBackend<T>> => {
  const headers: HeadersInit = { "Authorization": `Bearer ${token}` };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${VITE_BACKEND_URL}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    return { statusCode: STATUS_SIN_CONEXION, message: "No se pudo conectar con el servidor" };
  }

  try {
    const json = await res.json() as ResponseBackend<T>;
    return { ...json, statusCode: json.statusCode ?? res.status };
  } catch {
    return { statusCode: res.status, message: res.statusText };
  }
}

export const esRespuestaExitosa = (response: ResponseBackend<unknown>) => response.statusCode >= 200 && response.statusCode < 300;

export class ErrorBackend extends Error {
  readonly statusCode: number;

  constructor(response: ResponseBackend<unknown>) {
    super(Array.isArray(response.message) ? response.message.join(", ") : response.message ?? "Error del servidor");
    this.statusCode = response.statusCode;
  }
}

export const getDataOrThrow = <T>(response: ResponseBackend<T>): T | undefined => {
  if (!esRespuestaExitosa(response)) throw new ErrorBackend(response);
  return response.data;
}
