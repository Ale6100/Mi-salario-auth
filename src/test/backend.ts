// src\test\backend.ts

import { beforeEach, describe, expect, it, vi } from "vitest";

export const TOKEN = "token-de-prueba";

export type LlamadaBackend = {
  nombre: string;
  llamar: () => Promise<unknown>;
  metodo: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  ruta: string;
  body?: unknown;
}

export const mockFetch = () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(() => Promise.resolve(Response.json({ statusCode: 200, data: [] })));
    vi.stubGlobal("fetch", fetchMock);
  });

  return fetchMock;
}

const getUnicaLlamada = (fetchMock: ReturnType<typeof mockFetch>) => {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, init] = fetchMock.mock.calls[0];
  return { url: new URL(url as string), init: init ?? {} };
}

/**
 * Verifica el contrato común de las llamadas al backend: URL y método, token en el header
 * Authorization y que el `sub` nunca viaje en la request (el backend lo toma del token).
 */
export const describeLlamadasBackend = (fetchMock: ReturnType<typeof mockFetch>, llamadas: LlamadaBackend[]) => {
  describe.each(llamadas)("$nombre", ({ llamar, metodo, ruta, body }) => {
    it(`hace ${metodo} a ${ruta} con el token en el header Authorization`, async () => {
      await llamar();
      const { url, init } = getUnicaLlamada(fetchMock);

      expect(url.origin + url.pathname).toBe(`https://backend.test${ruta}`);
      expect(init.method ?? "GET").toBe(metodo);
      expect(new Headers(init.headers).get("Authorization")).toBe(`Bearer ${TOKEN}`);
    });

    it("no envía el sub del usuario ni en la query ni en el body", async () => {
      await llamar();
      const { url, init } = getUnicaLlamada(fetchMock);

      expect(url.searchParams.has("sub")).toBe(false);
      if (typeof init.body === "string") {
        expect(JSON.parse(init.body)).not.toHaveProperty("sub");
      }
    });

    if (body === undefined) {
      it("no envía body", async () => {
        await llamar();
        const { init } = getUnicaLlamada(fetchMock);

        expect(init.body).toBeUndefined();
      });
    } else {
      it("envía el body esperado como JSON", async () => {
        await llamar();
        const { init } = getUnicaLlamada(fetchMock);

        expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
        expect(JSON.parse(init.body as string)).toEqual(body);
      });
    }
  });
}
