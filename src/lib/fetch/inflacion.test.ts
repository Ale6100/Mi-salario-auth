// src\lib\fetch\inflacion.test.ts

import { describe, expect, it, vi } from "vitest";
import { fetchInflacionMensual } from "@/lib/fetch/inflacion";

describe("fetchInflacionMensual", () => {
  it("devuelve la serie mensual cuando la respuesta es ok", async () => {
    const serie = [{ fecha: "2026-04-30", valor: 2.5 }];
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(Response.json(serie));
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchInflacionMensual()).resolves.toEqual(serie);
    expect(fetchMock).toHaveBeenCalledWith("https://api.argentinadatos.com/v1/finanzas/indices/inflacion", { signal: undefined });
  });

  it("lanza un error cuando la respuesta no es ok", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(fetchInflacionMensual()).rejects.toThrow("No se pudo obtener la inflación mensual");
  });
});
