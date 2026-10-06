// src\lib\fetch\conceptosIngresos.test.ts

import { describe, expect, it } from "vitest";
import { describeLlamadasBackend, mockFetch, TOKEN } from "@/test/backend";
import { fetchConceptosIngresos, fetchCopiarConceptosIngresosDelMesAnterior, fetchDeleteConceptoIngresos, fetchPostConceptoIngresos, fetchPutConceptoIngresos } from "@/lib/fetch/conceptosIngresos";

const fetchMock = mockFetch();

const concepto = { id_fuente_ingreso: "f1", periodo: "2026-05", valor: 1000 };

describeLlamadasBackend(fetchMock, [
  { nombre: "fetchConceptosIngresos", llamar: () => fetchConceptosIngresos({ token: TOKEN, periodo: "2026-05" }), metodo: "GET", ruta: "/conceptos-ingresos" },
  { nombre: "fetchPostConceptoIngresos", llamar: () => fetchPostConceptoIngresos({ token: TOKEN, data: concepto }), metodo: "POST", ruta: "/conceptos-ingresos", body: concepto },
  { nombre: "fetchPutConceptoIngresos", llamar: () => fetchPutConceptoIngresos({ token: TOKEN, id: "c1", data: concepto }), metodo: "PUT", ruta: "/conceptos-ingresos/c1", body: concepto },
  { nombre: "fetchDeleteConceptoIngresos", llamar: () => fetchDeleteConceptoIngresos({ token: TOKEN, id: "c1" }), metodo: "DELETE", ruta: "/conceptos-ingresos/c1" },
  { nombre: "fetchCopiarConceptosIngresosDelMesAnterior", llamar: () => fetchCopiarConceptosIngresosDelMesAnterior({ token: TOKEN, periodoDestino: "2026-05" }), metodo: "POST", ruta: "/conceptos-ingresos/copiar-periodo-anterior", body: { periodo_destino: "2026-05" } },
]);

describe("fetchConceptosIngresos", () => {
  it("envía el período en la query solo si se indica", async () => {
    await fetchConceptosIngresos({ token: TOKEN, periodo: "2026-05" });
    await fetchConceptosIngresos({ token: TOKEN });

    const [conPeriodo, sinPeriodo] = fetchMock.mock.calls.map(([url]) => new URL(url as string));
    expect(conPeriodo.searchParams.get("periodo")).toBe("2026-05");
    expect(sinPeriodo.searchParams.has("periodo")).toBe(false);
  });
});
