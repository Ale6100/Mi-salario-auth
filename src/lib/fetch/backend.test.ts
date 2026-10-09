// src\lib\fetch\backend.test.ts

import { describe, expect, it } from "vitest";
import { mockFetch, TOKEN } from "@/test/backend";
import { ErrorBackend, getDataOrThrow, requestBackend, STATUS_SIN_CONEXION } from "@/lib/fetch/backend";

const fetchMock = mockFetch();

describe("requestBackend", () => {
  it("devuelve el body de la respuesta", async () => {
    fetchMock.mockResolvedValue(Response.json({ statusCode: 201, data: { id: 1 } }, { status: 201 }));

    await expect(requestBackend("/ruta", { token: TOKEN })).resolves.toEqual({ statusCode: 201, data: { id: 1 } });
  });

  it("devuelve el mensaje de error del backend", async () => {
    fetchMock.mockResolvedValue(Response.json({ statusCode: 400, message: ["El monto no es válido"] }, { status: 400 }));

    await expect(requestBackend("/ruta", { token: TOKEN })).resolves.toEqual({ statusCode: 400, message: ["El monto no es válido"] });
  });

  it("prioriza el statusCode del body sobre el status HTTP", async () => {
    fetchMock.mockResolvedValue(Response.json({ statusCode: 404, message: "No encontrado" }, { status: 200 }));

    await expect(requestBackend("/ruta", { token: TOKEN })).resolves.toEqual({ statusCode: 404, message: "No encontrado" });
  });

  it("usa el status HTTP si el body JSON no trae statusCode", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Gateway Timeout" }, { status: 504 }));

    await expect(requestBackend("/ruta", { token: TOKEN })).resolves.toEqual({ statusCode: 504, message: "Gateway Timeout" });
  });

  it("no falla si la respuesta no es JSON", async () => {
    fetchMock.mockResolvedValue(new Response("<html>Bad Gateway</html>", { status: 502, statusText: "Bad Gateway" }));

    await expect(requestBackend("/ruta", { token: TOKEN })).resolves.toEqual({ statusCode: 502, message: "Bad Gateway" });
  });

  it("devuelve un error sin conexión si falla la red", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const response = await requestBackend("/ruta", { token: TOKEN });

    expect(response.statusCode).toBe(STATUS_SIN_CONEXION);
  });

  it("propaga la cancelación de la request", async () => {
    const controller = new AbortController();
    controller.abort();
    const abortError = new DOMException("Aborted", "AbortError");
    fetchMock.mockRejectedValue(abortError);

    await expect(requestBackend("/ruta", { token: TOKEN, signal: controller.signal })).rejects.toBe(abortError);
  });
});

describe("getDataOrThrow", () => {
  it("devuelve la data de una respuesta exitosa", () => {
    expect(getDataOrThrow({ statusCode: 200, data: [1, 2] })).toEqual([1, 2]);
  });

  it("lanza un ErrorBackend con el mensaje del backend si la respuesta no es exitosa", () => {
    expect(() => getDataOrThrow({ statusCode: 500, message: ["Error 1", "Error 2"] })).toThrow(expect.objectContaining({ statusCode: 500, message: "Error 1, Error 2" }));
    expect(() => getDataOrThrow({ statusCode: STATUS_SIN_CONEXION })).toThrow(ErrorBackend);
  });
});
