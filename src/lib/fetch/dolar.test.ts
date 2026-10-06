// src\lib\fetch\dolar.test.ts

import { describe, expect, it, vi } from "vitest";
import { fetchCotizacionDolarMep } from "@/lib/fetch/dolar";

describe("fetchCotizacionDolarMep", () => {
  it("devuelve la cotización cuando la respuesta es ok", async () => {
    const cotizacion = { compra: 1000, venta: 1050, fechaActualizacion: "2026-05-15T12:00:00.000Z" };
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(cotizacion));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchCotizacionDolarMep()).resolves.toEqual(cotizacion);
    expect(fetchMock).toHaveBeenCalledWith("https://dolarapi.com/v1/dolares/bolsa", { signal: undefined });
  });

  it("lanza un error cuando la respuesta no es ok", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 })));

    await expect(fetchCotizacionDolarMep()).rejects.toThrow("No se pudo obtener la cotización del dólar");
  });
});
