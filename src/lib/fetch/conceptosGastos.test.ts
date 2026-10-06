// src\lib\fetch\conceptosGastos.test.ts

import { describe, expect, it } from "vitest";
import { describeLlamadasBackend, mockFetch, TOKEN } from "@/test/backend";
import { fetchConceptosGastos, fetchCopiarConceptosGastosDelMesAnterior, fetchDeleteConceptoGastos, fetchPatchConceptoGastos, fetchPostConceptoGastos, fetchPutConceptoGastos } from "@/lib/fetch/conceptosGastos";

const fetchMock = mockFetch();

const concepto = { id_fuente_gasto: "f1", periodo: "2026-05", monto: -1, porcentaje_total: 5 };

describeLlamadasBackend(fetchMock, [
  { nombre: "fetchConceptosGastos", llamar: () => fetchConceptosGastos({ token: TOKEN, periodo: "2026-05" }), metodo: "GET", ruta: "/conceptos-gastos" },
  { nombre: "fetchPostConceptoGastos", llamar: () => fetchPostConceptoGastos({ token: TOKEN, data: concepto }), metodo: "POST", ruta: "/conceptos-gastos", body: concepto },
  { nombre: "fetchPutConceptoGastos", llamar: () => fetchPutConceptoGastos({ token: TOKEN, id: "c1", data: concepto }), metodo: "PUT", ruta: "/conceptos-gastos/c1", body: concepto },
  { nombre: "fetchPatchConceptoGastos", llamar: () => fetchPatchConceptoGastos({ token: TOKEN, id: "c1", data: { monto: 20, aclaracion: "Cuota 1" } }), metodo: "PATCH", ruta: "/conceptos-gastos/c1", body: { monto: 20, aclaracion: "Cuota 1" } },
  { nombre: "fetchDeleteConceptoGastos", llamar: () => fetchDeleteConceptoGastos({ token: TOKEN, id: "c1" }), metodo: "DELETE", ruta: "/conceptos-gastos/c1" },
  { nombre: "fetchCopiarConceptosGastosDelMesAnterior", llamar: () => fetchCopiarConceptosGastosDelMesAnterior({ token: TOKEN, periodoDestino: "2026-05" }), metodo: "POST", ruta: "/conceptos-gastos/copiar-periodo-anterior", body: { periodo_destino: "2026-05" } },
]);

describe("fetchConceptosGastos", () => {
  it("envía el período en la query solo si se indica", async () => {
    await fetchConceptosGastos({ token: TOKEN, periodo: "2026-05" });
    await fetchConceptosGastos({ token: TOKEN });

    const [conPeriodo, sinPeriodo] = fetchMock.mock.calls.map(([url]) => new URL(url as string));
    expect(conPeriodo.searchParams.get("periodo")).toBe("2026-05");
    expect(sinPeriodo.searchParams.has("periodo")).toBe(false);
  });
});

describe("fetchCopiarConceptosGastosDelMesAnterior", () => {
  it("devuelve la respuesta del backend", async () => {
    const respuesta = { statusCode: 201, data: [{ _id: "c1" }] };
    fetchMock.mockResolvedValueOnce(Response.json(respuesta));

    await expect(fetchCopiarConceptosGastosDelMesAnterior({ token: TOKEN, periodoDestino: "2026-05" })).resolves.toEqual(respuesta);
  });
});
